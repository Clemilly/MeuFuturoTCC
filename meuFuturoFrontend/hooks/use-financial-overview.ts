import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { useAuthErrorHandler } from './use-auth-error-handler'
import { FinancialOverview } from '@/lib/types'

export function useFinancialOverview() {
  const [overview, setOverview] = useState<FinancialOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { handleAuthError } = useAuthErrorHandler()

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the basic overview endpoint first
      const response = await apiService.request('/financial/overview')
      
      if (response.error) {
        if (handleAuthError(response)) {
          return
        }
        setError(response.message || 'Erro ao carregar dados')
        return
      }
      
      setOverview(response.data)
    } catch (err) {
      console.error('Error loading financial overview:', err)
      if (handleAuthError(err)) {
        return
      }
      setError('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }, [handleAuthError])

  const refreshOverview = useCallback(async () => {
    await loadOverview()
  }, [loadOverview])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  return {
    overview,
    loading,
    error,
    loadOverview,
    refreshOverview
  }
}
