import { renderHook, act } from '@testing-library/react'
import { useFinancialReports } from '@/hooks/use-financial-reports'
import { apiService } from '@/lib/api'
import type { ReportFilters, ExportFormat } from '@/lib/types'

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    getTransactionSummary: jest.fn(),
    getCategorySummary: jest.fn(),
    getFinancialAnalytics: jest.fn(),
    getComparativeReport: jest.fn(),
    getFinancialTrends: jest.fn(),
    exportFinancialReport: jest.fn(),
  }
}))

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

const mockApiService = apiService as jest.Mocked<typeof apiService>

describe('useFinancialReports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useFinancialReports())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.data).toBe(null)
  })

  it('loads report data successfully', async () => {
    const mockSummaryData = {
      total_income: 5000,
      total_expenses: 3000,
      net_amount: 2000,
      transaction_count: 10
    }

    const mockCategoryData = [
      {
        category_id: '1',
        category_name: 'Alimentação',
        total_amount: 1500,
        transaction_count: 5,
        percentage: 50
      }
    ]

    const mockAnalyticsData = [
      {
        period: '2024-01',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        income: 5000,
        expenses: 3000,
        net_amount: 2000,
        transaction_count: 10,
        average_transaction: 200
      }
    ]

    mockApiService.getTransactionSummary.mockResolvedValue({
      data: mockSummaryData
    })

    mockApiService.getCategorySummary.mockResolvedValue({
      data: mockCategoryData
    })

    mockApiService.getFinancialAnalytics.mockResolvedValue({
      data: mockAnalyticsData
    })

    const { result } = renderHook(() => useFinancialReports())

    const filters: ReportFilters = {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      granularity: 'monthly'
    }

    await act(async () => {
      await result.current.loadReportData(filters)
    })

    expect(result.current.data).toBeTruthy()
    expect(result.current.data?.summary.income).toBe(5000)
    expect(result.current.data?.summary.expenses).toBe(3000)
    expect(result.current.data?.summary.balance).toBe(2000)
    expect(result.current.data?.categories).toHaveLength(1)
    expect(result.current.data?.analytics).toHaveLength(1)
  })

  it('handles API errors gracefully', async () => {
    mockApiService.getTransactionSummary.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useFinancialReports())

    const filters: ReportFilters = {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    }

    await act(async () => {
      await result.current.loadReportData(filters)
    })

    expect(result.current.error).toBe('API Error')
    expect(result.current.data).toBe(null)
  })

  it('exports report successfully', async () => {
    const mockBlob = new Blob(['test data'], { type: 'text/csv' })
    mockApiService.exportFinancialReport.mockResolvedValue({
      data: mockBlob
    })

    // Mock URL.createObjectURL and document methods
    global.URL.createObjectURL = jest.fn(() => 'mock-url')
    global.URL.revokeObjectURL = jest.fn()
    
    const mockCreateElement = jest.fn(() => ({
      href: '',
      download: '',
      click: jest.fn()
    }))
    global.document.createElement = mockCreateElement
    global.document.body.appendChild = jest.fn()
    global.document.body.removeChild = jest.fn()

    const { result } = renderHook(() => useFinancialReports())

    const filters: ReportFilters = {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    }

    await act(async () => {
      await result.current.exportReport('csv', filters)
    })

    expect(mockApiService.exportFinancialReport).toHaveBeenCalledWith({
      format: 'csv',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      include_charts: false
    })
  })

  it('gets analytics data', async () => {
    const mockAnalyticsData = [
      {
        period: '2024-01',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        income: 5000,
        expenses: 3000,
        net_amount: 2000,
        transaction_count: 10,
        average_transaction: 200
      }
    ]

    mockApiService.getFinancialAnalytics.mockResolvedValue({
      data: mockAnalyticsData
    })

    const { result } = renderHook(() => useFinancialReports())

    const filters: ReportFilters = {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      granularity: 'monthly'
    }

    let analyticsData
    await act(async () => {
      analyticsData = await result.current.getAnalytics(filters)
    })

    expect(analyticsData).toHaveLength(1)
    expect(analyticsData![0].period).toBe('2024-01')
    expect(analyticsData![0].income).toBe(5000)
  })

  it('gets comparative report', async () => {
    const mockComparativeData = {
      period1: {
        period: '2024-01',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        income: 5000,
        expenses: 3000,
        net_amount: 2000,
        transaction_count: 10,
        average_transaction: 200
      },
      period2: {
        period: '2024-02',
        period_start: '2024-02-01',
        period_end: '2024-02-29',
        income: 5500,
        expenses: 2800,
        net_amount: 2700,
        transaction_count: 12,
        average_transaction: 225
      },
      comparison: {
        income_change: 10,
        expenses_change: -6.7,
        net_change: 35,
        income_absolute: 500,
        expenses_absolute: -200,
        net_absolute: 700
      },
      insights: ['Receitas aumentaram 10% no segundo período']
    }

    mockApiService.getComparativeReport.mockResolvedValue({
      data: mockComparativeData
    })

    const { result } = renderHook(() => useFinancialReports())

    const period1 = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31')
    }
    const period2 = {
      start: new Date('2024-02-01'),
      end: new Date('2024-02-29')
    }

    let comparativeData
    await act(async () => {
      comparativeData = await result.current.getComparativeReport(period1, period2)
    })

    expect(comparativeData).toEqual(mockComparativeData)
  })

  it('gets trends analysis', async () => {
    const mockTrendData = {
      trend_type: 'net_worth',
      data_points: [
        {
          period: '2024-01',
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          income: 5000,
          expenses: 3000,
          net_amount: 2000,
          transaction_count: 10,
          average_transaction: 200
        }
      ],
      trend_direction: 'up',
      confidence_score: 0.8,
      insights: ['Tendência geral positiva de crescimento']
    }

    mockApiService.getFinancialTrends.mockResolvedValue({
      data: mockTrendData
    })

    const { result } = renderHook(() => useFinancialReports())

    const filters: ReportFilters = {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    }

    let trendData
    await act(async () => {
      trendData = await result.current.getTrends(filters, 'net_worth')
    })

    expect(trendData).toEqual(mockTrendData)
  })

  it('clears error when clearError is called', () => {
    const { result } = renderHook(() => useFinancialReports())

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBe(null)
  })
})

