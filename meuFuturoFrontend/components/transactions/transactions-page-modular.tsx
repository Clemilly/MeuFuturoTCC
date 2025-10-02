/**
 * Página de transações usando sistema modular
 * Única fonte de verdade: useTransactionsOrchestrator
 */

"use client";

import { useState } from "react";
import { useTransactionsOrchestrator } from "@/hooks/transactions/use-transactions-orchestrator";
import { useCategories } from "@/hooks/use-categories";
import { TransactionsFiltersNew } from "./transactions-filters-new";
import { TransactionsPaginationNew } from "./transactions-pagination-new";
import { TransactionsListWrapper } from "./transactions-list-wrapper";
import { TransactionModals } from "./transaction-modals";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Plus, AlertCircle } from "lucide-react";
import type { ModalState, Transaction } from "@/lib/types";

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
  const { categories, loading: categoriesLoading } = useCategories();

  // Estado local apenas para modals (UI state)
  const [modals, setModals] = useState<ModalState>(initialModalState);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
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
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Atualizar
                </Button>
                <Button size="sm" onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
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
      </div>
    </div>
  );
}
