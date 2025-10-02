/**
 * API service for MeuFuturo backend integration
 */

import { 
  FinancialGoal, 
  GoalCreate, 
  GoalUpdate, 
  GoalProgressUpdate,
  FinancialAlert,
  AlertCreate,
  AlertUpdate,
  FinancialOverview
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

class ApiService {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { responseType?: 'json' | 'blob' } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if token exists (only in browser)
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('meufuturo_token')
        if (token && token !== 'undefined' && token !== 'null' && token !== '""') {
          let parsedToken = token
          
          // Try to parse as JSON first (in case it was stored by useLocalStorage)
          try {
            const parsed = JSON.parse(token)
            if (typeof parsed === 'string') {
              parsedToken = parsed
            }
          } catch {
            // If parsing fails, use the token as is
          }
          
          if (parsedToken && typeof parsedToken === 'string' && parsedToken.length > 0) {
            defaultHeaders['Authorization'] = `Bearer ${parsedToken}`
          }
        }
      } catch (error) {
        console.warn('Error accessing localStorage:', error)
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.error('API service called on server side')
        return {
          error: 'Execução no servidor',
          message: 'Este serviço deve ser executado apenas no cliente'
        }
      }

      // Check if fetch is available
      if (typeof fetch === 'undefined') {
        console.error('Fetch is not available in this environment')
        return {
          error: 'Fetch não disponível',
          message: 'Fetch não está disponível neste ambiente'
        }
      }

      // Validate URL and config before making request
      if (!url || typeof url !== 'string') {
        console.error('Invalid URL:', url)
        return {
          error: 'URL inválida',
          message: 'URL da requisição é inválida'
        }
      }

      if (!config || typeof config !== 'object') {
        console.error('Invalid config:', config)
        return {
          error: 'Configuração inválida',
          message: 'Configuração da requisição é inválida'
        }
      }

      
      const response = await fetch(url, config)
      
      let data
      try {
        if (options.responseType === 'blob') {
          data = await response.blob()
        } else {
          data = await response.json()
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        return {
          error: 'Resposta inválida do servidor',
          message: 'Resposta inválida do servidor'
        }
      }

      if (!response.ok) {
        if (options.responseType === 'blob') {
          return {
            error: 'Erro na requisição',
            message: 'Erro na requisição'
          }
        }
        
        // Check for authentication errors
        const errorMessage = data.detail || data.message || 'Erro na requisição'
        const isAuthError = response.status === 401 || 
          errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('expired') ||
          errorMessage.toLowerCase().includes('invalid')
        
        if (isAuthError) {
          // Clear stored token and user data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('meufuturo_token')
            localStorage.removeItem('meufuturo_user')
          }
        }
        
        return {
          error: errorMessage,
          message: errorMessage,
          status: response.status,
          isAuthError
        }
      }

      // Check if response has error field (backend error format) - only for JSON responses
      if (options.responseType !== 'blob' && data.error) {
        return {
          error: data.message || data.error,
          message: data.message || data.error
        }
      }

      return { data }
    } catch (error) {
      console.error('Request error:', error)
      
      // Check if it's a network error (API not available)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          error: 'API não disponível',
          message: 'Servidor não está respondendo. Verifique se o backend está rodando.'
        }
      }
      
      // Check if it's a CORS error
      if (error instanceof TypeError && error.message.includes('CORS')) {
        return {
          error: 'Erro de CORS',
          message: 'Erro de configuração de CORS. Verifique se o backend está configurado corretamente.'
        }
      }
      
      // Check if it's a network timeout
      if (error instanceof TypeError && error.message.includes('timeout')) {
        return {
          error: 'Timeout da requisição',
          message: 'A requisição demorou muito para responder.'
        }
      }
      
      return {
        error: 'Erro de conexão com o servidor',
        message: 'Erro de conexão com o servidor'
      }
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    email: string
    password: string
    name: string
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async verifyTwoFactor(code: string) {
    return this.request('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async enableTwoFactor() {
    return this.request('/auth/enable-2fa', {
      method: 'POST',
    })
  }

  async confirmTwoFactor(code: string) {
    return this.request('/auth/confirm-2fa', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async disableTwoFactor(code: string) {
    return this.request('/auth/disable-2fa', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async getProfile() {
    return this.request('/auth/profile')
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  // About page endpoints
  async getAboutData() {
    return this.request('/about/data')
  }

  async getPlatformStats() {
    return this.request('/platform/stats')
  }

  async getUserProgress() {
    return this.request('/user/progress')
  }

  async getAccessibilitySettings() {
    return this.request('/accessibility/settings')
  }

  async updateAccessibilitySettings(settings: any) {
    return this.request('/accessibility/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  async submitFeedback(feedback: any) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    })
  }

  // Financial endpoints
  async getTransactions(filters?: {
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
    sort_order?: string
  }) {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    return this.request(`/financial/transactions${queryString ? `?${queryString}` : ''}`)
  }

  async getTransaction(id: string) {
    return this.request(`/financial/transactions/${id}`)
  }

  async createTransaction(transaction: {
    type: 'income' | 'expense'
    amount: number
    description: string
    transaction_date: string
    notes?: string
    category_id?: string
  }) {
    console.log('Creating transaction with data:', transaction)
    console.log('API Base URL:', this.baseURL)
    console.log('Full URL:', `${this.baseURL}/financial/transactions`)
    
    return this.request('/financial/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    })
  }

  async updateTransaction(id: string, transaction: {
    type?: 'income' | 'expense'
    amount?: number
    description?: string
    transaction_date?: string
    notes?: string
    category_id?: string
  }) {
    return this.request(`/financial/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    })
  }

  async deleteTransaction(id: string) {
    return this.request(`/financial/transactions/${id}`, {
      method: 'DELETE',
    })
  }


  // Statistics endpoints
  async getTransactionStats(filters?: {
    start_date?: string
    end_date?: string
    transaction_type?: 'income' | 'expense'
    category_id?: string
  }) {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    return this.request(`/financial/transactions/stats${queryString ? `?${queryString}` : ''}`)
  }

  // Export/Import endpoints
  async exportTransactions(format: 'csv' | 'xlsx' | 'pdf', filters?: {
    start_date?: string
    end_date?: string
    transaction_type?: 'income' | 'expense'
    category_id?: string
  }) {
    const queryParams = new URLSearchParams()
    queryParams.append('format', format)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    return this.request(`/financial/transactions/export${queryString ? `?${queryString}` : ''}`)
  }

  async importTransactions(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.request('/financial/transactions/import', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let the browser set it with boundary
      },
    })
  }

  async getTransactionSummary(filters?: {
    start_date?: string
    end_date?: string
  }) {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    return this.request(`/financial/summary${queryString ? `?${queryString}` : ''}`)
  }

  async getCategorySummary(filters?: {
    transaction_type?: 'income' | 'expense'
    start_date?: string
    end_date?: string
  }) {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    return this.request(`/financial/summary/categories${queryString ? `?${queryString}` : ''}`)
  }

  async getMonthlySummary(year: number, month: number) {
    return this.request(`/financial/summary/monthly/${year}/${month}`)
  }

  async getFinancialOverview() {
    return this.request('/financial/overview')
  }

  async getCategories(includeSystem: boolean = true, includeSubcategories: boolean = true) {
    const queryParams = new URLSearchParams({
      include_system: includeSystem.toString(),
      include_subcategories: includeSubcategories.toString()
    })
    
    return this.request(`/financial/categories?${queryParams.toString()}`)
  }

  async createCategory(category: {
    name: string
    description?: string
    color?: string
    icon?: string
    parent_id?: string
  }) {
    return this.request('/financial/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    })
  }

  async updateCategory(id: string, category: {
    name?: string
    description?: string
    color?: string
    icon?: string
  }) {
    return this.request(`/financial/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    })
  }

  async deleteCategory(id: string) {
    return this.request(`/financial/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // Financial Goals endpoints
  async getFinancialGoals() {
    return this.request('/financial/goals')
  }

  async createFinancialGoal(goal: {
    name: string
    target_amount: number
    current_amount?: number
    target_date?: string
    category?: string
    description?: string
  }) {
    return this.request('/financial/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    })
  }

  async updateFinancialGoal(id: string, goal: {
    name?: string
    target_amount?: number
    current_amount?: number
    target_date?: string
    category?: string
    description?: string
  }) {
    return this.request(`/financial/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    })
  }

  async deleteFinancialGoal(id: string) {
    return this.request(`/financial/goals/${id}`, {
      method: 'DELETE',
    })
  }

  // Financial Reports endpoints
  
  async exportFinancialReport(params: {
    format: 'csv' | 'xlsx' | 'pdf'
    start_date?: string
    end_date?: string
    transaction_type?: 'income' | 'expense'
    category_id?: string
    include_charts?: boolean
  }) {
    const searchParams = new URLSearchParams()
    
    searchParams.append('format', params.format)
    if (params.start_date) searchParams.append('start_date', params.start_date)
    if (params.end_date) searchParams.append('end_date', params.end_date)
    if (params.transaction_type) searchParams.append('transaction_type', params.transaction_type)
    if (params.category_id) searchParams.append('category_id', params.category_id)
    if (params.include_charts !== undefined) searchParams.append('include_charts', params.include_charts.toString())
    
    const url = `/financial/reports/export?${searchParams.toString()}`
    
    return this.request(url, {
      method: 'GET',
      responseType: 'blob' // For file downloads
    })
  }

  async getFinancialAnalytics(params: {
    start_date?: string
    end_date?: string
    granularity?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    transaction_type?: 'income' | 'expense'
    category_id?: string
    min_amount?: number
    max_amount?: number
  }) {
    const searchParams = new URLSearchParams()
    
    if (params.start_date) searchParams.append('start_date', params.start_date)
    if (params.end_date) searchParams.append('end_date', params.end_date)
    if (params.granularity) searchParams.append('granularity', params.granularity)
    if (params.transaction_type) searchParams.append('transaction_type', params.transaction_type)
    if (params.category_id) searchParams.append('category_id', params.category_id)
    if (params.min_amount !== undefined) searchParams.append('min_amount', params.min_amount.toString())
    if (params.max_amount !== undefined) searchParams.append('max_amount', params.max_amount.toString())
    
    const url = `/financial/reports/analytics?${searchParams.toString()}`
    
    return this.request(url)
  }

  async getComparativeReport(params: {
    period1_start: string
    period1_end: string
    period2_start: string
    period2_end: string
  }) {
    const searchParams = new URLSearchParams()
    
    searchParams.append('period1_start', params.period1_start)
    searchParams.append('period1_end', params.period1_end)
    searchParams.append('period2_start', params.period2_start)
    searchParams.append('period2_end', params.period2_end)
    
    const url = `/financial/reports/comparative?${searchParams.toString()}`
    
    return this.request(url)
  }

  async getFinancialTrends(params: {
    start_date?: string
    end_date?: string
    trend_type?: 'net_worth' | 'income' | 'expenses' | 'savings'
  }) {
    const searchParams = new URLSearchParams()
    
    if (params.start_date) searchParams.append('start_date', params.start_date)
    if (params.end_date) searchParams.append('end_date', params.end_date)
    if (params.trend_type) searchParams.append('trend_type', params.trend_type)
    
    const url = `/financial/reports/trends?${searchParams.toString()}`
    
    return this.request(url)
  }

  // Financial Goals
  async getFinancialGoals(): Promise<ApiResponse<FinancialGoal[]>> {
    return this.request('/financial/goals')
  }

  async createFinancialGoal(goalData: GoalCreate): Promise<ApiResponse<FinancialGoal>> {
    return this.request('/financial/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    })
  }

  async updateFinancialGoal(goalId: string, goalData: GoalUpdate): Promise<ApiResponse<FinancialGoal>> {
    return this.request(`/financial/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    })
  }

  async deleteFinancialGoal(goalId: string): Promise<ApiResponse<boolean>> {
    return this.request(`/financial/goals/${goalId}`, {
      method: 'DELETE',
    })
  }

  async updateGoalProgress(goalId: string, progressData: GoalProgressUpdate): Promise<ApiResponse<FinancialGoal>> {
    return this.request(`/financial/goals/${goalId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    })
  }

  // Financial Alerts
  async getFinancialAlerts(): Promise<ApiResponse<FinancialAlert[]>> {
    return this.request('/financial/alerts')
  }

  async createFinancialAlert(alertData: AlertCreate): Promise<ApiResponse<FinancialAlert>> {
    return this.request('/financial/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    })
  }

  async updateFinancialAlert(alertId: string, alertData: AlertUpdate): Promise<ApiResponse<FinancialAlert>> {
    return this.request(`/financial/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(alertData),
    })
  }

  async deleteFinancialAlert(alertId: string): Promise<ApiResponse<boolean>> {
    return this.request(`/financial/alerts/${alertId}`, {
      method: 'DELETE',
    })
  }

  async dismissFinancialAlert(alertId: string): Promise<ApiResponse<FinancialAlert>> {
    return this.request(`/financial/alerts/${alertId}/dismiss`, {
      method: 'PUT',
    })
  }

  async generateSmartAlerts(): Promise<ApiResponse<FinancialAlert[]>> {
    return this.request('/financial/alerts/generate', {
      method: 'POST',
    })
  }

  // Enhanced Financial Overview
  async getEnhancedFinancialOverview(): Promise<ApiResponse<FinancialOverview>> {
    return this.request('/financial/overview')
  }
}

export const apiService = new ApiService()
export default apiService
