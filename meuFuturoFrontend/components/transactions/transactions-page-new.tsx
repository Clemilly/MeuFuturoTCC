/**
 * Simplified transactions page component
 * Clean implementation with manual filter application
 */

"use client";

import { useState } from "react";
import { useTransactionsNew } from "@/hooks/use-transactions-new";
import { useCategories } from "@/hooks/use-categories";
import { TransactionsFiltersNew } from "./transactions-filters-new";
import { TransactionsListWrapper } from "./transactions-list-wrapper";
import { TransactionsPaginationNew } from "./transactions-pagination-new";
import { TransactionModals } from "./transaction-modals";
import { CreateCategoryModal } from "@/components/categories/CreateCategoryModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Plus, AlertCircle, WifiOff } from "lucide-react";
import type { Transaction, ModalState } from "@/lib/types";

// Initial modal state
const initialModalState: ModalState = {
  isCreateOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,
  isDetailsOpen: false,
  selectedTransaction: null,
};

export function TransactionsPageNew() {
  const {
    transactions,
    categories,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    applyFilters,
    clearFilters,
    changePage,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refresh,
    hasActiveFilters,
    activeFiltersCount,
  } = useTransactionsNew();

  const { createCategory } = useCategories();

  const [modals, setModals] = useState<ModalState>(initialModalState);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);

  // Modal actions
  const openCreateModal = () => {
    setModals({
      ...initialModalState,
      isCreateOpen: true,
    });
  };

  const openEditModal = (transaction: Transaction) => {
    setModals({
      ...initialModalState,
      isEditOpen: true,
      selectedTransaction: transaction,
    });
  };

  const openDeleteModal = (transaction: Transaction) => {
    setModals({
      ...initialModalState,
      isDeleteOpen: true,
      selectedTransaction: transaction,
    });
  };

  const openDetailsModal = (transaction: Transaction) => {
    setModals({
      ...initialModalState,
      isDetailsOpen: true,
      selectedTransaction: transaction,
    });
  };

  const closeAllModals = () => {
    setModals(initialModalState);
  };

  const duplicateTransaction = (transaction: Transaction) => {
    const duplicateData = {
      type: transaction.type,
      amount: transaction.amount,
      description: `${transaction.description} (cópia)`,
      transaction_date: new Date().toISOString().split("T")[0],
      notes: transaction.notes,
      category_id: transaction.category?.id,
    };

    createTransaction(duplicateData);
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

              <div className="flex items-center gap-2">
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

        {/* Filters */}
        <TransactionsFiltersNew
          filters={filters}
          onFiltersChange={updateFilters}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          loading={loading}
          categories={categories}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Transactions list */}
        <TransactionsListWrapper
          transactions={transactions}
          loading={loading}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onViewDetails={openDetailsModal}
          onDuplicate={duplicateTransaction}
        />

        {/* Pagination */}
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
          categoriesLoading={false}
        />

        {/* Create Category Modal */}
        <CreateCategoryModal
          isOpen={isCreateCategoryModalOpen}
          onClose={() => setIsCreateCategoryModalOpen(false)}
          onSuccess={() => {
            setIsCreateCategoryModalOpen(false);
            refresh();
          }}
        />
      </div>
    </div>
  );
}

