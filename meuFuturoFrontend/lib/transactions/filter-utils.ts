/**
 * Utilitários para conversão e manipulação de filtros
 */

import type { TransactionFilters } from '@/lib/types'
import type { FilterState } from '@/hooks/transactions/use-transactions-filters'

/**
 * Converte FilterState (frontend) para TransactionFilters (API)
 */
export function convertFiltersToApi(
  filters: FilterState,
  page: number = 1,
  pageSize: number = 20
): TransactionFilters {
  console.log('🔄 Converting filters to API format')
  
  const apiFilters: TransactionFilters = {
    page,
    size: pageSize,
    sort_by: filters.sortBy,
    sort_order: filters.sortOrder
  }

  if (filters.search.trim()) {
    apiFilters.search = filters.search.trim()
    console.log('  ✓ Search:', apiFilters.search)
  }

  if (filters.type !== 'all') {
    apiFilters.transaction_type = filters.type
    console.log('  ✓ Type:', apiFilters.transaction_type)
  }

  if (filters.category !== 'all') {
    apiFilters.category_id = filters.category
    console.log('  ✓ Category:', apiFilters.category_id)
  }

  if (filters.dateRange.start && filters.dateRange.end) {
    apiFilters.start_date = filters.dateRange.start.toISOString().split('T')[0]
    apiFilters.end_date = filters.dateRange.end.toISOString().split('T')[0]
    console.log('  ✓ Date range:', apiFilters.start_date, '-', apiFilters.end_date)
  }

  if (filters.amountRange.min !== null) {
    apiFilters.min_amount = filters.amountRange.min
    console.log('  ✓ Min amount:', apiFilters.min_amount)
  }
  if (filters.amountRange.max !== null) {
    apiFilters.max_amount = filters.amountRange.max
    console.log('  ✓ Max amount:', apiFilters.max_amount)
  }

  console.log('📤 Final API filters:', apiFilters)
  return apiFilters
}

/**
 * Cria filtros padrão iniciais
 */
export function createDefaultFilters(page: number = 1, pageSize: number = 20): TransactionFilters {
  return {
    page,
    size: pageSize,
    sort_by: 'transaction_date',
    sort_order: 'desc'
  }
}




