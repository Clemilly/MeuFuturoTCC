"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { Transaction, Category, TransactionStats } from '@/lib/types'

interface GlobalDataContextType {
  // Refresh triggers
  refreshTrigger: number
  triggerRefresh: () => void
  triggerFinancialOverviewRefresh: () => void
  triggerTransactionRefresh: () => void
  triggerCategoryRefresh: () => void
  triggerGoalRefresh: () => void
  triggerReportRefresh: () => void
  
  // Global state
  selectedTransactions: string[]
  setSelectedTransactions: (ids: string[]) => void
  addSelectedTransaction: (id: string) => void
  removeSelectedTransaction: (id: string) => void
  clearSelectedTransactions: () => void
  
  // View preferences
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  compactMode: boolean
  setCompactMode: (compact: boolean) => void
  
  // Filter state
  globalFilters: Record<string, any>
  setGlobalFilters: (filters: Record<string, any>) => void
  clearGlobalFilters: () => void
  
  // Cache
  cachedTransactions: Transaction[]
  setCachedTransactions: (transactions: Transaction[]) => void
  cachedCategories: Category[]
  setCachedCategories: (categories: Category[]) => void
  cachedStats: TransactionStats | null
  setCachedStats: (stats: TransactionStats | null) => void
  
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Error handling
  error: string | null
  setError: (error: string | null) => void
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined)

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  // Refresh triggers
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Global state
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  
  // View preferences
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [compactMode, setCompactMode] = useState(false)
  
  // Filter state
  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({})
  
  // Cache
  const [cachedTransactions, setCachedTransactions] = useState<Transaction[]>([])
  const [cachedCategories, setCachedCategories] = useState<Category[]>([])
  const [cachedStats, setCachedStats] = useState<TransactionStats | null>(null)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  
  // Error handling
  const [error, setError] = useState<string | null>(null)

  // Refresh functions
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const triggerFinancialOverviewRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const triggerTransactionRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const triggerCategoryRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const triggerGoalRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const triggerReportRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // Selection functions
  const addSelectedTransaction = useCallback((id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev : [...prev, id]
    )
  }, [])

  const removeSelectedTransaction = useCallback((id: string) => {
    setSelectedTransactions(prev => prev.filter(transactionId => transactionId !== id))
  }, [])

  const clearSelectedTransactions = useCallback(() => {
    setSelectedTransactions([])
  }, [])

  // Filter functions
  const clearGlobalFilters = useCallback(() => {
    setGlobalFilters({})
  }, [])

  const value: GlobalDataContextType = {
    // Refresh triggers
    refreshTrigger,
    triggerRefresh,
    triggerFinancialOverviewRefresh,
    triggerTransactionRefresh,
    triggerCategoryRefresh,
    triggerGoalRefresh,
    triggerReportRefresh,
    
    // Global state
    selectedTransactions,
    setSelectedTransactions,
    addSelectedTransaction,
    removeSelectedTransaction,
    clearSelectedTransactions,
    
    // View preferences
    viewMode,
    setViewMode,
    compactMode,
    setCompactMode,
    
    // Filter state
    globalFilters,
    setGlobalFilters,
    clearGlobalFilters,
    
    // Cache
    cachedTransactions,
    setCachedTransactions,
    cachedCategories,
    setCachedCategories,
    cachedStats,
    setCachedStats,
    
    // Loading states
    isLoading,
    setIsLoading,
    
    // Error handling
    error,
    setError
  }

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  )
}

export function useGlobalDataContext() {
  const context = useContext(GlobalDataContext)
  if (context === undefined) {
    throw new Error('useGlobalDataContext must be used within a GlobalDataProvider')
  }
  return context
}

// Backward compatibility
export const useTransactionContext = useGlobalDataContext
export const TransactionProvider = GlobalDataProvider
