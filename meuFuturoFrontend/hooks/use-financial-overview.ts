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
      
      console.log('📊 Financial Overview Response:', response)
      
      if (response.error) {
        console.error('❌ Error in financial overview response:', response.error)
        if (handleAuthError(response)) {
          return
        }
        setError(response.message || 'Erro ao carregar dados')
        return
      }
      
      // Check if data exists
      if (!response.data) {
        console.warn('⚠️ No data in financial overview response')
        setError('Nenhum dado retornado do servidor')
        return
      }
      
      console.log('✅ Financial Overview Data:', response.data)
      
      // Validate data structure
      const overviewData = response.data
      if (typeof overviewData !== 'object' || overviewData === null) {
        console.error('❌ Invalid data structure:', overviewData)
        setError('Estrutura de dados inválida')
        return
      }
      
      setOverview(overviewData)
    } catch (err) {
      console.error('❌ Error loading financial overview:', err)
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
