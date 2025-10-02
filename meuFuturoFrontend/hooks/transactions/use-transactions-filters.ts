/**
 * Hook responsável APENAS por gerenciar estado dos filtros
 * NÃO faz: requisições, validações complexas
 */

import { useState, useCallback, useMemo } from 'react'

export interface FilterState {
  search: string
  type: 'all' | 'income' | 'expense'
  category: string
  dateRange: {
    start: Date | null
    end: Date | null
  }
  amountRange: {
    min: number | null
    max: number | null
  }
  sortBy: 'transaction_date' | 'amount' | 'description' | 'created_at'
  sortOrder: 'asc' | 'desc'
}

const initialState: FilterState = {
  search: '',
  type: 'all',
  category: 'all',
  dateRange: { start: null, end: null },
  amountRange: { min: null, max: null },
  sortBy: 'transaction_date',
  sortOrder: 'desc'
}

export function useTransactionsFilters() {
  const [filters, setFilters] = useState<FilterState>(initialState)

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    console.log('🔧 Updating filters:', newFilters)
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    console.log('🗑️ Clearing filters')
    setFilters(initialState)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.type !== 'all' ||
      filters.category !== 'all' ||
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null ||
      filters.amountRange.min !== null ||
      filters.amountRange.max !== null
    )
  }, [filters])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.type !== 'all') count++
    if (filters.category !== 'all') count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.amountRange.min !== null || filters.amountRange.max !== null) count++
    return count
  }, [filters])

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount
  }
}


