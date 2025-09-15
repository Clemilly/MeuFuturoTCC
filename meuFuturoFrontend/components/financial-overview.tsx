"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  PlusCircle,
  BarChart3,
  Target,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { apiService } from "@/lib/api"
import { useGlobalDataContext } from "@/contexts/transaction-context"
import { FinancialOverviewSkeleton } from "./financial-overview-skeleton"

interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  transaction_date: string
  category?: {
    name: string
  }
}

interface FinancialData {
  currentBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savings: number
}

interface FinancialGoal {
  id: string
  name: string
  current_amount: number
  target_amount: number
  category: string
  target_date?: string
  description?: string
}

interface ApiTransactionResponse {
  items: Transaction[]
  page: number
  size: number
  total: number
  pages: number
  has_next: boolean
  has_previous: boolean
}

interface ApiFinancialOverviewResponse {
  current_month: {
    total_income: number
    total_expenses: number
    net_amount: number
    transaction_count: number
  }
  recent_transactions: Transaction[]
  overall_summary: {
    total_income: number
    total_expenses: number
    net_amount: number
    transaction_count: number
  }
  current_balance: number
}

interface ApiFinancialGoalsResponse extends Array<{
  id: string
  name: string
  current_amount: number
  target_amount: number
  category: string
  target_date?: string
  description?: string
}> {}

