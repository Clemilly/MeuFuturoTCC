/**
 * Filtros inline para relatórios
 * Seguindo padrão da tela de transações (aplicação manual)
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Category } from "@/lib/types";
import type { ReportFilters } from "@/hooks/reports/use-reports-filters";

interface ReportsFiltersInlineProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading: boolean;
  categories: Category[];
  activeFiltersCount: number;
}

export function ReportsFiltersInline({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading,
  categories,
  activeFiltersCount,
}: ReportsFiltersInlineProps) {
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
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        {/* Filtros Principais (sempre visíveis) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <Select
              value={filters.period}
              onValueChange={(value: any) => onFiltersChange({ period: value })}
            >
              <SelectTrigger id="period" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Range de Datas */}
          <div className="space-y-2">
            <Label>Intervalo de Datas</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-10 justify-start text-left font-normal",
                    !filters.dateRange.start &&
                      !filters.dateRange.end &&
                      "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDateRange(
                    filters.dateRange.start,
                    filters.dateRange.end
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 space-y-3">
                  <div>
                    <Label className="text-xs">Data Início</Label>
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.start || undefined}
                      onSelect={(date) =>
                        onFiltersChange({
                          dateRange: {
                            ...filters.dateRange,
                            start: date || null,
                          },
                        })
                      }
                      locale={ptBR}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data Fim</Label>
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.end || undefined}
                      onSelect={(date) =>
                        onFiltersChange({
                          dateRange: {
                            ...filters.dateRange,
                            end: date || null,
                          },
                        })
                      }
                      locale={ptBR}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipos de Transação */}
          <div className="space-y-2">
            <Label>Tipos</Label>
            <div className="flex gap-2 h-10 items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="income"
                  checked={filters.transactionTypes.includes("income")}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...filters.transactionTypes, "income"]
                      : filters.transactionTypes.filter((t) => t !== "income");
                    onFiltersChange({ transactionTypes: newTypes as any });
                  }}
                />
                <label htmlFor="income" className="text-sm cursor-pointer">
                  Receitas
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expense"
                  checked={filters.transactionTypes.includes("expense")}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...filters.transactionTypes, "expense"]
                      : filters.transactionTypes.filter((t) => t !== "expense");
                    onFiltersChange({ transactionTypes: newTypes as any });
                  }}
                />
                <label htmlFor="expense" className="text-sm cursor-pointer">
                  Despesas
                </label>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2">
            <Label className="invisible">Ações</Label>
            <div className="flex gap-2 h-10">
              <Button
                onClick={onApplyFilters}
                disabled={loading}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClearFilters}
                  disabled={loading}
                  title="Limpar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Filtros Avançados */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 mr-2 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
            Filtros Avançados
          </Button>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} filtro(s) ativo(s)
            </Badge>
          )}
        </div>

        {/* Filtros Avançados (colapsáveis) */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Categorias */}
            <div className="space-y-2">
              <Label htmlFor="categories">Categorias</Label>
              <Select
                value={filters.categories[0] || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    categories: value === "all" ? [] : [value],
                  })
                }
              >
                <SelectTrigger id="categories" className="h-10">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valor Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="min-amount">Valor Mínimo</Label>
              <Input
                id="min-amount"
                type="number"
                step="0.01"
                min="0"
                value={filters.minAmount || ""}
                onChange={(e) =>
                  onFiltersChange({
                    minAmount: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="0.00"
                className="h-10"
              />
            </div>

            {/* Valor Máximo */}
            <div className="space-y-2">
              <Label htmlFor="max-amount">Valor Máximo</Label>
              <Input
                id="max-amount"
                type="number"
                step="0.01"
                min="0"
                value={filters.maxAmount || ""}
                onChange={(e) =>
                  onFiltersChange({
                    maxAmount: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="0.00"
                className="h-10"
              />
            </div>

            {/* Comparação de Períodos */}
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="comparison"
                checked={filters.comparisonPeriod}
                onCheckedChange={(checked) =>
                  onFiltersChange({ comparisonPeriod: !!checked })
                }
              />
              <label htmlFor="comparison" className="text-sm cursor-pointer">
                Ativar comparação entre períodos
              </label>
            </div>
          </div>
        )}

        {/* Resumo dos Filtros Ativos */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Filtros Ativos:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.dateRange.start && (
                <Badge variant="secondary" className="text-xs">
                  Desde:{" "}
                  {format(filters.dateRange.start, "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </Badge>
              )}
              {filters.dateRange.end && (
                <Badge variant="secondary" className="text-xs">
                  Até:{" "}
                  {format(filters.dateRange.end, "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </Badge>
              )}
              {filters.transactionTypes.length === 1 && (
                <Badge variant="secondary" className="text-xs">
                  Tipo:{" "}
                  {filters.transactionTypes[0] === "income"
                    ? "Receitas"
                    : "Despesas"}
                </Badge>
              )}
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.categories.length} categoria(s)
                </Badge>
              )}
              {filters.minAmount !== null && (
                <Badge variant="secondary" className="text-xs">
                  Min: R$ {filters.minAmount.toFixed(2)}
                </Badge>
              )}
              {filters.maxAmount !== null && (
                <Badge variant="secondary" className="text-xs">
                  Max: R$ {filters.maxAmount.toFixed(2)}
                </Badge>
              )}
              {filters.comparisonPeriod && (
                <Badge variant="secondary" className="text-xs">
                  Comparação Ativa
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



