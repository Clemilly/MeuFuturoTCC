/**
 * Simplified transactions filters component
 * Clean implementation with manual filter application
 */

"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Category } from "@/lib/types";
import type { FilterState } from "@/hooks/transactions/use-transactions-filters";

interface TransactionsFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading: boolean;
  categories: Category[];
  activeFiltersCount: number;
}

export function TransactionsFiltersNew({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading,
  categories,
  activeFiltersCount,
}: TransactionsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date range for display
  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "Selecionar período";

    const startFormatted = format(start, "dd/MM", { locale: ptBR });
    const endFormatted = format(end, "dd/MM/yyyy", { locale: ptBR });

    if (start.toDateString() === end.toDateString()) {
      return startFormatted;
    }

    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main filters row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10"
                disabled={loading}
              />
            </div>

            {/* Transaction type */}
            <Select
              value={filters.type}
              onValueChange={(value: "all" | "income" | "expense") =>
                onFiltersChange({ type: value })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Todos os tipos
                  </div>
                </SelectItem>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Receitas
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Despesas
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Date range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                  disabled={loading}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDateRange(
                    filters.dateRange.start,
                    filters.dateRange.end
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Período personalizado
                    </Label>
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: filters.dateRange.start || undefined,
                        to: filters.dateRange.end || undefined,
                      }}
                      onSelect={(range) => {
                        onFiltersChange({
                          dateRange: {
                            start: range?.from ?? null,
                            end: range?.to ?? null,
                          },
                        });
                      }}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Amount range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                  disabled={loading}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {filters.amountRange.min !== null ||
                  filters.amountRange.max !== null
                    ? `R$ ${filters.amountRange.min || 0} - R$ ${
                        filters.amountRange.max || "∞"
                      }`
                    : "Qualquer valor"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Valor personalizado
                  </Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Valor mínimo
                      </Label>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={filters.amountRange.min || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseFloat(e.target.value)
                            : null;
                          onFiltersChange({
                            amountRange: {
                              ...filters.amountRange,
                              min: value,
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Valor máximo
                      </Label>
                      <Input
                        type="number"
                        placeholder="1000,00"
                        value={filters.amountRange.max || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseFloat(e.target.value)
                            : null;
                          onFiltersChange({
                            amountRange: {
                              ...filters.amountRange,
                              max: value,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Advanced filters (collapsible) */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 mr-1 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
              Filtros avançados
            </Button>

            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                {/* Category filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categoria</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      onFiltersChange({ category: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Todas as categorias
                        </div>
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort by */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ordenar por</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: any) =>
                      onFiltersChange({ sortBy: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transaction_date">
                        Data da transação
                      </SelectItem>
                      <SelectItem value="amount">Valor</SelectItem>
                      <SelectItem value="description">Descrição</SelectItem>
                      <SelectItem value="created_at">
                        Data de criação
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort order */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ordem</Label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value: "asc" | "desc") =>
                      onFiltersChange({ sortOrder: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Decrescente</SelectItem>
                      <SelectItem value="asc">Crescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {activeFiltersCount} filtro
                    {activeFiltersCount > 1 ? "s" : ""} ativo
                    {activeFiltersCount > 1 ? "s" : ""}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    {activeFiltersCount}
                  </Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  console.log("🎯 Filtrar button clicked");
                  onApplyFilters();
                }}
                disabled={loading}
                className="h-9 px-4"
              >
                <Filter className="h-4 w-4 mr-2" />
                {loading ? "Filtrando..." : "Filtrar"}
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  disabled={loading}
                  className="h-9 px-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
