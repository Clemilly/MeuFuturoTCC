/**
 * Hook for advanced pattern analysis
 * Fetches spending patterns, anomalies, and behavioral insights
 */

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { PatternAnalysisAdvanced, SeasonalPattern, AnomalyDetection } from './use-advanced-ai-dashboard'

interface UsePatternAnalysisReturn {
  patterns: PatternAnalysisAdvanced | null
  seasonal: SeasonalPattern[]
  anomalies: AnomalyDetection[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  fetchAnomalies: (days?: number) => Promise<void>
}

export const usePatternAnalysis = (): UsePatternAnalysisReturn => {
  const [patterns, setPatterns] = useState<PatternAnalysisAdvanced | null>(null)
  const [seasonal, setSeasonal] = useState<SeasonalPattern[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatterns = useCallback(async () => {
    try {
      const response = await apiService.getAdvancedPatterns()

      if (response.error) {
        throw new Error(response.error)
      }

      setPatterns(response.data)
    } catch (err) {
      console.error('Error fetching patterns:', err)
      throw err
    }
  }, [])

  const fetchSeasonal = useCallback(async () => {
    try {
      const response = await apiService.getSeasonalPatterns()

      if (response.error) {
        throw new Error(response.error)
      }

      setSeasonal(response.data || [])
    } catch (err) {
      console.error('Error fetching seasonal patterns:', err)
      throw err
    }
  }, [])

  const fetchAnomalies = useCallback(async (days: number = 30) => {
    try {
      const response = await apiService.detectAnomalies()

      if (response.error) {
        throw new Error(response.error)
      }

      setAnomalies(response.data || [])
    } catch (err) {
      console.error('Error fetching anomalies:', err)
      throw err
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      await Promise.all([
        fetchPatterns(),
        fetchSeasonal(),
        fetchAnomalies(),
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar análise de padrões')
    } finally {
      setLoading(false)
    }
  }, [fetchPatterns, fetchSeasonal, fetchAnomalies])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    patterns,
    seasonal,
    anomalies,
    loading,
    error,
    refresh,
    fetchAnomalies,
  }
}


