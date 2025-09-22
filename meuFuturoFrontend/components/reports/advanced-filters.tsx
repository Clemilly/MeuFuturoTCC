"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Filter, X } from 'lucide-react'
import type { AdvancedFiltersProps, ReportFilters, Granularity } from '@/lib/types'

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  categories, 
  loadingCategories 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      granularity: 'monthly'
    })
  }

  const hasActiveFilters = () => {
    return !!(
      filters.start_date || 
      filters.end_date || 
      filters.transaction_type || 
      filters.category_ids?.length ||
      filters.min_amount ||
      filters.max_amount
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Período Personalizado */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Data de Início</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Data de Fim</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
                className="h-10"
              />
            </div>

            {/* Granularidade */}
            <div className="space-y-2">
              <Label htmlFor="granularity">Granularidade</Label>
              <Select
                value={filters.granularity || 'monthly'}
                onValueChange={(value: Granularity) => handleFilterChange('granularity', value)}
              >
                <SelectTrigger id="granularity" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Transação */}
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Tipo de Transação</Label>
              <Select
                value={filters.transaction_type || 'all'}
                onValueChange={(value) => handleFilterChange('transaction_type', value === 'all' ? undefined : value)}
              >
                <SelectTrigger id="transaction-type" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categorias */}
            <div className="space-y-2">
              <Label htmlFor="categories">Categorias</Label>
              <Select
                value={filters.category_ids?.[0] || 'all'}
                onValueChange={(value) => handleFilterChange('category_ids', value === 'all' ? undefined : [value])}
                disabled={loadingCategories}
              >
                <SelectTrigger id="categories" className="h-10">
                  <SelectValue placeholder={loadingCategories ? "Carregando..." : "Selecionar categoria"} />
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
                value={filters.min_amount || ''}
                onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
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
                value={filters.max_amount || ''}
                onChange={(e) => handleFilterChange('max_amount', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0.00"
                className="h-10"
              />
            </div>
          </div>

          {/* Resumo dos Filtros Ativos */}
          {hasActiveFilters() && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Filtros Ativos:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.start_date && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Desde: {new Date(filters.start_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {filters.end_date && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Até: {new Date(filters.end_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {filters.transaction_type && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Tipo: {filters.transaction_type === 'income' ? 'Receitas' : 'Despesas'}
                  </span>
                )}
                {filters.category_ids?.length && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Categorias: {filters.category_ids.length}
                  </span>
                )}
                {filters.min_amount && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Min: R$ {filters.min_amount.toFixed(2)}
                  </span>
                )}
                {filters.max_amount && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Max: R$ {filters.max_amount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

