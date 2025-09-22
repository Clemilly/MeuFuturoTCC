"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TrendChartProps, TrendDirection } from '@/lib/types'

export function TrendChart({ data, loading = false }: TrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Tendências</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.data_points.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Tendências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            Nenhum dado disponível para análise de tendências
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for the chart (combine historical and forecast data)
  const chartData = [
    ...data.data_points.map(point => ({
      period: point.period,
      value: Number(point.net_amount),
      type: 'Histórico'
    })),
    ...(data.forecast || []).map(point => ({
      period: point.period,
      value: Number(point.net_amount),
      type: 'Previsão'
    }))
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getTrendIcon = (direction: TrendDirection) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (direction: TrendDirection) => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendLabel = (direction: TrendDirection) => {
    switch (direction) {
      case 'up':
        return 'Crescimento'
      case 'down':
        return 'Declínio'
      default:
        return 'Estável'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.7) return 'Alta'
    if (score >= 0.4) return 'Moderada'
    return 'Baixa'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Análise de Tendências</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getTrendIcon(data.trend_direction)}
              {getTrendLabel(data.trend_direction)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Confiança: {getConfidenceLabel(data.confidence_score)}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Análise de {data.trend_type.replace('_', ' ')} com previsões
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Valor"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Tendência</span>
              {getTrendIcon(data.trend_direction)}
            </div>
            <div className={`text-lg font-semibold ${getTrendColor(data.trend_direction)}`}>
              {getTrendLabel(data.trend_direction)}
            </div>
            <div className="text-xs text-muted-foreground">
              Direção geral dos dados
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Confiança</span>
              <Target className="h-3 w-3" />
            </div>
            <div className={`text-lg font-semibold ${getConfidenceColor(data.confidence_score)}`}>
              {(data.confidence_score * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {getConfidenceLabel(data.confidence_score)} confiança
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Períodos</span>
              <TrendingUp className="h-3 w-3" />
            </div>
            <div className="text-lg font-semibold">
              {data.data_points.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Pontos de dados analisados
            </div>
          </div>
        </div>

        {/* Forecast Preview */}
        {data.forecast && data.forecast.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Previsões</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {data.forecast.slice(0, 3).map((forecast, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">{forecast.period}</div>
                  <div className="font-medium">{formatCurrency(Number(forecast.net_amount))}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {data.insights.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-medium">Insights da Análise</h4>
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

