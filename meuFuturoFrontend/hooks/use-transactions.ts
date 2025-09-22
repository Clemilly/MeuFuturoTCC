/**
 * Unified hook for managing all transaction-related state and operations
 * Replaces useTransactions and useTransactionFilters with a single, optimized hook
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { apiService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler'
import type { 
  Transaction, 
  TransactionCreate, 
  TransactionUpdate, 
  TransactionFilters, 
  PaginationInfo, 
  TransactionStats,
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

// Modal state interface
export interface ModalState {
  isCreateOpen: boolean
  isEditOpen: boolean
  isDeleteOpen: boolean
  isDetailsOpen: boolean
  selectedTransaction: Transaction | null
}

// Loading state interface
export interface LoadingState {
  transactions: boolean
  categories: boolean
  saving: boolean
  deleting: boolean
  stats: boolean
}

// Error state interface
export interface ErrorState {
  message: string | null
  type: 'network' | 'server' | 'validation' | 'auth' | 'unknown'
  retryable: boolean
}

// Initial states
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

const initialModalState: ModalState = {
  isCreateOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,
  isDetailsOpen: false,
  selectedTransaction: null
}

const initialLoadingState: LoadingState = {
  transactions: false,
  categories: false,
  saving: false,
  deleting: false,
  stats: false
}

const initialErrorState: ErrorState = {
  message: null,
  type: 'unknown',
  retryable: false
}

// Hook return interface
export interface UseTransactionsReturn {
  // Data
  transactions: Transaction[]
  categories: Category[]
  pagination: PaginationInfo
  stats: TransactionStats
  filters: FilterState
  modals: ModalState
  
  // Loading and error states
  loading: LoadingState
  error: ErrorState
  
  // Filter actions
  updateFilters: (filters: Partial<FilterState>) => void
  clearFilters: () => void
  resetFilters: () => void
  
  // Modal actions
  openCreateModal: () => void
  openEditModal: (transaction: Transaction) => void
  openDeleteModal: (transaction: Transaction) => void
  openDetailsModal: (transaction: Transaction) => void
  closeAllModals: () => void
  
  // CRUD operations
  createTransaction: (data: TransactionCreate) => Promise<{ success: boolean; error?: string }>
  updateTransaction: (id: string, data: TransactionUpdate) => Promise<{ success: boolean; error?: string }>
  deleteTransaction: (id: string) => Promise<{ success: boolean; error?: string }>
  
  // Utility actions
  refresh: () => void
  duplicateTransaction: (transaction: Transaction) => void
  
  // Computed values
  hasActiveFilters: boolean
  activeFiltersCount: number
  isOnline: boolean
}

export function useTransactions(): UseTransactionsReturn {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false
  })
  const [stats, setStats] = useState<TransactionStats>({
    total_income: 0,
    total_expenses: 0,
    net_amount: 0,
    transaction_count: 0,
    average_transaction: 0
  })
  const [filters, setFilters] = useState<FilterState>(initialFilterState)
  const [modals, setModals] = useState<ModalState>(initialModalState)
  const [loading, setLoading] = useState<LoadingState>(initialLoadingState)
  const [error, setError] = useState<ErrorState>(initialErrorState)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const retryCountRef = useRef(0)
  
  // Hooks
  const { toast } = useToast()
  const { handleAuthError } = useAuthErrorHandler()
  
  // Use ref to avoid dependency issues
  const handleAuthErrorRef = useRef(handleAuthError)
  handleAuthErrorRef.current = handleAuthError
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])
  
  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Convert filters to API format
  const toApiFilters = useCallback((page: number = 1, size: number = 20): TransactionFilters => {
    const apiFilters: TransactionFilters = {
      page,
      size,
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder
    }
    
    if (filters.search.trim()) {
      apiFilters.search = filters.search.trim()
    }
    
    if (filters.type !== 'all') {
      apiFilters.transaction_type = filters.type
    }
    
    if (filters.category !== 'all') {
      apiFilters.category_id = filters.category
    }
    
    if (filters.dateRange.start && filters.dateRange.end) {
      apiFilters.start_date = filters.dateRange.start.toISOString().split('T')[0]
      apiFilters.end_date = filters.dateRange.end.toISOString().split('T')[0]
    }
    
    if (filters.amountRange.min !== null) {
      apiFilters.min_amount = filters.amountRange.min
    }
    
    if (filters.amountRange.max !== null) {
      apiFilters.max_amount = filters.amountRange.max
    }
    
    return apiFilters
  }, [filters])
  
  // Load categories
  const loadCategories = useCallback(async () => {
    console.log('🔍 DEBUG: loadCategories called, isMounted:', isMountedRef.current)
    if (!isMountedRef.current) return
    
    try {
      console.log('🔍 DEBUG: Starting to load categories...')
      setLoading(prev => ({ ...prev, categories: true }))
      setError(initialErrorState)
      
      const response = await apiService.getCategories(true, true)
      console.log('🔍 DEBUG: getCategories response:', response)
      console.log('🔍 DEBUG: getCategories response.data:', response.data)
      console.log('🔍 DEBUG: getCategories response.error:', response.error)
      
      // Don't check isMounted here - process the data regardless
      if (response.error) {
        console.log('🔍 DEBUG: Categories API error:', response.error)
        throw new Error(response.error)
      }
      
      const categoriesData = response.data as Category[] || []
      console.log('🔍 DEBUG: Categories loaded:', categoriesData.length, 'categories')
      console.log('🔍 DEBUG: Categories data:', categoriesData)
      
      // Always set categories, even if component is unmounted (for next render)
      setCategories(categoriesData)
    } catch (err) {
      if (!isMountedRef.current) return
      
      console.error('🔍 DEBUG: Error loading categories:', err)
      
      if (handleAuthErrorRef.current(err)) {
        console.log('🔍 DEBUG: Auth error detected, returning')
        return
      }
      
      setError({
        message: 'Erro ao carregar categorias',
        type: 'network',
        retryable: true
      })
    } finally {
      console.log('🔍 DEBUG: loadCategories finally block, isMounted:', isMountedRef.current)
      if (isMountedRef.current) {
        setLoading(prev => ({ ...prev, categories: false }))
      }
    }
  }, [handleAuthErrorRef])
  
  // Load transactions with retry logic
  const loadTransactions = useCallback(async (apiFilters: TransactionFilters, retryCount = 0) => {
    if (!isMountedRef.current) {
      return
    }
    
    try {
      setLoading(prev => ({ ...prev, transactions: true }))
      setError(initialErrorState)
      retryCountRef.current = retryCount
      
      console.log('🔍 DEBUG: Calling getTransactions with filters:', apiFilters)
      console.log('🔍 DEBUG: Filter transaction_type:', apiFilters.transaction_type)
      console.log('🔍 DEBUG: Filter category_id:', apiFilters.category_id)
      console.log('🔍 DEBUG: Filter search:', apiFilters.search)
      const response = await apiService.getTransactions(apiFilters)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      console.log('🔍 DEBUG: API response received:', {
        hasData: !!response.data,
        itemsCount: (response.data as any)?.items?.length || 0,
        total: (response.data as any)?.total || 0,
        filtersSent: apiFilters
      })
      
      // Log first few transactions to see their types
      const firstTransactions = (response.data as any)?.items?.slice(0, 3) || []
      console.log('🔍 DEBUG: First 3 transactions from API:', firstTransactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        description: t.description
      })))
      
      
      if (response.data) {
        const data = response.data as any
        
        // The backend returns the data directly, not wrapped in a data property
        const rawTransactionItems = data.items || []
        const total = data.total || 0
        const page = data.page || 1
        const size = data.size || 20
        const pages = data.pages || 0
        const has_next = data.has_next || false
        const has_previous = data.has_previous || false
        
        if (rawTransactionItems.length > 0 || total > 0) {
          
          // Convert and validate transaction data
          const transactionItems: Transaction[] = rawTransactionItems.map((item: any) => {
            // Ensure amount is a number
            const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : (item.amount || 0)
            
            // Ensure category type is correct
            const categoryType = item.category?.type === null ? undefined : item.category?.type
            
            console.log('🔍 DEBUG: Processing transaction:', {
              id: item.id,
              type: item.type,
              description: item.description,
              amount: amount,
              categoryType: categoryType,
              filtersApplied: apiFilters,
              shouldInclude: !apiFilters.transaction_type || apiFilters.transaction_type === item.type
            })
            
            return {
              id: item.id,
              type: item.type,
              amount: amount,
              description: item.description,
              transaction_date: item.transaction_date,
              notes: item.notes || undefined,
              category: item.category ? {
                id: item.category.id,
                name: item.category.name,
                color: item.category.color,
                type: categoryType
              } : undefined,
              created_at: item.created_at,
              updated_at: item.updated_at
            }
          })
          
          setTransactions(transactionItems)
          setPagination({
            current_page: page,
            page_size: size,
            total_items: total,
            total_pages: pages,
            has_next: has_next,
            has_previous: has_previous,
            next_page: has_next ? page + 1 : undefined,
            previous_page: has_previous ? page - 1 : undefined
          })
          
          // Calculate stats from all transactions (not just current page)
          // Note: This is a simplified calculation. In a real app, you'd want to get stats from the backend
          const totalIncome = transactionItems
            .filter((t: Transaction) => t.type === 'income')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
          
          const totalExpenses = transactionItems
            .filter((t: Transaction) => t.type === 'expense')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
          
          setStats({
            total_income: totalIncome,
            total_expenses: totalExpenses,
            net_amount: totalIncome - totalExpenses,
            transaction_count: transactionItems.length,
            average_transaction: transactionItems.length > 0 ? (totalIncome + totalExpenses) / transactionItems.length : 0
          })
          
          // Reset retry count on success
          retryCountRef.current = 0
        } else {
          setTransactions([])
          setPagination({
            current_page: 1,
            page_size: 20,
            total_items: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false
          })
          setStats({
            total_income: 0,
            total_expenses: 0,
            net_amount: 0,
            transaction_count: 0,
            average_transaction: 0
          })
        }
      } else {
        setTransactions([])
        setPagination({
          current_page: 1,
          page_size: 20,
          total_items: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false
        })
        setStats({
          total_income: 0,
          total_expenses: 0,
          net_amount: 0,
          transaction_count: 0,
          average_transaction: 0
        })
      }
    } catch (err) {
      if (!isMountedRef.current) return
      
      console.error('Error loading transactions:', err)
      
      if (handleAuthErrorRef.current(err)) {
        return
      }
      
      // Retry logic for network errors
      const maxRetries = 3
      if (retryCount < maxRetries && (err as Error).message.includes('network')) {
        setTimeout(() => {
          if (isMountedRef.current) {
            loadTransactions(apiFilters, retryCount + 1)
          }
        }, Math.pow(2, retryCount) * 1000) // Exponential backoff
        return
      }
      
      setError({
        message: 'Erro ao carregar transações',
        type: 'network',
        retryable: retryCount < maxRetries
      })
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }))
    }
  }, [])
  
  // Debounced filter update
  const updateFiltersWithDebounce = useCallback((newFilters: FilterState) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      // Create API filters using the new filters
      const apiFilters: TransactionFilters = {
        page: 1,
        size: pagination.page_size,
        sort_by: newFilters.sortBy,
        sort_order: newFilters.sortOrder
      }
      
      if (newFilters.search.trim()) {
        apiFilters.search = newFilters.search.trim()
      }
      
      if (newFilters.type !== 'all') {
        apiFilters.transaction_type = newFilters.type
        console.log('🔍 DEBUG: Setting transaction_type filter to:', newFilters.type)
      console.log('🔍 DEBUG: newFilters.type value:', newFilters.type, 'type:', typeof newFilters.type)
      console.log('🔍 DEBUG: newFilters.type !== "all":', newFilters.type !== 'all')
      }
      
      if (newFilters.category !== 'all') {
        apiFilters.category_id = newFilters.category
      }
      
      if (newFilters.dateRange.start && newFilters.dateRange.end) {
        apiFilters.start_date = newFilters.dateRange.start.toISOString().split('T')[0]
        apiFilters.end_date = newFilters.dateRange.end.toISOString().split('T')[0]
      }
      
      if (newFilters.amountRange.min !== null) {
        apiFilters.min_amount = newFilters.amountRange.min
      }
      
      if (newFilters.amountRange.max !== null) {
        apiFilters.max_amount = newFilters.amountRange.max
      }
      
      console.log('🔍 DEBUG: Final API filters being sent:', apiFilters)
      console.log('🔍 DEBUG: About to call loadTransactions with transaction_type:', apiFilters.transaction_type)
      console.log('🔍 DEBUG: API filters object keys:', Object.keys(apiFilters))
      loadTransactions(apiFilters)
    }, 300)
  }, [pagination.page_size, loadTransactions])
  
  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    console.log('🔍 DEBUG: updateFilters called with:', newFilters)
    console.log('🔍 DEBUG: current filters:', filters)
    const updatedFilters = { ...filters, ...newFilters }
    console.log('🔍 DEBUG: updatedFilters:', updatedFilters)
    setFilters(updatedFilters)
    updateFiltersWithDebounce(updatedFilters)
  }, [filters, updateFiltersWithDebounce])
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilterState)
    updateFiltersWithDebounce(initialFilterState)
  }, [updateFiltersWithDebounce])
  
  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters(initialFilterState)
    const apiFilters = toApiFilters(1, 20)
    loadTransactions(apiFilters)
  }, [toApiFilters, loadTransactions])
  
  // Modal actions
  const openCreateModal = useCallback(() => {
    setModals({
      ...initialModalState,
      isCreateOpen: true
    })
  }, [])
  
  const openEditModal = useCallback((transaction: Transaction) => {
    setModals({
      ...initialModalState,
      isEditOpen: true,
      selectedTransaction: transaction
    })
  }, [])
  
  const openDeleteModal = useCallback((transaction: Transaction) => {
    setModals({
      ...initialModalState,
      isDeleteOpen: true,
      selectedTransaction: transaction
    })
  }, [])
  
  const openDetailsModal = useCallback((transaction: Transaction) => {
    setModals({
      ...initialModalState,
      isDetailsOpen: true,
      selectedTransaction: transaction
    })
  }, [])
  
  const closeAllModals = useCallback(() => {
    setModals(initialModalState)
  }, [])
  
  // CRUD operations
  const createTransaction = useCallback(async (data: TransactionCreate): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(prev => ({ ...prev, saving: true }))
      setError(initialErrorState)
      
      const response = await apiService.createTransaction(data)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso"
      })
      
      // Refresh transactions
      const apiFilters = toApiFilters(1, pagination.page_size)
      await loadTransactions(apiFilters)
      
      return { success: true }
    } catch (err) {
      console.error('Error creating transaction:', err)
      
      if (handleAuthErrorRef.current(err)) {
        return { success: false, error: 'Authentication error' }
      }
      
      const errorMessage = (err as Error).message || 'Erro ao criar transação'
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }, [toApiFilters, pagination.page_size, loadTransactions, toast])
  
  const updateTransaction = useCallback(async (id: string, data: TransactionUpdate): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(prev => ({ ...prev, saving: true }))
      setError(initialErrorState)
      
      const response = await apiService.updateTransaction(id, data)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso"
      })
      
      // Refresh transactions
      const apiFilters = toApiFilters(pagination.current_page, pagination.page_size)
      await loadTransactions(apiFilters)
      
      return { success: true }
    } catch (err) {
      console.error('Error updating transaction:', err)
      
      if (handleAuthErrorRef.current(err)) {
        return { success: false, error: 'Authentication error' }
      }
      
      const errorMessage = (err as Error).message || 'Erro ao atualizar transação'
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }, [toApiFilters, pagination.current_page, pagination.page_size, loadTransactions, toast])
  
  const deleteTransaction = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(prev => ({ ...prev, deleting: true }))
      setError(initialErrorState)
      
      const response = await apiService.deleteTransaction(id)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso"
      })
      
      // Refresh transactions
      const apiFilters = toApiFilters(pagination.current_page, pagination.page_size)
      await loadTransactions(apiFilters)
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting transaction:', err)
      
      if (handleAuthErrorRef.current(err)) {
        return { success: false, error: 'Authentication error' }
      }
      
      const errorMessage = (err as Error).message || 'Erro ao excluir transação'
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }))
    }
  }, [toApiFilters, pagination.current_page, pagination.page_size, loadTransactions, toast])
  
  // Utility actions
  const refresh = useCallback(() => {
    const apiFilters = toApiFilters(pagination.current_page, pagination.page_size)
    loadTransactions(apiFilters)
  }, [toApiFilters, pagination.current_page, pagination.page_size, loadTransactions])
  
  const duplicateTransaction = useCallback((transaction: Transaction) => {
    const duplicateData: TransactionCreate = {
      type: transaction.type,
      amount: transaction.amount,
      description: `${transaction.description} (cópia)`,
      transaction_date: new Date().toISOString().split('T')[0],
      notes: transaction.notes,
      category_id: transaction.category?.id
    }
    
    createTransaction(duplicateData)
  }, [createTransaction])
  
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
    console.log('🔍 DEBUG: useEffect running, isMounted:', isMountedRef.current)
    if (isMountedRef.current) {
      console.log('🔍 DEBUG: About to call loadCategories')
      loadCategories()
      
      // Create initial API filters directly
      const apiFilters: TransactionFilters = {
        page: 1,
        size: 20,
        sort_by: 'transaction_date',
        sort_order: 'desc'
      }
      
      console.log('🔍 DEBUG: About to call loadTransactions with filters:', apiFilters)
      loadTransactions(apiFilters)
    }
  }, [loadCategories, loadTransactions]) // Include dependencies
  
  return {
    // Data
    transactions,
    categories,
    pagination,
    stats,
    filters,
    modals,
    
    // Loading and error states
    loading,
    error,
    
    // Filter actions
    updateFilters,
    clearFilters,
    resetFilters,
    
    // Modal actions
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openDetailsModal,
    closeAllModals,
    
    // CRUD operations
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Utility actions
    refresh,
    duplicateTransaction,
    
    // Computed values
    hasActiveFilters,
    activeFiltersCount,
    isOnline
  }
}