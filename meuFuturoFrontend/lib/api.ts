/**
 * API service for MeuFuturo backend integration
 */

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
    options: RequestInit = {}
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
        data = await response.json()
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError)
        return {
          error: 'Resposta inválida do servidor',
          message: 'Resposta inválida do servidor'
        }
      }

      if (!response.ok) {
        return {
          error: data.detail || data.message || 'Erro na requisição',
          message: data.detail || data.message || 'Erro na requisição'
        }
      }

      // Check if response has error field (backend error format)
      if (data.error) {
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
}

export const apiService = new ApiService()
export default apiService
