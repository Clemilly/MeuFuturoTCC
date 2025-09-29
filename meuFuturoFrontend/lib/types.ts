/**
 * TypeScript types for the MeuFuturo application
 */

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  transaction_date: string
  notes?: string
  category?: {
    id: string
    name: string
    color: string
    type?: 'income' | 'expense'
  }
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  type?: 'income' | 'expense'
  is_system?: boolean
  is_active?: boolean
  user_id?: string
  parent_id?: string
  full_name?: string
  is_subcategory?: boolean
  transaction_count?: number
  created_at?: string
  updated_at?: string
}

export interface CategoryCreate {
  name: string
  description?: string
  color: string
  icon?: string
  type?: 'income' | 'expense'
  parent_id?: string
}

export interface TransactionCreate {
  type: 'income' | 'expense'
  amount: number
  description: string
  transaction_date: string
  notes?: string
  category_id?: string
}

export interface TransactionUpdate {
  type?: 'income' | 'expense'
  amount?: number
  description?: string
  transaction_date?: string
  notes?: string
  category_id?: string
}

export interface TransactionFilters {
  page?: number
  size?: number
  transaction_type?: 'income' | 'expense'
  category_id?: string
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginationInfo {
  current_page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  next_page?: number
  previous_page?: number
}

export interface TransactionStats {
  total_income: number
  total_expenses: number
  net_amount: number
  transaction_count: number
  average_transaction: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
  has_next: boolean
  has_previous: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

export interface TransactionSummary {
  period: string
  income: number
  expenses: number
  balance: number
  transaction_count: number
}

export interface DateRange {
  start: Date
  end: Date
}

export interface FilterState {
  search: string
  type: 'all' | 'income' | 'expense'
  category: string
  dateRange: DateRange | null
  amountRange: {
    min: number | null
    max: number | null
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface ModalState {
  isEditOpen: boolean
  isDeleteOpen: boolean
  selectedTransaction: Transaction | null
}

export interface ViewMode {
  type: 'grid' | 'list'
  compact: boolean
}

export interface TransactionFormData {
  type: 'income' | 'expense'
  amount: string
  description: string
  transaction_date: string
  notes: string
  category_id: string
}

export interface PeriodOption {
  label: string
  value: string
  startDate: Date
  endDate: Date
}

export interface LoadingState {
  transactions: boolean
  categories: boolean
  stats: boolean
  saving: boolean
  deleting: boolean
}

export interface ErrorState {
  message: string | null
  type: 'network' | 'validation' | 'server' | 'unknown'
  retryable: boolean
}

// Financial Reports Types

export type ExportFormat = 'csv' | 'xlsx' | 'pdf'
export type Granularity = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type TrendType = 'net_worth' | 'income' | 'expenses' | 'savings'
export type TrendDirection = 'up' | 'down' | 'stable'

export interface ExportRequest {
  format: ExportFormat
  start_date?: string
  end_date?: string
  transaction_type?: 'income' | 'expense'
  category_id?: string
  include_charts?: boolean
  include_summary?: boolean
}

export interface AnalyticsData {
  period: string
  period_start: string
  period_end: string
  income: number
  expenses: number
  net_amount: number
  transaction_count: number
  average_transaction: number
  growth_rate?: number
}

export interface ComparativeReport {
  period1: AnalyticsData
  period2: AnalyticsData
  comparison: {
    income_change: number
    expenses_change: number
    net_change: number
    income_absolute: number
    expenses_absolute: number
    net_absolute: number
  }
  insights: string[]
}

export interface TrendAnalysis {
  trend_type: TrendType
  data_points: AnalyticsData[]
  trend_direction: TrendDirection
  confidence_score: number
  forecast?: AnalyticsData[]
  insights: string[]
}

export interface ReportFilters {
  start_date?: string
  end_date?: string
  transaction_type?: 'income' | 'expense'
  category_ids?: string[]
  min_amount?: number
  max_amount?: number
  granularity?: Granularity
}

export interface ExportResponse {
  filename: string
  content_type: string
  size_bytes: number
  download_url?: string
}

export interface ReportData {
  summary: TransactionSummary
  analytics: AnalyticsData[]
  categories: CategorySummary[]
  trends?: TrendAnalysis
  comparative?: ComparativeReport
}

export interface CategorySummary {
  category_id?: string
  category_name: string
  total_amount: number
  transaction_count: number
  percentage: number
}

export interface ReportState {
  loading: boolean
  error: string | null
  data: ReportData | null
  filters: ReportFilters
  selectedPeriod: string
  selectedCategory: string
}

export interface ReportActions {
  loadReportData: (filters: ReportFilters) => Promise<void>
  exportReport: (format: ExportFormat, filters: ReportFilters) => Promise<void>
  getAnalytics: (filters: ReportFilters) => Promise<AnalyticsData[]>
  getComparativeReport: (period1: DateRange, period2: DateRange) => Promise<ComparativeReport>
  getTrends: (filters: ReportFilters, trendType: TrendType) => Promise<TrendAnalysis>
  setFilters: (filters: Partial<ReportFilters>) => void
  clearFilters: () => void
}

export interface AdvancedFiltersProps {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
  categories: Category[]
  loadingCategories: boolean
}

export interface ExportOptionsProps {
  onExport: (format: ExportFormat) => void
  loading?: boolean
}

export interface ComparativeChartProps {
  data: ComparativeReport
  loading?: boolean
}

export interface TrendChartProps {
  data: TrendAnalysis
  loading?: boolean
}

export interface ReportCardProps {
  title: string
  value: number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
  }
  loading?: boolean
}

export interface DateRangePickerProps {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  placeholder?: string
}

export interface MultiCategorySelectProps {
  value: string[]
  onChange: (categories: string[]) => void
  categories: Category[]
  loading?: boolean
  placeholder?: string
}

export interface GranularitySelectProps {
  value: Granularity
  onChange: (granularity: Granularity) => void
}

export interface TransactionTypeFilterProps {
  value: 'all' | 'income' | 'expense'
  onChange: (type: 'all' | 'income' | 'expense') => void
}

// Financial Goals
export interface FinancialGoal {
  id: string
  name: string
  description?: string
  type: 'savings' | 'expense_reduction' | 'income_increase' | 'debt_payment' | 'custom'
  target_amount: number
  current_amount: number
  start_date: string
  target_date?: string
  status: 'active' | 'completed' | 'cancelled'
  is_recurring: boolean
  progress_percentage: number
  remaining_amount: number
  days_remaining?: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface GoalCreate {
  name: string
  description?: string
  type: 'savings' | 'expense_reduction' | 'income_increase' | 'debt_payment' | 'custom'
  target_amount: number
  start_date: string
  target_date?: string
  is_recurring: boolean
}

export interface GoalUpdate {
  name?: string
  description?: string
  target_amount?: number
  target_date?: string
  status?: 'active' | 'completed' | 'cancelled'
  is_recurring?: boolean
}

export interface GoalProgressUpdate {
  current_amount: number
}

// Financial Alerts
export interface FinancialAlert {
  id: string
  type: 'bill' | 'goal' | 'budget' | 'income' | 'custom'
  title: string
  description: string
  amount?: number
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'dismissed' | 'completed'
  is_recurring: boolean
  days_until_due?: number
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface AlertCreate {
  type: 'bill' | 'goal' | 'budget' | 'income' | 'custom'
  title: string
  description: string
  amount?: number
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  is_recurring: boolean
}

export interface AlertUpdate {
  title?: string
  description?: string
  amount?: number
  due_date?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'active' | 'dismissed' | 'completed'
  is_recurring?: boolean
}

// Enhanced Financial Overview
export interface FinancialOverview {
  current_balance: number
  monthly_income: number
  monthly_expenses: number
  savings: number
  health_score: number
  health_label: string
  recent_transactions: Transaction[]
  financial_goals: FinancialGoal[]
  alerts: FinancialAlert[]
  insights: {
    health_score: number
    health_label: string
    risk_level: 'low' | 'medium' | 'high'
    monthly_trend: 'up' | 'down' | 'stable'
    recommendations: string[]
  }
  trends: {
    income_trend: 'up' | 'down' | 'stable'
    expense_trend: 'up' | 'down' | 'stable'
    savings_trend: 'up' | 'down' | 'stable'
  }
}

// Filter state interface for transactions
export interface FilterState {
  search: string
  type: 'all' | 'income' | 'expense'
  category: string
  dateRange: {
    start: Date | null
    end: Date | null
  }
  amountRange: {
    min: number | null
    max: number | null
  }
  sortBy: 'transaction_date' | 'amount' | 'description' | 'created_at'
  sortOrder: 'asc' | 'desc'
}

// Modal state interface for transactions
export interface ModalState {
  isCreateOpen: boolean
  isEditOpen: boolean
  isDeleteOpen: boolean
  isDetailsOpen: boolean
  selectedTransaction: Transaction | null
}

