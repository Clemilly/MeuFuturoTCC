/**
 * Intelligent transactions filters with debounced search and presets
 * Compact, responsive design with advanced filtering options
 */

"use client"

import { useState, useMemo, useCallback } from 'react'
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Tag, 
  X, 
  ChevronDown,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Category } from '@/lib/types'
import type { FilterState } from '@/hooks/use-transactions'

interface TransactionsFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: Partial<FilterState>) => void
  onClearFilters: () => void
  loading: boolean
  categories: Category[]
}

// Date range presets
const datePresets = [
  {
    label: 'Hoje',
    value: 'today',
    getDates: () => {
      const today = new Date()
      return {
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      }
    }
  },
  {
    label: 'Esta semana',
    value: 'thisWeek',
    getDates: () => {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      return { start: startOfWeek, end: endOfWeek }
    }
  },
  {
    label: 'Este mês',
    value: 'thisMonth',
    getDates: () => {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      return { start: startOfMonth, end: endOfMonth }
    }
  },
  {
    label: 'Últimos 30 dias',
    value: 'last30Days',
    getDates: () => {
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)
      thirtyDaysAgo.setHours(0, 0, 0, 0)
      return { start: thirtyDaysAgo, end: today }
    }
  },
  {
    label: 'Este ano',
    value: 'thisYear',
    getDates: () => {
      const today = new Date()
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59)
      return { start: startOfYear, end: endOfYear }
    }
  }
]

// Amount presets
const amountPresets = [
  { label: 'Até R$ 50', value: 'low', min: 0, max: 50 },
  { label: 'R$ 50 - R$ 200', value: 'medium', min: 50, max: 200 },
  { label: 'R$ 200 - R$ 500', value: 'high', min: 200, max: 500 },
  { label: 'Acima de R$ 500', value: 'veryHigh', min: 500, max: 10000 },
  { label: 'Personalizado', value: 'custom', min: null, max: null }
]

export function TransactionsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  loading,
  categories
}: TransactionsFiltersProps) {
  console.log('🔍 DEBUG: TransactionsFilters render - categories count:', categories?.length || 0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search)
  
  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    console.log('🔍 DEBUG: handleSearchChange called with:', value)
    setSearchValue(value)
    onFiltersChange({ search: value })
  }
  
  // Handle date range preset
  const handleDatePreset = (preset: string) => {
    const presetData = datePresets.find(p => p.value === preset)
    if (presetData) {
      const { start, end } = presetData.getDates()
      onFiltersChange({ 
        dateRange: { start, end } 
      })
    }
  }
  
  // Handle amount preset
  const handleAmountPreset = (preset: string) => {
    const presetData = amountPresets.find(p => p.value === preset)
    if (presetData) {
      onFiltersChange({ 
        amountRange: { 
          min: presetData.min, 
          max: presetData.max 
        } 
      })
    }
  }

  // Format date range for display
  const formatDateRange = (start: Date | null | undefined, end: Date | null | undefined) => {
    if (!start || !end) return 'Selecionar período'
    
    const startFormatted = format(start, 'dd/MM', { locale: ptBR })
    const endFormatted = format(end, 'dd/MM/yyyy', { locale: ptBR })
    
    if (start.toDateString() === end.toDateString()) {
      return startFormatted
    }
    
    return `${startFormatted} - ${endFormatted}`
  }
  
  // Format amount range for display
  const formatAmountRange = (min: number | null, max: number | null) => {
    if (min === null && max === null) return 'Qualquer valor'
    if (min === null) return `Até R$ ${max?.toFixed(2)}`
    if (max === null) return `Acima de R$ ${min.toFixed(2)}`
    if (min === max) return `R$ ${min.toFixed(2)}`
    return `R$ ${min.toFixed(2)} - R$ ${max.toFixed(2)}`
  }
  
  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.type !== 'all' ||
      filters.category !== 'all' ||
      (filters.dateRange?.start !== null) ||
      (filters.dateRange?.end !== null) ||
      filters.amountRange.min !== null ||
      filters.amountRange.max !== null
    )
  }, [filters])

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.type !== 'all') count++
    if (filters.category !== 'all') count++
    if (filters.dateRange?.start || filters.dateRange?.end) count++
    if (filters.amountRange.min !== null || filters.amountRange.max !== null) count++
    return count
  }, [filters])

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main filters row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={false}
              />
            </div>
            
            {/* Transaction type */}
            <Select
              value={filters.type}
              onValueChange={(value: 'all' | 'income' | 'expense') => {
                console.log('🔍 DEBUG: Type filter changed to:', value)
                onFiltersChange({ type: value })
              }}
              disabled={false}
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
                  disabled={false}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDateRange(filters.dateRange?.start, filters.dateRange?.end)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  {/* Date presets */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Períodos rápidos</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {datePresets.map((preset) => (
                        <Button
                          key={preset.value}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDatePreset(preset.value)}
                          className="justify-start text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom date range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Período personalizado</Label>
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: filters.dateRange?.start || undefined,
                        to: filters.dateRange?.end || undefined
                      }}
                      onSelect={(range) => {
                        const newDateRange = {
                          start: range?.from ?? null,
                          end: range?.to ?? null
                        }
                        onFiltersChange({
                          dateRange: newDateRange
                        })
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
                  disabled={false}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {formatAmountRange(filters.amountRange.min, filters.amountRange.max)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  {/* Amount presets */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Valores rápidos</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {amountPresets.map((preset) => (
                        <Button
                          key={preset.value}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAmountPreset(preset.value)}
                          className="justify-start text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {preset.label}
                        </Button>
                      ))}
                    </div>
            </div>
                  
                  {/* Custom amount range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Valor personalizado</Label>
            <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Valor mínimo</Label>
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={filters.amountRange.min || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : null
                            onFiltersChange({
                              amountRange: { ...filters.amountRange, min: value }
                            })
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Valor máximo</Label>
                        <Input
                          type="number"
                          placeholder="1000,00"
                          value={filters.amountRange.max || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : null
                            onFiltersChange({
                              amountRange: { ...filters.amountRange, max: value }
                            })
                          }}
                        />
                      </div>
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
              <ChevronDown className={cn(
                "h-4 w-4 mr-1 transition-transform",
                isExpanded && "rotate-180"
              )} />
              Filtros avançados
            </Button>
            
            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                {/* Category filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categoria</Label>
              <Select 
                value={filters.category} 
                    onValueChange={(value) => {
                      onFiltersChange({ category: value })
                    }}
                    disabled={false}
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
                    onValueChange={(value: any) => onFiltersChange({ sortBy: value })}
                    disabled={false}
                >
                    <SelectTrigger>
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="transaction_date">Data da transação</SelectItem>
                    <SelectItem value="amount">Valor</SelectItem>
                    <SelectItem value="description">Descrição</SelectItem>
                      <SelectItem value="created_at">Data de criação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
                {/* Sort order */}
              <div className="space-y-2">
                  <Label className="text-sm font-medium">Ordem</Label>
                <Select 
                  value={filters.sortOrder} 
                    onValueChange={(value: 'asc' | 'desc') => onFiltersChange({ sortOrder: value })}
                    disabled={false}
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
          
          {/* Active filters and clear button */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
                </span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {activeFiltersCount}
                </Badge>
              </div>
              
                    <Button
                variant="outline"
                      size="sm"
                onClick={onClearFilters}
                className="h-8 px-3 text-xs"
                    >
                <X className="h-3 w-3 mr-1" />
                Limpar todos
                    </Button>
            </div>
          )}
            </div>
          </CardContent>
        </Card>
  )
}