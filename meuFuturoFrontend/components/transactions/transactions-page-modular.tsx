/**
 * Página de transações usando sistema modular
 * Única fonte de verdade: useTransactionsOrchestrator
 */

"use client";

import { useState } from "react";
import { useTransactionsOrchestrator } from "@/hooks/transactions/use-transactions-orchestrator";
import { useCategories } from "@/hooks/use-categories";
import { usePageRefresh } from "@/hooks/use-page-refresh";
import { TransactionsFiltersNew } from "./transactions-filters-new";
import { TransactionsPaginationNew } from "./transactions-pagination-new";
import { TransactionsListWrapper } from "./transactions-list-wrapper";
import { TransactionModals } from "./transaction-modals";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MaterialIcon } from "@/lib/material-icons";
import type { ModalState, Transaction } from "@/lib/types";
import { CreateCategoryModal } from "@/components/categories/CreateCategoryModal";

const initialModalState: ModalState = {
  isCreateOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,
  isDetailsOpen: false,
  selectedTransaction: null,
};

export function TransactionsPageModular() {
  // Hook orquestrador - única fonte de verdade
  const {
    transactions,
    filters,
    pagination,
    loading,
    error,
    updateFilters,
    applyFilters,
    clearFilters,
    activeFiltersCount,
    changePage,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refresh,
  } = useTransactionsOrchestrator();

  // Hook de categorias (independente)
  const { categories, loading: categoriesLoading, refreshCategories } = useCategories();

  // Estado local apenas para modals (UI state)
  const [modals, setModals] = useState<ModalState>(initialModalState);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  // Hook para recarregar dados após refresh e salvar/restaurar filtros
  usePageRefresh({
    onRefresh: async () => {
      // Recarregar transações e categorias após refresh
      await refresh();
      await refreshCategories();
    },
    stateKey: 'transactions-page',
    onSaveState: () => {
      // Salvar filtros e paginação atuais
      return {
        filters: filters,
        pagination: {
          current_page: pagination.current_page,
          page_size: pagination.page_size,
        },
      };
    },
    onRestoreState: (savedState) => {
      // Restaurar filtros e paginação
      if (savedState.filters) {
        updateFilters(savedState.filters);
      }
      if (savedState.pagination) {
        changePage(savedState.pagination.current_page);
      }
    },
  });

  // Modal handlers
  const openCreateModal = () => {
    console.log("➕ Opening create modal");
    setModals({ ...initialModalState, isCreateOpen: true });
  };

  const openEditModal = (transaction: Transaction) => {
    console.log("✏️ Opening edit modal for:", transaction.id);
    setModals({
      ...initialModalState,
      isEditOpen: true,
      selectedTransaction: transaction,
    });
  };

  const openDeleteModal = (transaction: Transaction) => {
    console.log("🗑️ Opening delete modal for:", transaction.id);
    setModals({
      ...initialModalState,
      isDeleteOpen: true,
      selectedTransaction: transaction,
    });
  };

  const openDetailsModal = (transaction: Transaction) => {
    console.log("👁️ Opening details modal for:", transaction.id);
    setModals({
      ...initialModalState,
      isDetailsOpen: true,
      selectedTransaction: transaction,
    });
  };

  const closeAllModals = () => {
    console.log("❌ Closing all modals");
    setModals(initialModalState);
  };

  const duplicateTransaction = (transaction: Transaction) => {
    console.log("📋 Duplicating transaction:", transaction.id);
    createTransaction({
      type: transaction.type,
      amount: transaction.amount,
      description: `${transaction.description} (cópia)`,
      transaction_date: new Date().toISOString().split("T")[0],
      notes: transaction.notes,
      category_id: transaction.category?.id,
    });
  };

  const handleCategoryCreated = async (category: any) => {
    console.log("✅ Category created successfully", category);
    setIsCreateCategoryOpen(false);
    
    // Recarregar categorias para atualizar todos os selects e filtros
    // Isso garante que a nova categoria apareça imediatamente em todos os lugares
    await refreshCategories();
    
    // Nota: Os filtros e seleções são mantidos automaticamente porque
    // não estamos recarregando a página, apenas atualizando os dados
    console.log("✅ Categories refreshed - filters and selections preserved");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Transações</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie suas receitas e despesas
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                >
                  <MaterialIcon 
                    name="refresh" 
                    size={16} 
                    className={`mr-2 ${loading ? "animate-spin" : ""}`}
                    aria-label="Atualizar"
                  />
                  Atualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateCategoryOpen(true)}
                >
                  <MaterialIcon name="folder-plus" size={16} className="mr-2" aria-label="Nova categoria" />
                  Nova Categoria
                </Button>
                <Button size="sm" onClick={openCreateModal}>
                  <MaterialIcon name="plus" size={16} className="mr-2" aria-label="Nova transação" />
                  Nova Transação
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <MaterialIcon name="alert-circle" size={16} aria-label="Erro" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros */}
        <TransactionsFiltersNew
          filters={filters}
          onFiltersChange={updateFilters}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          loading={loading}
          categories={categories}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Lista */}
        <TransactionsListWrapper
          transactions={transactions}
          loading={loading}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onViewDetails={openDetailsModal}
          onDuplicate={duplicateTransaction}
        />

        {/* Paginação */}
        <TransactionsPaginationNew
          pagination={pagination}
          onPageChange={changePage}
          loading={loading}
        />

        {/* Modals */}
        <TransactionModals
          modals={modals}
          onClose={closeAllModals}
          onCreateTransaction={createTransaction}
          onUpdateTransaction={updateTransaction}
          onDeleteTransaction={deleteTransaction}
          categories={categories}
          loading={loading}
          categoriesLoading={categoriesLoading}
        />

        {/* Create Category Modal */}
        <CreateCategoryModal
          isOpen={isCreateCategoryOpen}
          onClose={() => setIsCreateCategoryOpen(false)}
          onSuccess={handleCategoryCreated}
        />
      </div>
    </div>
  );
}




