"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart3, TrendingUp, Download, Calendar, Filter, Loader2, AlertCircle } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useGlobalDataContext } from "@/contexts/transaction-context"
import { FinancialReportsSkeleton } from "./financial-reports-skeleton"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts"

interface MonthlyData {
  month: string
  receitas: number
  despesas: number
  saldo: number
}

interface CategoryData {
  name: string
  value: number
  percentage: number
  color: string
}

interface TrendData {
  month: string
  valor: number
}

interface SummaryData {
  totalReceitas: number
  totalDespesas: number
  saldoLiquido: number
  mediaReceitas: number
  mediaDespesas: number
  maiorReceita: { valor: number; mes: string }
  maiorDespesa: { valor: number; mes: string }
}

export function FinancialReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldoLiquido: 0,
    mediaReceitas: 0,
    mediaDespesas: 0,
    maiorReceita: { valor: 0, mes: "" },
    maiorDespesa: { valor: 0, mes: "" },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()
  const { refreshTrigger } = useGlobalDataContext()

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate date range based on selected period
      const endDate = new Date()
      const startDate = new Date()
      
      switch (selectedPeriod) {
        case "3months":
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case "6months":
          startDate.setMonth(endDate.getMonth() - 6)
          break
        case "1year":
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        default:
          startDate.setMonth(endDate.getMonth() - 6)
      }

      const dateRange = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      }

      let summaryData = null
      let categoryData = null

      try {
        // Try to load summary data from API
        const summaryResponse = await apiService.getTransactionSummary(dateRange)
        if (summaryResponse.data) {
          summaryData = summaryResponse.data
        }
      } catch (apiError) {
        console.warn("API not available, using mock data for summary:", apiError)
      }

      try {
        // Try to load category data from API
        const categoryResponse = await apiService.getCategorySummary({
          transaction_type: "expense",
          ...dateRange
        })
        if (categoryResponse.data) {
          categoryData = categoryResponse.data
        }
      } catch (apiError) {
        console.warn("API not available, using mock data for categories:", apiError)
      }

      // Set summary data from API with correct field mapping
      setSummaryData({
        totalReceitas: summaryData?.total_income || 0,
        totalDespesas: summaryData?.total_expenses || 0,
        saldoLiquido: summaryData?.net_amount || 0,
        mediaReceitas: summaryData?.income_count > 0 ? (summaryData?.total_income || 0) / summaryData.income_count : 0,
        mediaDespesas: summaryData?.expense_count > 0 ? (summaryData?.total_expenses || 0) / summaryData.expense_count : 0,
        maiorReceita: { valor: summaryData?.largest_income || 0, mes: "N/A" },
        maiorDespesa: { valor: summaryData?.largest_expense || 0, mes: "N/A" },
      })

      // Set category data (from API or mock)
      if (categoryData) {
        const total = categoryData.reduce((sum, cat) => sum + (cat.total_amount || 0), 0)
        const processedCategoryData = categoryData.map((cat, index) => ({
          name: cat.category_name || "Sem categoria",
          value: cat.total_amount || 0,
          percentage: total > 0 ? Math.round(((cat.total_amount || 0) / total) * 100) : 0,
          color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
        }))
        setCategoryData(processedCategoryData)
      } else {
        // No category data available
        setCategoryData([])
      }

      // Load real transaction data for monthly and trend analysis
      const monthlyData = await generateRealMonthlyData(startDate, endDate)
      setMonthlyData(monthlyData)

      // Generate trend data from real data
      const trendData = await generateRealTrendData(startDate, endDate)
      setTrendData(trendData)

    } catch (err) {
      console.error("Error loading report data:", err)
      // Don't set error state, just use mock data
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const generateRealMonthlyData = async (startDate: Date, endDate: Date): Promise<MonthlyData[]> => {
    const months = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const monthName = current.toLocaleDateString('pt-BR', { month: 'short' })
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
      
      let receitas = 0
      let despesas = 0
      
      try {
        // Use the summary API for more accurate and efficient data
        const summaryResponse = await apiService.getTransactionSummary({
          start_date: monthStart.toISOString().split('T')[0],
          end_date: monthEnd.toISOString().split('T')[0]
        })
        
        if (summaryResponse.data) {
          receitas = Number(summaryResponse.data.total_income || 0)
          despesas = Number(summaryResponse.data.total_expenses || 0)
          console.log(`Month ${monthName}: Income=${receitas}, Expenses=${despesas}`)
        } else {
          // Fallback to individual transactions if summary fails
          const response = await apiService.getTransactions({
            start_date: monthStart.toISOString().split('T')[0],
            end_date: monthEnd.toISOString().split('T')[0],
            page: 1,
            size: 1000
          })
          
          if (response.data && response.data.items) {
            response.data.items.forEach((transaction: any) => {
              if (transaction.type === 'income') {
                receitas += Number(transaction.amount)
              } else if (transaction.type === 'expense') {
                despesas += Number(transaction.amount)
              }
            })
          }
        }
      } catch (error) {
        console.warn(`Error loading data for ${monthName}:`, error)
        // Keep values at 0 if API fails
      }
      
      months.push({
        month: monthName,
        receitas: Math.round(receitas),
        despesas: Math.round(despesas),
        saldo: Math.round(receitas - despesas)
      })
      
      current.setMonth(current.getMonth() + 1)
    }
    
    return months
  }

  const generateRealTrendData = async (startDate: Date, endDate: Date): Promise<TrendData[]> => {
    const months = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const monthName = current.toLocaleDateString('pt-BR', { month: 'short' })
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
      
      let totalValue = 0
      
      try {
        // Use the summary API for more accurate and efficient data
        const summaryResponse = await apiService.getTransactionSummary({
          start_date: monthStart.toISOString().split('T')[0],
          end_date: monthEnd.toISOString().split('T')[0]
        })
        
        if (summaryResponse.data) {
          totalValue = Number(summaryResponse.data.net_amount || 0)
          console.log(`Trend ${monthName}: Net Value=${totalValue}`)
        } else {
          // Fallback to individual transactions if summary fails
          const response = await apiService.getTransactions({
            start_date: monthStart.toISOString().split('T')[0],
            end_date: monthEnd.toISOString().split('T')[0],
            page: 1,
            size: 1000
          })
          
          if (response.data && response.data.items) {
            response.data.items.forEach((transaction: any) => {
              if (transaction.type === 'income') {
                totalValue += Number(transaction.amount)
              } else if (transaction.type === 'expense') {
                totalValue -= Number(transaction.amount)
              }
            })
          }
        }
      } catch (error) {
        console.warn(`Error loading trend data for ${monthName}:`, error)
        // Keep value at 0 if API fails
      }
      
      months.push({
        month: monthName,
        valor: Math.round(totalValue)
      })
      
      current.setMonth(current.getMonth() + 1)
    }
    
    return months
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData()
  }, [selectedPeriod, selectedCategory, refreshTrigger])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const exportReport = () => {
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação será implementada em breve",
    })
  }

  if (loading) {
    return <FinancialReportsSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Filtros e Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Controles de Relatório</span>
            </CardTitle>
            <Button onClick={exportReport} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar Relatório</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label htmlFor="period-select" className="text-sm font-medium">
                Período
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger id="period-select" className="w-full sm:w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último ano</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="category-select" className="text-sm font-medium">
                Categoria
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-select" className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categoryData.map((category) => (
                    <SelectItem key={category.name} value={category.name.toLowerCase()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryData.totalReceitas)}</div>
            <p className="text-xs text-muted-foreground">Média: {formatCurrency(summaryData.mediaReceitas)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summaryData.totalDespesas)}</div>
            <p className="text-xs text-muted-foreground">Média: {formatCurrency(summaryData.mediaDespesas)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(summaryData.saldoLiquido)}</div>
            <p className="text-xs text-muted-foreground">Acumulado no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maior Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(summaryData.maiorReceita.valor)}</div>
            <p className="text-xs text-muted-foreground">{summaryData.maiorReceita.mes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Visualizações */}
      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
        </TabsList>

        {/* Gráfico Mensal */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas por Mês</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comparação mensal entre receitas e despesas nos últimos 6 meses
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  receitas: {
                    label: "Receitas",
                    color: "hsl(var(--chart-1))",
                  },
                  despesas: {
                    label: "Despesas",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="receitas" fill="var(--color-receitas)" name="Receitas" />
                    <Bar dataKey="despesas" fill="var(--color-despesas)" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Descrição textual para acessibilidade */}
              <div className="sr-only">
                Gráfico de barras mostrando receitas e despesas mensais. Julho: Receitas R$ 4.000, Despesas R$ 2.800.
                Agosto: Receitas R$ 4.200, Despesas R$ 3.000. Setembro: Receitas R$ 3.800, Despesas R$ 2.600. Outubro:
                Receitas R$ 4.500, Despesas R$ 3.200. Novembro: Receitas R$ 4.100, Despesas R$ 2.900. Dezembro: Receitas
                R$ 4.300, Despesas R$ 3.100.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de Categorias */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <p className="text-sm text-muted-foreground">Percentual de gastos por categoria</p>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Valor",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Descrição textual para acessibilidade */}
                <div className="sr-only">
                  Gráfico de pizza mostrando distribuição de gastos: Alimentação 35% (R$ 1.200), Transporte 20% (R$
                  680), Utilidades 18% (R$ 612), Lazer 15% (R$ 510), Outros 12% (R$ 408).
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                          aria-hidden="true"
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(category.value)}</div>
                        <Badge variant="secondary">{category.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gráfico de Tendências */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Gastos</CardTitle>
              <p className="text-sm text-muted-foreground">Evolução dos gastos ao longo do ano</p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  valor: {
                    label: "Valor",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="var(--color-valor)"
                      fill="var(--color-valor)"
                      fillOpacity={0.3}
                      name="Gastos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Descrição textual para acessibilidade */}
              <div className="sr-only">
                Gráfico de área mostrando tendência de gastos mensais ao longo do ano, variando entre R$ 3.100 e R$
                4.300, com tendência geral de crescimento.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tabela de Dados */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Dados Detalhados</CardTitle>
              <p className="text-sm text-muted-foreground">Tabela completa com todos os dados do período</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" role="table">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium" scope="col">
                        Mês
                      </th>
                      <th className="text-right p-3 font-medium" scope="col">
                        Receitas
                      </th>
                      <th className="text-right p-3 font-medium" scope="col">
                        Despesas
                      </th>
                      <th className="text-right p-3 font-medium" scope="col">
                        Saldo
                      </th>
                      <th className="text-right p-3 font-medium" scope="col">
                        Variação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row, index) => {
                      const previousRow = index > 0 ? monthlyData[index - 1] : null
                      const variation = previousRow ? row.saldo - previousRow.saldo : 0
                      return (
                        <tr key={row.month} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{row.month}</td>
                          <td className="p-3 text-right text-green-600">{formatCurrency(row.receitas)}</td>
                          <td className="p-3 text-right text-red-600">{formatCurrency(row.despesas)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(row.saldo)}</td>
                          <td className="p-3 text-right">
                            {variation !== 0 && (
                              <div
                                className={`flex items-center justify-end space-x-1 ${
                                  variation > 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                <TrendingUp className={`h-3 w-3 ${variation < 0 ? "rotate-180" : ""}`} />
                                <span>{formatCurrency(Math.abs(variation))}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
