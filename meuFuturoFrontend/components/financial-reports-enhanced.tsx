"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart3, TrendingUp, Calendar, Filter, Loader2, AlertCircle, RefreshCw, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGlobalDataContext } from "@/contexts/transaction-context"
import { FinancialReportsSkeleton } from "./financial-reports-skeleton"
import { useFinancialReports } from "@/hooks/use-financial-reports"
import { AdvancedFilters } from "./reports/advanced-filters"
import { ExportOptions } from "./reports/export-options"
import { ComparativeChart } from "./reports/comparative-chart"
import { TrendChart } from "./reports/trend-chart"
import { ReportCard } from "./reports/report-card"
import type { ReportFilters, ExportFormat, TrendType, DateRange } from "@/lib/types"
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

export function FinancialReportsEnhanced() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showComparativeReport, setShowComparativeReport] = useState(false)
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false)
  const [comparativeData, setComparativeData] = useState(null)
  const [trendData, setTrendData] = useState(null)
  
  const { toast } = useToast()
  const { refreshTrigger } = useGlobalDataContext()
  const { 
    loading, 
    error, 
    data, 
    loadReportData, 
    exportReport, 
    getComparativeReport, 
    getTrends,
    refresh,
    clearError
  } = useFinancialReports()

  // Convert period selection to date range
  const getDateRangeFromPeriod = (period: string): ReportFilters => {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
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

    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      granularity: 'monthly'
    }
  }

  // Load data when period or category changes
  useEffect(() => {
    const filters = getDateRangeFromPeriod(selectedPeriod)
    if (selectedCategory !== "all") {
      filters.category_ids = [selectedCategory]
    }
    loadReportData(filters)
  }, [selectedPeriod, selectedCategory, refreshTrigger, loadReportData])

  // Handle advanced filters change
  const handleAdvancedFiltersChange = (filters: ReportFilters) => {
    loadReportData(filters)
  }

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    const filters = getDateRangeFromPeriod(selectedPeriod)
    if (selectedCategory !== "all") {
      filters.category_ids = [selectedCategory]
    }
    await exportReport(format, filters)
  }

  // Handle comparative report
  const handleGenerateComparativeReport = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(endDate.getMonth() - 3)
      
      const period1: DateRange = {
        start: new Date(startDate.getFullYear(), startDate.getMonth() - 3, 1),
        end: new Date(startDate.getFullYear(), startDate.getMonth(), 0)
      }
      
      const period2: DateRange = {
        start: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
        end: new Date(endDate.getFullYear(), endDate.getMonth(), 0)
      }
      
      const result = await getComparativeReport(period1, period2)
      setComparativeData(result)
      setShowComparativeReport(true)
    } catch (error) {
      console.error('Error generating comparative report:', error)
    }
  }

  // Handle trend analysis
  const handleGenerateTrendAnalysis = async () => {
    try {
      const filters = getDateRangeFromPeriod(selectedPeriod)
      const result = await getTrends(filters, 'net_worth')
      setTrendData(result)
      setShowTrendAnalysis(true)
    } catch (error) {
      console.error('Error generating trend analysis:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (loading && !data) {
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
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <ExportOptions onExport={handleExport} loading={loading} />
            </div>
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
                  {data?.categories.map((category) => (
                    <SelectItem key={category.category_id} value={category.category_id || 'unknown'}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <AdvancedFilters
          filters={getDateRangeFromPeriod(selectedPeriod)}
          onFiltersChange={handleAdvancedFiltersChange}
          categories={data?.categories || []}
          loadingCategories={loading}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Total de Receitas"
          value={data?.summary.income || 0}
          subtitle={`${data?.summary.transaction_count || 0} transações`}
          loading={loading}
        />

        <ReportCard
          title="Total de Despesas"
          value={data?.summary.expenses || 0}
          subtitle={`${data?.summary.transaction_count || 0} transações`}
          loading={loading}
        />

        <ReportCard
          title="Saldo Líquido"
          value={data?.summary.balance || 0}
          subtitle="Acumulado no período"
          loading={loading}
        />

        <ReportCard
          title="Média por Transação"
          value={data?.summary.transaction_count > 0 ? (data.summary.balance / data.summary.transaction_count) : 0}
          subtitle="Valor médio"
          loading={loading}
        />
      </div>

      {/* Gráficos e Visualizações */}
      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="comparative">Comparativo</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
        </TabsList>

        {/* Gráfico Mensal */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas por Mês</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comparação mensal entre receitas e despesas
              </p>
            </CardHeader>
            <CardContent>
              {data?.analytics && data.analytics.length > 0 ? (
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
                    <BarChart data={data.analytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="period" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="income" fill="var(--color-receitas)" name="Receitas" />
                      <Bar dataKey="expenses" fill="var(--color-despesas)" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
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
                {data?.categories && data.categories.length > 0 ? (
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
                          data={data.categories.map((cat, index) => ({
                            name: cat.category_name,
                            value: cat.total_amount,
                            percentage: cat.percentage,
                            color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {data.categories.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    Nenhuma categoria encontrada
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)` }}
                          aria-hidden="true"
                        />
                        <span className="font-medium">{category.category_name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(category.total_amount)}</div>
                        <Badge variant="secondary">{category.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análise de Tendências */}
        <TabsContent value="trends">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Análise de Tendências</h3>
                <p className="text-sm text-muted-foreground">
                  Análise avançada com previsões baseadas em dados históricos
                </p>
              </div>
              <Button onClick={handleGenerateTrendAnalysis} disabled={loading}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Gerar Análise
              </Button>
            </div>
            
            {showTrendAnalysis && trendData ? (
              <TrendChart data={trendData} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    Clique em "Gerar Análise" para ver as tendências financeiras
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Relatório Comparativo */}
        <TabsContent value="comparative">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Relatório Comparativo</h3>
                <p className="text-sm text-muted-foreground">
                  Compare períodos diferentes para identificar padrões e mudanças
                </p>
              </div>
              <Button onClick={handleGenerateComparativeReport} disabled={loading}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Gerar Comparativo
              </Button>
            </div>
            
            {showComparativeReport && comparativeData ? (
              <ComparativeChart data={comparativeData} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    Clique em "Gerar Comparativo" para comparar períodos
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tabela de Dados */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Dados Detalhados</CardTitle>
              <p className="text-sm text-muted-foreground">Tabela completa com todos os dados do período</p>
            </CardHeader>
            <CardContent>
              {data?.analytics && data.analytics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" role="table">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium" scope="col">Período</th>
                        <th className="text-right p-3 font-medium" scope="col">Receitas</th>
                        <th className="text-right p-3 font-medium" scope="col">Despesas</th>
                        <th className="text-right p-3 font-medium" scope="col">Saldo</th>
                        <th className="text-right p-3 font-medium" scope="col">Transações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.analytics.map((row, index) => (
                        <tr key={row.period} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{row.period}</td>
                          <td className="p-3 text-right text-green-600">{formatCurrency(row.income)}</td>
                          <td className="p-3 text-right text-red-600">{formatCurrency(row.expenses)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(row.net_amount)}</td>
                          <td className="p-3 text-right">{row.transaction_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
