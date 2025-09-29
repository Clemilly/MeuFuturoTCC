/**
 * Transactions header with real-time statistics and actions
 * Modern design with responsive layout
 */

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Filter,
  X,
  Eye,
  EyeOff,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TransactionStats } from "@/lib/types";

interface TransactionsHeaderProps {
  stats: TransactionStats;
  loading: boolean;
  onRefresh: () => void;
  onCreateTransaction: () => void;
  onCreateCategory: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export function TransactionsHeader({
  stats,
  loading,
  onRefresh,
  onCreateTransaction,
  onCreateCategory,
  hasActiveFilters,
  activeFiltersCount,
  onClearFilters,
}: TransactionsHeaderProps) {
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Calculate additional stats
  const totalTransactions = stats.total_income + stats.total_expenses;
  const expenseRatio =
    totalTransactions > 0
      ? (stats.total_expenses / totalTransactions) * 100
      : 0;
  const incomeRatio =
    totalTransactions > 0 ? (stats.total_income / totalTransactions) * 100 : 0;

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left side - Title and filters info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">Transações</h1>
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground text-sm">
              Gerencie suas receitas e despesas de forma inteligente
            </p>

            {/* Active filters indicator */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-8 px-3 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Toggle detailed stats */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              className="h-10 px-3"
            >
              {showDetailedStats ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="h-10 px-3"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  (loading || isRefreshing) && "animate-spin"
                )}
              />
            </Button>

            {/* Create category button */}
            <Button
              variant="outline"
              onClick={onCreateCategory}
              className="h-10 px-4"
            >
              <Tag className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>

            {/* Create transaction button */}
            <Button
              onClick={onCreateTransaction}
              className="h-10 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Statistics section */}
        <div className="mt-6 pt-6 border-t border-border/50">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Income */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Receitas
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.total_income)}
                  </p>
                  {showDetailedStats && (
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(stats.total_income, totalTransactions)}{" "}
                      do total
                    </p>
                  )}
                </div>
              </div>

              {/* Total Expenses */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Despesas
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.total_expenses)}
                  </p>
                  {showDetailedStats && (
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(
                        stats.total_expenses,
                        totalTransactions
                      )}{" "}
                      do total
                    </p>
                  )}
                </div>
              </div>

              {/* Net Amount */}
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl",
                    stats.net_amount >= 0 ? "bg-blue-100" : "bg-orange-100"
                  )}
                >
                  <DollarSign
                    className={cn(
                      "h-6 w-6",
                      stats.net_amount >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    )}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Saldo Líquido
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      stats.net_amount >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    )}
                  >
                    {formatCurrency(stats.net_amount)}
                  </p>
                  {showDetailedStats && (
                    <p className="text-xs text-muted-foreground">
                      {stats.transaction_count} transação
                      {stats.transaction_count !== 1 ? "ões" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed stats (when expanded) */}
          {showDetailedStats && !loading && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Valor Médio
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(stats.average_transaction)}
                  </p>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Receitas
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(stats.total_income)}
                  </p>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Despesas
                  </p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(stats.total_expenses)}
                  </p>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Saldo
                  </p>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      stats.net_amount >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    )}
                  >
                    {formatCurrency(stats.net_amount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
