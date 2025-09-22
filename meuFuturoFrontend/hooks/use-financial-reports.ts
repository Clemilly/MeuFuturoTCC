"use client"

import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler'
import { apiService } from '@/lib/api'
import type {
  ReportData,
  ReportFilters,
  ExportFormat,
  AnalyticsData,
  ComparativeReport,
  TrendAnalysis,
  TrendType,
  DateRange,
  TransactionSummary,
  CategorySummary
} from '@/lib/types'

interface UseFinancialReportsReturn {
  // State
  loading: boolean
  error: string | null
  data: ReportData | null
  
  // Actions
  loadReportData: (filters: ReportFilters) => Promise<void>
  exportReport: (format: ExportFormat, filters: ReportFilters) => Promise<void>
  getAnalytics: (filters: ReportFilters) => Promise<AnalyticsData[]>
  getComparativeReport: (period1: DateRange, period2: DateRange) => Promise<ComparativeReport>
  getTrends: (filters: ReportFilters, trendType: TrendType) => Promise<TrendAnalysis>
  refresh: () => Promise<void>
  
  // Utilities
  clearError: () => void
}

export function useFinancialReports(): UseFinancialReportsReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ReportData | null>(null)
  const [currentFilters, setCurrentFilters] = useState<ReportFilters>({})
  
  const { toast } = useToast()
  const { handleAuthError } = useAuthErrorHandler()

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load report data with filters
  const loadReportData = useCallback(async (filters: ReportFilters) => {
    try {
      setLoading(true)
      setError(null)
      setCurrentFilters(filters)

      // Load summary data
      const summaryResponse = await apiService.getTransactionSummary({
        start_date: filters.start_date,
        end_date: filters.end_date,
        transaction_type: filters.transaction_type
      })

      if (summaryResponse.error) {
        throw new Error(summaryResponse.error)
      }

      // Load category summary
      const categoryResponse = await apiService.getCategorySummary({
        transaction_type: filters.transaction_type || 'expense',
        start_date: filters.start_date,
        end_date: filters.end_date
      })

      if (categoryResponse.error) {
        throw new Error(categoryResponse.error)
      }

      // Load analytics data
      const analyticsResponse = await apiService.getFinancialAnalytics({
        start_date: filters.start_date,
        end_date: filters.end_date,
        granularity: filters.granularity || 'monthly'
      })

      if (analyticsResponse.error) {
        throw new Error(analyticsResponse.error)
      }

      // Transform summary data to match frontend format
      const summary: TransactionSummary = {
        period: `${filters.start_date || 'Início'} a ${filters.end_date || 'Atual'}`,
        income: Number(summaryResponse.data?.total_income || 0),
        expenses: Number(summaryResponse.data?.total_expenses || 0),
        balance: Number(summaryResponse.data?.net_amount || 0),
        transaction_count: summaryResponse.data?.transaction_count || 0
      }

      // Transform category data
      const categories: CategorySummary[] = (categoryResponse.data || []).map((cat: any) => ({
        category_id: cat.category_id,
        category_name: cat.category_name,
        total_amount: Number(cat.total_amount || 0),
        transaction_count: cat.transaction_count || 0,
        percentage: cat.percentage || 0
      }))

      // Transform analytics data
      const analytics: AnalyticsData[] = (analyticsResponse.data || []).map((item: any) => ({
        period: item.period,
        period_start: item.period_start,
        period_end: item.period_end,
        income: Number(item.income || 0),
        expenses: Number(item.expenses || 0),
        net_amount: Number(item.net_amount || 0),
        transaction_count: item.transaction_count || 0,
        average_transaction: Number(item.average_transaction || 0),
        growth_rate: item.growth_rate
      }))

      setData({
        summary,
        analytics,
        categories
      })

    } catch (err) {
      console.error('Error loading report data:', err)
      
      // Check if it's an authentication error
      if (handleAuthError(err)) {
        return // Auth error handler will redirect to login
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do relatório'
      setError(errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Export report
  const exportReport = useCallback(async (format: ExportFormat, filters: ReportFilters) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.exportFinancialReport({
        format,
        start_date: filters.start_date,
        end_date: filters.end_date,
        transaction_type: filters.transaction_type,
        category_id: filters.category_ids?.[0], // Use first category if multiple selected
        include_charts: format === 'pdf'
      })

      if (response.error) {
        throw new Error(response.error)
      }

      // Create download link for blob
      if (response.data instanceof Blob) {
        const url = window.URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        
        // Generate filename based on format and date range
        const startDate = filters.start_date ? filters.start_date.replace(/-/g, '') : 'all'
        const endDate = filters.end_date ? filters.end_date.replace(/-/g, '') : 'all'
        const filename = `relatorio_financeiro_${startDate}_${endDate}.${format}`
        
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: "Exportação concluída",
          description: `Relatório exportado como ${filename}`,
        })
      } else {
        throw new Error('Formato de resposta inválido para exportação')
      }

    } catch (err) {
      console.error('Error exporting report:', err)
      
      // Check if it's an authentication error
      if (handleAuthError(err)) {
        return // Auth error handler will redirect to login
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar relatório'
      setError(errorMessage)
      
      toast({
        title: "Erro na exportação",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Get analytics data
  const getAnalytics = useCallback(async (filters: ReportFilters): Promise<AnalyticsData[]> => {
    try {
      setError(null)

      const response = await apiService.getFinancialAnalytics({
        start_date: filters.start_date,
        end_date: filters.end_date,
        granularity: filters.granularity || 'monthly'
      })

      if (response.error) {
        throw new Error(response.error)
      }

      return (response.data || []).map((item: any) => ({
        period: item.period,
        period_start: item.period_start,
        period_end: item.period_end,
        income: Number(item.income || 0),
        expenses: Number(item.expenses || 0),
        net_amount: Number(item.net_amount || 0),
        transaction_count: item.transaction_count || 0,
        average_transaction: Number(item.average_transaction || 0),
        growth_rate: item.growth_rate
      }))

    } catch (err) {
      console.error('Error getting analytics:', err)
      
      // Check if it's an authentication error
      if (handleAuthError(err)) {
        return [] // Auth error handler will redirect to login
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao obter dados analíticos'
      setError(errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      
      return []
    }
  }, [toast])

  // Get comparative report
  const getComparativeReport = useCallback(async (
    period1: DateRange, 
    period2: DateRange
  ): Promise<ComparativeReport> => {
    try {
      setError(null)

      const response = await apiService.getComparativeReport({
        period1_start: period1.start.toISOString().split('T')[0],
        period1_end: period1.end.toISOString().split('T')[0],
        period2_start: period2.start.toISOString().split('T')[0],
        period2_end: period2.end.toISOString().split('T')[0]
      })

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data

    } catch (err) {
      console.error('Error getting comparative report:', err)
      
      // Check if it's an authentication error
      if (handleAuthError(err)) {
        throw err // Auth error handler will redirect to login
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao obter relatório comparativo'
      setError(errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    }
  }, [toast])

  // Get trends analysis
  const getTrends = useCallback(async (
    filters: ReportFilters, 
    trendType: TrendType
  ): Promise<TrendAnalysis> => {
    try {
      setError(null)

      const response = await apiService.getFinancialTrends({
        start_date: filters.start_date,
        end_date: filters.end_date,
        trend_type: trendType
      })

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data

    } catch (err) {
      console.error('Error getting trends:', err)
      
      // Check if it's an authentication error
      if (handleAuthError(err)) {
        throw err // Auth error handler will redirect to login
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao obter análise de tendências'
      setError(errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    }
  }, [toast])

  // Refresh current data
  const refresh = useCallback(async () => {
    if (currentFilters) {
      await loadReportData(currentFilters)
    }
  }, [loadReportData, currentFilters])

  // Auto-load data on mount with default filters
  useEffect(() => {
    const defaultFilters: ReportFilters = {
      granularity: 'monthly'
    }
    loadReportData(defaultFilters)
  }, [loadReportData])

  return {
    // State
    loading,
    error,
    data,
    
    // Actions
    loadReportData,
    exportReport,
    getAnalytics,
    getComparativeReport,
    getTrends,
    refresh,
    
    // Utilities
    clearError
  }
}
