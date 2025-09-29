/**
 * Main transactions page with simplified layout
 * Clean, modern design with optimal performance
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { TransactionsHeader } from "./transactions-header";
import { TransactionsFilters } from "./transactions-filters";
import { TransactionsListWrapper } from "./transactions-list-wrapper";
import { TransactionsPagination } from "./transactions-pagination";
import { TransactionModals } from "./transaction-modals";
import { CreateCategoryModal } from "@/components/categories/CreateCategoryModal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

// Loading skeleton component
function TransactionsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* List skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Offline indicator component
function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        Você está offline. As alterações serão sincronizadas quando a conexão
        for restaurada.
      </AlertDescription>
    </Alert>
  );
}

// Online indicator component
function OnlineIndicator({ isOnline }: { isOnline: boolean }) {
  // Don't show anything when online - only show offline status
  return null;
}

// Error boundary component
function TransactionsError({
  error,
  onRetry,
}: {
  error: { message: string; retryable: boolean };
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Erro ao carregar transações
        </h3>
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          {error.message}
        </p>
        {error.retryable && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// Main transactions page component
export function TransactionsPage() {
  const {
    transactions,
    categories,
    pagination,
    stats,
    filters,
    modals,
    loading,
    error,
    isOnline,
    hasActiveFilters,
    activeFiltersCount,
    updateFilters,
    clearFilters,
    refresh,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openDetailsModal,
    closeAllModals,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
  } = useTransactions();

  const { createCategory } = useCategories();
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);

  // Handle retry
  const handleRetry = () => {
    refresh();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateFilters({});
    // The hook will handle the page change through the API call
  };

  // Handle create category
  const handleCreateCategory = () => {
    setIsCreateCategoryModalOpen(true);
  };

  // Handle category creation success
  const handleCategoryCreated = async (category: any) => {
    // The createCategory function from the hook already handles adding to the list
    // and showing success toast, so we just close the modal
    setIsCreateCategoryModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Online/Offline indicators */}
        <OfflineIndicator isOnline={isOnline} />
        <OnlineIndicator isOnline={isOnline} />

        {/* Header with stats and actions */}
        <TransactionsHeader
          stats={stats}
          loading={loading.stats}
          onRefresh={refresh}
          onCreateTransaction={openCreateModal}
          onCreateCategory={handleCreateCategory}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={clearFilters}
        />

        {/* Filters */}
        <TransactionsFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          loading={false}
          categories={categories}
        />

        {/* Main content */}
        <div className="space-y-6">
          {/* Error state */}
          {error.message && (
            <TransactionsError error={error} onRetry={handleRetry} />
          )}

          {/* Transactions list - always show */}
          <TransactionsListWrapper
            transactions={transactions}
            loading={loading.transactions}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onViewDetails={openDetailsModal}
            onDuplicate={duplicateTransaction}
          />

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <TransactionsPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              loading={loading.transactions}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionModals
        modals={modals}
        onClose={closeAllModals}
        onCreateTransaction={createTransaction}
        onUpdateTransaction={updateTransaction}
        onDeleteTransaction={deleteTransaction}
        categories={categories}
        loading={loading.saving || loading.deleting}
        categoriesLoading={loading.categories}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onSuccess={handleCategoryCreated}
      />
    </div>
  );
}