export function FinancialOverview() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
  })

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [previousMonthData, setPreviousMonthData] = useState<{
    income: number
    expenses: number
  }>({ income: 0, expenses: 0 })
  
  const { refreshTrigger } = useGlobalDataContext()
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Load financial data from API
  useEffect(() => {
    const loadFinancialData = async () => {
      if (!isMounted.current) return
      
      try {
        setLoading(true)
        setError(null)

        console.log('Starting to load financial data...')

        // Load financial overview from API
        console.log('Loading financial overview...')
        let overviewResponse
        try {
          overviewResponse = await apiService.getFinancialOverview()
          console.log('Overview response:', overviewResponse)
        } catch (apiError) {
          console.error('API call failed:', apiError)
          // Continue without overview data, we'll calculate from transactions
          overviewResponse = { error: true, message: 'Overview endpoint not available' }
        }
        
        if (!isMounted.current) return
        
        if (overviewResponse.error) {
          console.error('Error loading overview:', overviewResponse.message)
          
          // Check if it's an authentication error
          if (overviewResponse.message?.includes('Not authenticated') || 
              overviewResponse.message?.includes('Token inválido') ||
              overviewResponse.message?.includes('Token expirado')) {
            console.warn('Authentication error - user may need to login again')
            if (isMounted.current) {
              setLoading(false)
            }
            return
          }
          
          // If overview endpoint is not available, calculate from transactions
          console.log('Overview endpoint not available, calculating from transactions...')
        }

        let monthlyIncome = 0
        let monthlyExpenses = 0
        let recentTransactions: Transaction[] = []
        let currentBalance = 0

        if (overviewResponse.data) {
          // Use overview data if available
          const overviewData = overviewResponse.data
          console.log('Overview data loaded:', overviewData)

          const currentMonth = (overviewData as any).current_month
          recentTransactions = (overviewData as any).recent_transactions || []
          const overallSummary = (overviewData as any).overall_summary
          currentBalance = (overviewData as any).current_balance || 0

          monthlyIncome = currentMonth?.total_income || 0
          monthlyExpenses = currentMonth?.total_expenses || 0

          console.log(`Monthly data from API - Income: ${monthlyIncome}, Expenses: ${monthlyExpenses}`)
        } else {
          // Calculate from transactions if overview not available
          console.log('Calculating financial data from transactions...')
          
          try {
            // Load current month transactions
            const currentDate = new Date()
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
            
            const transactionsResponse = await apiService.getTransactions({
              start_date: startOfMonth.toISOString().split('T')[0],
              end_date: endOfMonth.toISOString().split('T')[0],
              page: 1,
              size: 1000
            })

            if (!isMounted.current) return

            if (transactionsResponse.data && (transactionsResponse.data as any)?.items) {
              const items = (transactionsResponse.data as any).items
              console.log(`Found ${items.length} transactions for current month`)
              
              // Calculate monthly totals
              items.forEach((transaction: Transaction) => {
                if (transaction.type === 'income') {
                  monthlyIncome += transaction.amount
                } else if (transaction.type === 'expense') {
                  monthlyExpenses += transaction.amount
                }
              })
              
              // Set recent transactions (limit to 5)
              recentTransactions = items.slice(0, 5)
              
              console.log(`Calculated current month - Income: ${monthlyIncome}, Expenses: ${monthlyExpenses}`)
            }
          } catch (apiError) {
            console.error('Error loading transactions for calculation:', apiError)
          }
        }

        // Set recent transactions
        if (isMounted.current) {
          setRecentTransactions(recentTransactions)
        }
        console.log('Recent transactions loaded:', recentTransactions.length)

        // Load previous month data for comparison
        const currentDate = new Date()
        const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        const endOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
        let previousMonthIncome = 0
        let previousMonthExpenses = 0

        try {
          const previousMonthTransactionsResponse = await apiService.getTransactions({
            start_date: startOfPreviousMonth.toISOString().split('T')[0],
            end_date: endOfPreviousMonth.toISOString().split('T')[0],
            page: 1,
            size: 1000
          })

          if (!isMounted.current) return

          if (previousMonthTransactionsResponse.error) {
            console.warn('Error loading previous month transactions:', previousMonthTransactionsResponse.message)
            // Don't fail completely, just use 0 for comparison
          } else if ((previousMonthTransactionsResponse.data as any)?.items) {
            const items = (previousMonthTransactionsResponse.data as any).items
            console.log(`Found ${items.length} transactions for previous month`)
            
            items.forEach((transaction: Transaction) => {
              if (transaction.type === 'income') {
                previousMonthIncome += transaction.amount
              } else if (transaction.type === 'expense') {
                previousMonthExpenses += transaction.amount
              }
            })
            
            console.log(`Calculated previous month income: ${previousMonthIncome}, expenses: ${previousMonthExpenses}`)
          }
        } catch (apiError) {
          console.error('Error loading previous month transactions:', apiError)
          // Don't fail completely, just use 0 for comparison
        }

        // Store previous month data
        if (isMounted.current) {
          setPreviousMonthData({
            income: previousMonthIncome,
            expenses: previousMonthExpenses
          })
        }

        // Set financial data using calculated data
        if (isMounted.current) {
          setFinancialData({
            currentBalance: currentBalance,
            monthlyIncome: monthlyIncome,
            monthlyExpenses: monthlyExpenses,
            savings: monthlyIncome - monthlyExpenses, // Calculate savings from income - expenses
          })
        }
        
        console.log('Financial data set from API:', {
          currentBalance: currentBalance,
          monthlyIncome: monthlyIncome,
          monthlyExpenses: monthlyExpenses,
          savings: monthlyIncome - monthlyExpenses,
        })

        // Load financial goals
        console.log('Loading financial goals...')
        try {
          const goalsResponse = await apiService.getFinancialGoals()
          if (!isMounted.current) return
          
          if (goalsResponse.error) {
            console.warn('Error loading financial goals:', goalsResponse.message)
            // Don't fail completely, just use empty array
          } else if (goalsResponse.data && isMounted.current) {
            const goalsData = goalsResponse.data as ApiFinancialGoalsResponse
            setFinancialGoals(goalsData)
            console.log('Financial goals loaded:', goalsData.length)
          }
        } catch (apiError) {
          console.error('Error loading financial goals:', apiError)
          // Don't fail completely, just use empty array
        }

      } catch (err) {
        console.error("Error loading financial data:", err)
        // Continue with skeleton loading instead of showing error
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    loadFinancialData()
  }, [refreshTrigger])

  // Financial goals are now loaded from API

  // Calculate health score based on real data
  const calculateHealthScore = () => {
    if (financialData.monthlyIncome === 0) return 0
    
    const expenseRatio = financialData.monthlyExpenses / financialData.monthlyIncome
    const savingsRatio = financialData.savings / financialData.monthlyIncome
    
    // Health score based on expense ratio and savings
    let score = 100
    if (expenseRatio > 0.8) score -= 30 // High expenses
    if (expenseRatio > 0.9) score -= 20 // Very high expenses
    if (savingsRatio < 0.1) score -= 20 // Low savings
    if (savingsRatio < 0.05) score -= 10 // Very low savings
    
    return Math.max(0, Math.min(100, score))
  }

  const healthScore = calculateHealthScore()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  // Calculate percentage change from previous month
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }
    return ((current - previous) / previous) * 100
  }

  // Get percentage change for income
  const getIncomePercentageChange = () => {
    const change = calculatePercentageChange(financialData.monthlyIncome, previousMonthData.income)
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
      text: previousMonthData.income === 0 
        ? "Primeiro mês com receitas" 
        : `${change >= 0 ? '+' : ''}${change.toFixed(1)}% em relação ao mês anterior`
    }
  }

  // Get percentage change for expenses
  const getExpensePercentageChange = () => {
    const change = calculatePercentageChange(financialData.monthlyExpenses, previousMonthData.expenses)
    return {
      value: Math.abs(change),
      isPositive: change <= 0, // For expenses, decrease is positive
      text: previousMonthData.expenses === 0 
        ? "Primeiro mês com despesas" 
        : `${change >= 0 ? '+' : ''}${change.toFixed(1)}% em relação ao mês anterior`
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente"
    if (score >= 60) return "Boa"
    if (score >= 40) return "Regular"
    return "Precisa Atenção"
  }

  if (loading) {
    return <FinancialOverviewSkeleton />
  }

  // Show skeleton if no data and there might be an authentication issue
  if (financialData.monthlyIncome === 0 && financialData.monthlyExpenses === 0 && !error) {
    return <FinancialOverviewSkeleton />
  }

  // Show error message if there's an authentication issue
  if (error && (error.includes('Not authenticated') || error.includes('Token inválido') || error.includes('Token expirado'))) {
    return (
      <section aria-labelledby="financial-overview-title">
        <h2 id="financial-overview-title" className="text-2xl font-semibold mb-6">
          Resumo Financeiro
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Sessão Expirada
          </h3>
          <p className="text-yellow-700 mb-4">
            Sua sessão expirou. Por favor, faça login novamente para visualizar seus dados financeiros.
          </p>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Fazer Login
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="financial-overview-title">
      <h2 id="financial-overview-title" className="text-2xl font-semibold mb-6">
        Resumo Financeiro
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(financialData.currentBalance)}</div>
            <p className="text-xs text-muted-foreground">Atualizado agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financialData.monthlyIncome)}</div>
            <p className={`text-xs ${getIncomePercentageChange().isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {getIncomePercentageChange().text}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(financialData.monthlyExpenses)}</div>
            <p className={`text-xs ${getExpensePercentageChange().isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {getExpensePercentageChange().text}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poupança</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialData.savings)}</div>
            <p className="text-xs text-muted-foreground">Meta: R$ 2.000,00</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Saúde Financeira</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getHealthScoreColor(healthScore)}`}>{healthScore}/100</div>
                <p className={`text-sm font-medium ${getHealthScoreColor(healthScore)}`}>
                  {getHealthScoreLabel(healthScore)}
                </p>
              </div>
              <Progress value={healthScore} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                Baseado em suas receitas, despesas e metas
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Metas Financeiras</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialGoals.length > 0 ? (
                financialGoals.map((goal) => {
                  const progress = (goal.current_amount / goal.target_amount) * 100
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{goal.name}</h4>
                          <p className="text-sm text-muted-foreground">{goal.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">{progress.toFixed(0)}% concluído</div>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma meta financeira definida</p>
                  <p className="text-sm">Crie metas para acompanhar seu progresso</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name || "Sem categoria"} • {formatDate(transaction.transaction_date)}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma transação encontrada</p>
                  <p className="text-sm">Adicione transações para ver o histórico</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas Financeiros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Conta de Internet</h4>
                    <p className="text-sm text-yellow-700">Vence em 3 dias - R$ 89,90</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                <div className="flex items-start space-x-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Meta de Poupança</h4>
                    <p className="text-sm text-blue-700">Você está 60% próximo da sua meta mensal!</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Gastos Controlados</h4>
                    <p className="text-sm text-green-700">Suas despesas estão 15% abaixo do planejado este mês</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-6 text-center">
              <PlusCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Adicionar Receita</h4>
              <p className="text-sm text-muted-foreground">Registre uma nova entrada</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-6 text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Adicionar Despesa</h4>
              <p className="text-sm text-muted-foreground">Registre uma nova saída</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Ver Relatórios</h4>
              <p className="text-sm text-muted-foreground">Analise suas finanças</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
