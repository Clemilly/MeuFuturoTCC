"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface GlobalDataContextType {
  refreshTrigger: number
  triggerRefresh: () => void
  triggerFinancialOverviewRefresh: () => void
  triggerTransactionRefresh: () => void
  triggerCategoryRefresh: () => void
  triggerGoalRefresh: () => void
  triggerReportRefresh: () => void
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined)

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const triggerFinancialOverviewRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const triggerTransactionRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const triggerCategoryRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const triggerGoalRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const triggerReportRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <GlobalDataContext.Provider value={{ 
      refreshTrigger, 
      triggerRefresh,
      triggerFinancialOverviewRefresh,
      triggerTransactionRefresh,
      triggerCategoryRefresh,
      triggerGoalRefresh,
      triggerReportRefresh
    }}>
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
