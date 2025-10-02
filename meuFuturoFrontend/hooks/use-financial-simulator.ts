/**
 * Hook for financial scenario simulation
 * Allows testing "what-if" scenarios for financial planning
 */

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api'

export interface FinancialSimulation {
  scenario_name: string
  income_adjustment: number
  expense_adjustment: number
  savings_increase: number
  time_horizon_months: number
}

export interface SimulationResult {
  scenario_name: string
  final_balance: number
  total_savings: number
  monthly_average_balance: number
  goals_achievable: string[]
  timeline_data: Array<{
    month: number
    income: number
    expenses: number
    savings: number
    balance: number
  }>
  comparison_to_current: {
    balance_difference: number
    percentage_improvement: number
    better_outcome: boolean
  }
}

interface UseFinancialSimulatorReturn {
  result: SimulationResult | null
  loading: boolean
  error: string | null
  runSimulation: (simulation: FinancialSimulation) => Promise<void>
  clearResult: () => void
}

export const useFinancialSimulator = (): UseFinancialSimulatorReturn => {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSimulation = useCallback(async (simulation: FinancialSimulation) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.post<SimulationResult>(
        '/ai-predictions/simulations',
        simulation
      )

      if (response.error) {
        setError(response.error)
        return
      }

      setResult(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar simulação')
      console.error('Error running simulation:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    result,
    loading,
    error,
    runSimulation,
    clearResult,
  }
}

