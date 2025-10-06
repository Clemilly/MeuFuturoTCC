/**
 * Hook for advanced AI dashboard data
 * Fetches comprehensive AI insights including metrics, patterns, and recommendations
 */

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'

export interface AdvancedMetrics {
  savings_rate: number
  ideal_savings_rate: number
  liquidity_score: number
  diversification_score: number
  stability_index: number
  expense_volatility: number
  income_consistency: number
}

export interface CashFlowPrediction {
  month: string
  predicted_income: number
  predicted_expenses: number
  predicted_balance: number
  confidence: number
  risk_factors: string[]
}

export interface SeasonalPattern {
  category: string
  pattern_type: string
  peak_months: string[]
  average_variation: number
  next_peak_date: string | null
  recommendation: string
}

export interface AnomalyDetection {
  transaction_id: string | null
  category: string
  amount: number
  expected_range: {
    min: number
    max: number
  }
  anomaly_score: number
  detected_at: string
  is_recurring: boolean
  suggestion: string
}

export interface PatternAnalysisAdvanced {
  temporal_patterns: Record<string, any>
  category_correlations: Array<{
    categories: string[]
    correlation: number
    insight: string
  }>
  impulse_spending_score: number
  spending_by_weekday: Record<string, number>
  spending_by_time: Record<string, number>
  behavioral_insights: string[]
}

export interface PersonalizedRecommendation {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  potential_impact: number
  implementation_steps: string[]
  difficulty: string
  estimated_time: string
  success_probability: number
  related_goals: string[]
  ai_confidence: number
}

export interface AdvancedDashboard {
  health_score: number
  health_label: string
  risk_level: string
  monthly_trend: string
  advanced_metrics: AdvancedMetrics
  cash_flow_predictions: CashFlowPrediction[]
  seasonal_patterns: SeasonalPattern[]
  anomalies: AnomalyDetection[]
  spending_patterns: any[]
  pattern_analysis: PatternAnalysisAdvanced
  recommendations: PersonalizedRecommendation[]
  goal_projections: any[]
  savings_projection: Record<string, Record<string, number>>
}

interface UseAdvancedAIDashboardReturn {
  dashboard: AdvancedDashboard | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const useAdvancedAIDashboard = (): UseAdvancedAIDashboardReturn => {
  const [dashboard, setDashboard] = useState<AdvancedDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getAdvancedDashboard()

      if (response.error) {
        setError(response.error)
        return
      }

      setDashboard(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
      console.error('Error fetching advanced dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    dashboard,
    loading,
    error,
    refresh: fetchDashboard,
  }
}


