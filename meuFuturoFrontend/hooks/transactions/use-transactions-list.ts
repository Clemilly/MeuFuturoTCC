/**
 * Hook responsável APENAS por carregar e exibir lista de transações
 * NÃO faz: filtros, CRUD, paginação
 */

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api'
import type { Transaction, TransactionFilters } from '@/lib/types'

export function useTransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = useCallback(async (filters: TransactionFilters) => {
    console.log('📋 Loading transactions with filters:', filters)
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getTransactions(filters)
      
      if (response.error) {
        throw new Error(response.error)
      }

      const items = (response.data as any)?.items || []
      console.log('✅ Loaded:', items.length, 'transactions')
      setTransactions(items)
      
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar'
      console.error('❌ Error loading transactions:', errorMessage)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearTransactions = useCallback(() => {
    setTransactions([])
    setError(null)
  }, [])

  return {
    transactions,
    loading,
    error,
    loadTransactions,
    clearTransactions
  }
}


