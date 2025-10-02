/**
 * Hook responsável APENAS por carregar dados de relatórios
 */

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api'
import type { ReportFilters } from './use-reports-filters'
import type { AnalyticsData, CategorySummary, TransactionSummary } from '@/lib/types'

export interface MonthlyComparisonData {
  month: string
  income: number
  expense: number
  balance: number
}

export interface TrendData {
  period: string
  income: number
  expense: number
  balance: number
  savingsRate: number
}

export interface ComparativeData {
  metric: string
  current: number
  previous: number
  percentage: number
}

export interface ReportData {
  summary: TransactionSummary | null
  monthlyComparison: MonthlyComparisonData[]
  trends: TrendData[]
  comparative: ComparativeData[]
  categories: CategorySummary[]
}

export function useReportsData() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReportData = useCallback(async (filters: ReportFilters) => {
    console.log('📊 Loading report data with filters:', filters)
    setLoading(true)
    setError(null)

    try {
      // Preparar parâmetros da API
      const apiParams: any = {
        granularity: filters.period
      }

      if (filters.dateRange.start) {
        apiParams.start_date = filters.dateRange.start.toISOString().split('T')[0]
      }
      if (filters.dateRange.end) {
        apiParams.end_date = filters.dateRange.end.toISOString().split('T')[0]
      }
      if (filters.transactionTypes.length === 1) {
        apiParams.transaction_type = filters.transactionTypes[0]
      }
      if (filters.categories.length > 0) {
        apiParams.category_id = filters.categories[0] // Usar primeira categoria selecionada
      }
      if (filters.minAmount !== null) {
        apiParams.min_amount = filters.minAmount
      }
      if (filters.maxAmount !== null) {
        apiParams.max_amount = filters.maxAmount
      }
      
      console.log('🔍 API params prepared:', apiParams)

      // Carregar resumo geral
      const summaryResponse = await apiService.getTransactionSummary(apiParams)
      if (summaryResponse.error) {
        throw new Error(summaryResponse.error)
      }

      // Carregar dados analíticos (para gráficos mensais e tendências)
      const analyticsResponse = await apiService.getFinancialAnalytics(apiParams)
      if (analyticsResponse.error) {
        throw new Error(analyticsResponse.error)
      }

      // Carregar resumo por categoria
      const categoryParams = {
        ...apiParams,
        transaction_type: filters.transactionTypes.length === 1 ? filters.transactionTypes[0] : 'expense'
      }
      const categoryResponse = await apiService.getCategorySummary(categoryParams)
      if (categoryResponse.error) {
        throw new Error(categoryResponse.error)
      }

      // Processar dados mensais para comparação
      const analyticsData: AnalyticsData[] = analyticsResponse.data || []
      const monthlyComparison: MonthlyComparisonData[] = analyticsData.map(item => ({
        month: item.period,
        income: Number(item.income || 0),
        expense: Number(item.expenses || 0),
        balance: Number(item.net_amount || 0)
      }))

      // Processar dados de tendências
      const trends: TrendData[] = analyticsData.map(item => {
        const income = Number(item.income || 0)
        const expense = Number(item.expenses || 0)
        const balance = income - expense
        return {
          period: item.period,
          income,
          expense,
          balance,
          savingsRate: income > 0 ? (balance / income) * 100 : 0
        }
      })

      // Processar dados comparativos (comparação simples entre períodos)
      let comparative: ComparativeData[] = []
      if (filters.comparisonPeriod && analyticsData.length >= 2) {
        const current = analyticsData[analyticsData.length - 1]
        const previous = analyticsData[analyticsData.length - 2]
        
        comparative = [
          {
            metric: 'Receitas',
            current: Number(current.income || 0),
            previous: Number(previous.income || 0),
            percentage: previous.income ? ((Number(current.income) - Number(previous.income)) / Number(previous.income)) * 100 : 0
          },
          {
            metric: 'Despesas',
            current: Number(current.expenses || 0),
            previous: Number(previous.expenses || 0),
            percentage: previous.expenses ? ((Number(current.expenses) - Number(previous.expenses)) / Number(previous.expenses)) * 100 : 0
          },
          {
            metric: 'Saldo',
            current: Number(current.net_amount || 0),
            previous: Number(previous.net_amount || 0),
            percentage: previous.net_amount ? ((Number(current.net_amount) - Number(previous.net_amount)) / Number(previous.net_amount)) * 100 : 0
          }
        ]
      }

      const reportData: ReportData = {
        summary: summaryResponse.data,
        monthlyComparison,
        trends,
        comparative,
        categories: categoryResponse.data || []
      }

      console.log('✅ Report data loaded:', reportData)
      setData(reportData)
      
      return { success: true, data: reportData }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar relatórios'
      console.error('❌ Error loading report data:', errorMessage)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearData = useCallback(() => {
    console.log('🗑️ Clearing report data')
    setData(null)
    setError(null)
  }, [])

  return {
    data,
    loading,
    error,
    loadReportData,
    clearData
  }
}

