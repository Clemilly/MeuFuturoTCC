/**
 * Simplified hook for managing transactions list and filters
 * Clean implementation with manual filter application
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler'
import type { 
  Transaction, 
  TransactionCreate, 
  TransactionUpdate, 
  TransactionFilters, 
  PaginationInfo, 
  Category
} from '@/lib/types'

// Filter state interface
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

// Initial filter state
const initialFilterState: FilterState = {
  search: '',
  type: 'all',
  category: 'all',
  dateRange: {
    start: null,
    end: null
  },
  amountRange: {
    min: null,
    max: null
  },
  sortBy: 'transaction_date',
  sortOrder: 'desc'
}

// Initial pagination state
const initialPaginationState: PaginationInfo = {
  current_page: 1,
  page_size: 20,
  total_items: 0,
  total_pages: 0,
  has_next: false,
  has_previous: false
}

export function useTransactionsNew() {
  // States
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>(initialPaginationState)
  const [filters, setFilters] = useState<FilterState>(initialFilterState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()
  const { handleAuthError } = useAuthErrorHandler()

  // Convert filters to API format
  const convertFiltersToApiFormat = useCallback((filterState: FilterState, page: number = 1): TransactionFilters => {
    console.log('🔍 Converting filters to API format:', filterState)
    
    const apiFilters: TransactionFilters = {
      page,
      size: pagination.page_size,
      sort_by: filterState.sortBy,
      sort_order: filterState.sortOrder
    }

    if (filterState.search.trim()) {
      apiFilters.search = filterState.search.trim()
      console.log('  ✓ Search:', apiFilters.search)
    }

    if (filterState.type !== 'all') {
      apiFilters.transaction_type = filterState.type
      console.log('  ✓ Type:', apiFilters.transaction_type)
    }

    if (filterState.category !== 'all') {
      apiFilters.category_id = filterState.category
      console.log('  ✓ Category ID:', apiFilters.category_id)
    }

    if (filterState.dateRange.start && filterState.dateRange.end) {
      apiFilters.start_date = filterState.dateRange.start.toISOString().split('T')[0]
      apiFilters.end_date = filterState.dateRange.end.toISOString().split('T')[0]
      console.log('  ✓ Date range:', apiFilters.start_date, '-', apiFilters.end_date)
    }

    if (filterState.amountRange.min !== null) {
      apiFilters.min_amount = filterState.amountRange.min
      console.log('  ✓ Min amount:', apiFilters.min_amount)
    }

    if (filterState.amountRange.max !== null) {
      apiFilters.max_amount = filterState.amountRange.max
      console.log('  ✓ Max amount:', apiFilters.max_amount)
    }

    console.log('📤 Final API filters:', apiFilters)
    return apiFilters
  }, [pagination.page_size])

  // Load transactions
  const loadTransactions = useCallback(async (apiFilters: TransactionFilters) => {
    console.log('🔄 Loading transactions with filters:', apiFilters)
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getTransactions(apiFilters)
      console.log('📥 Response received:', response)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const data = response.data as any
        const transactionItems: Transaction[] = data.items || []
        
        console.log('✅ Transactions loaded:', transactionItems.length, 'items')
        
        setTransactions(transactionItems)
        setPagination({
          current_page: data.page || 1,
          page_size: data.size || 20,
          total_items: data.total || 0,
          total_pages: data.pages || 0,
          has_next: data.has_next || false,
          has_previous: data.has_previous || false,
          next_page: data.has_next ? (data.page || 1) + 1 : undefined,
          previous_page: data.has_previous ? (data.page || 1) - 1 : undefined
        })
      }
    } catch (err) {
      console.error('❌ Error loading transactions:', err)
      
      if (handleAuthError(err)) {
        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transações'
      setError(errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [handleAuthError, toast])

  // Load categories
  const loadCategories = useCallback(async () => {
    console.log('📂 Loading categories...')
    
    try {
      const response = await apiService.getCategories(true, true)
      
      if (response.error) {
        throw new Error(response.error)
      }

      const categoriesData = response.data as Category[] || []
      console.log('✅ Categories loaded:', categoriesData.length, 'items')
      setCategories(categoriesData)
    } catch (err) {
      console.error('❌ Error loading categories:', err)
      
      if (!handleAuthError(err)) {
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias",
          variant: "destructive"
        })
      }
    }
  }, [handleAuthError, toast])

  // Update filters (WITHOUT making request)
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    console.log('🔧 Updating filters (no request):', newFilters)
    setFilters(prev => {
      const updated = { ...prev, ...newFilters }
      console.log('  Updated filters:', updated)
      return updated
    })
  }, [])

  // Apply filters (MAKES request)
  const applyFilters = useCallback(() => {
    console.log('🎯 Applying filters (making request)...')
    console.log('  Current filter state:', filters)
    
    // Validate amount range
    if (filters.amountRange.min !== null && filters.amountRange.max !== null) {
      if (filters.amountRange.min > filters.amountRange.max) {
        toast({
          title: "Erro de validação",
          description: "O valor mínimo não pode ser maior que o máximo",
          variant: "destructive"
        })
        return
      }
    }

    // Convert and apply filters
    const apiFilters = convertFiltersToApiFormat(filters, 1)
    loadTransactions(apiFilters)
  }, [filters, convertFiltersToApiFormat, loadTransactions, toast])

  // Change page
  const changePage = useCallback((page: number) => {
    console.log('📄 Changing to page:', page)
    const apiFilters = convertFiltersToApiFormat(filters, page)
    loadTransactions(apiFilters)
  }, [filters, convertFiltersToApiFormat, loadTransactions])

  // Clear filters
  const clearFilters = useCallback(() => {
    console.log('🗑️ Clearing all filters...')
    setFilters(initialFilterState)
    
    const apiFilters: TransactionFilters = {
      page: 1,
      size: 20,
      sort_by: 'transaction_date',
      sort_order: 'desc'
    }
    
    loadTransactions(apiFilters)
  }, [loadTransactions])

  // Refresh current page
  const refresh = useCallback(() => {
    console.log('🔄 Refreshing current page...')
    const apiFilters = convertFiltersToApiFormat(filters, pagination.current_page)
    loadTransactions(apiFilters)
  }, [filters, pagination.current_page, convertFiltersToApiFormat, loadTransactions])

  // CRUD operations
  const createTransaction = useCallback(async (data: TransactionCreate): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.createTransaction(data)
      
      if (response.error) {
        return { success: false, error: response.error }
      }
      
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso"
      })
      
      // Refresh list
      refresh()
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar transação'
      return { success: false, error: errorMessage }
    }
  }, [toast, refresh])

  const updateTransaction = useCallback(async (
    id: string,
    data: TransactionUpdate
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.updateTransaction(id, data)
      
      if (response.error) {
        return { success: false, error: response.error }
      }
      
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso"
      })
      
      // Refresh list
      refresh()
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar transação'
      return { success: false, error: errorMessage }
    }
  }, [toast, refresh])

  const deleteTransaction = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.deleteTransaction(id)
      
      if (response.error) {
        return { success: false, error: response.error }
      }
      
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso"
      })
      
      // Refresh list
      refresh()
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir transação'
      return { success: false, error: errorMessage }
    }
  }, [toast, refresh])

  // Computed values
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

  // Load initial data
  useEffect(() => {
    console.log('🚀 Initial load...')
    loadCategories()
    
    const initialFilters: TransactionFilters = {
      page: 1,
      size: 20,
      sort_by: 'transaction_date',
      sort_order: 'desc'
    }
    
    loadTransactions(initialFilters)
  }, []) // Empty dependency array - only run once on mount

  return {
    // Data
    transactions,
    categories,
    pagination,
    filters,
    
    // Loading and error states
    loading,
    error,
    
    // Filter actions
    updateFilters,
    applyFilters,
    clearFilters,
    
    // Pagination
    changePage,
    
    // CRUD operations
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Utility actions
    refresh,
    
    // Computed values
    hasActiveFilters,
    activeFiltersCount
  }
}


