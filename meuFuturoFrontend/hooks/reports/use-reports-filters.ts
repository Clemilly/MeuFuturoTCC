/**
 * Hook responsável APENAS por gerenciar filtros de relatórios
 * Seguindo padrão da tela de transações
 */

import { useState, useCallback, useMemo } from 'react'

export interface ReportFilters {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  categories: string[]
  transactionTypes: ('income' | 'expense')[]
  comparisonPeriod: boolean
  minAmount: number | null
  maxAmount: number | null
}

// Helper function to get default date range (last 6 months)
const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 6)
  return { start, end }
}

const initialFilters: ReportFilters = {
  dateRange: getDefaultDateRange(),
  period: 'monthly',
  categories: [],
  transactionTypes: ['income', 'expense'],
  comparisonPeriod: false,
  minAmount: null,
  maxAmount: null
}

export function useReportsFilters() {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters)

  const updateFilters = useCallback((newFilters: Partial<ReportFilters>) => {
    console.log('📊 Updating report filters:', newFilters)
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    console.log('🗑️ Clearing report filters')
    setFilters({
      dateRange: getDefaultDateRange(),
      period: 'monthly',
      categories: [],
      transactionTypes: ['income', 'expense'],
      comparisonPeriod: false,
      minAmount: null,
      maxAmount: null
    })
  }, [])

  const hasActiveFilters = useMemo(() => {
    const defaultRange = getDefaultDateRange()
    const hasCustomDateRange = 
      (filters.dateRange.start && filters.dateRange.start.getTime() !== defaultRange.start.getTime()) ||
      (filters.dateRange.end && filters.dateRange.end.getTime() !== defaultRange.end.getTime())
    
    return (
      hasCustomDateRange ||
      filters.categories.length > 0 ||
      filters.transactionTypes.length !== 2 ||
      filters.comparisonPeriod ||
      filters.minAmount !== null ||
      filters.maxAmount !== null
    )
  }, [filters])

  const activeFiltersCount = useMemo(() => {
    const defaultRange = getDefaultDateRange()
    let count = 0
    
    // Only count date range if it's different from default
    const hasCustomDateRange = 
      (filters.dateRange.start && filters.dateRange.start.getTime() !== defaultRange.start.getTime()) ||
      (filters.dateRange.end && filters.dateRange.end.getTime() !== defaultRange.end.getTime())
    
    if (hasCustomDateRange) count++
    if (filters.categories.length > 0) count++
    if (filters.transactionTypes.length !== 2) count++
    if (filters.comparisonPeriod) count++
    if (filters.minAmount !== null || filters.maxAmount !== null) count++
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

