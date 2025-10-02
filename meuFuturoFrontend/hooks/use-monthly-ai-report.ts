/**
 * Hook for monthly AI-generated reports
 * Fetches comprehensive monthly financial analysis
 */

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { PersonalizedRecommendation, CashFlowPrediction } from './use-advanced-ai-dashboard'

export interface MonthlyAIReport {
  report_id: string
  reference_month: string
  generated_at: string
  executive_summary: string
  health_score: number
  health_score_change: number
  income_total: number
  expense_total: number
  savings_total: number
  savings_rate: number
  key_insights: string[]
  achievements: string[]
  areas_for_improvement: string[]
  next_month_prediction: CashFlowPrediction
  top_recommendations: PersonalizedRecommendation[]
  goals_progress: Array<{
    goal_id?: string
    goal_name: string
    progress: number
    on_track: boolean
    status?: string
  }>
}

interface UseMonthlyAIReportReturn {
  report: MonthlyAIReport | null
  loading: boolean
  error: string | null
  fetchReport: (month: string) => Promise<void>
}

export const useMonthlyAIReport = (): UseMonthlyAIReportReturn => {
  const [report, setReport] = useState<MonthlyAIReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async (month: string) => {
    try {
      setLoading(true)
      setError(null)

      // Validate format YYYY-MM
      const monthRegex = /^\d{4}-\d{2}$/
      if (!monthRegex.test(month)) {
        setError('Formato de mês inválido. Use YYYY-MM')
        return
      }

      const response = await apiService.get<MonthlyAIReport>(
        `/ai-predictions/reports/monthly?month=${month}`
      )

      if (response.error) {
        setError(response.error)
        return
      }

      setReport(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório')
      console.error('Error fetching monthly report:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    report,
    loading,
    error,
    fetchReport,
  }
}

