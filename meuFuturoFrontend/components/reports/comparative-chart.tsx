"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ComparativeChartProps } from '@/lib/types'

export function ComparativeChart({ data, loading = false }: ComparativeChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Períodos</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Períodos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            Nenhum dado disponível para comparação
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for the chart
  const chartData = [
    {
      name: 'Receitas',
      'Período 1': Number(data.period1.income),
      'Período 2': Number(data.period2.income),
      change: data.comparison.income_change
    },
    {
      name: 'Despesas',
      'Período 1': Number(data.period1.expenses),
      'Período 2': Number(data.period2.expenses),
      change: data.comparison.expenses_change
    },
    {
      name: 'Saldo Líquido',
      'Período 1': Number(data.period1.net_amount),
      'Período 2': Number(data.period2.net_amount),
      change: data.comparison.net_change
    }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-600" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo de Períodos</CardTitle>
        <div className="text-sm text-muted-foreground">
          Comparação entre {data.period1.period} e {data.period2.period}
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `${label}:`}
              />
              <Legend />
              <Bar dataKey="Período 1" fill="#8884d8" name="Período 1" />
              <Bar dataKey="Período 2" fill="#82ca9d" name="Período 2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Receitas</span>
              <div className="flex items-center gap-1">
                {getChangeIcon(data.comparison.income_change)}
                <span className={`text-sm font-medium ${getChangeColor(data.comparison.income_change)}`}>
                  {data.comparison.income_change > 0 ? '+' : ''}{data.comparison.income_change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(data.comparison.income_absolute)} de diferença
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Despesas</span>
              <div className="flex items-center gap-1">
                {getChangeIcon(data.comparison.expenses_change)}
                <span className={`text-sm font-medium ${getChangeColor(data.comparison.expenses_change)}`}>
                  {data.comparison.expenses_change > 0 ? '+' : ''}{data.comparison.expenses_change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(data.comparison.expenses_absolute)} de diferença
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Saldo Líquido</span>
              <div className="flex items-center gap-1">
                {getChangeIcon(data.comparison.net_change)}
                <span className={`text-sm font-medium ${getChangeColor(data.comparison.net_change)}`}>
                  {data.comparison.net_change > 0 ? '+' : ''}{data.comparison.net_change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(data.comparison.net_absolute)} de diferença
            </div>
          </div>
        </div>

        {/* Insights */}
        {data.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Insights Automáticos</h4>
            <div className="space-y-1">
              {data.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Badge variant="secondary" className="mt-0.5">•</Badge>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

