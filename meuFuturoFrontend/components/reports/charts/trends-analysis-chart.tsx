/**
 * Gráfico de análise de tendências baseado em ferramentas do mercado
 * Inspirado em Mint, YNAB, Personal Capital
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrendData } from "@/hooks/reports/use-reports-data";

interface TrendsAnalysisChartProps {
  data: TrendData[];
  loading?: boolean;
}

export function TrendsAnalysisChart({
  data,
  loading,
}: TrendsAnalysisChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">
                Receitas: {formatCurrency(data.income)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm">
                Despesas: {formatCurrency(data.expense)}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm font-medium">
                Saldo: {formatCurrency(data.balance)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-sm">
                Taxa de Poupança: {data.savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calcular insights automáticos
  const calculateInsights = () => {
    if (!data || data.length === 0) return null;

    const avgSavingsRate =
      data.reduce((acc, item) => acc + item.savingsRate, 0) / data.length;
    const firstPeriod = data[0];
    const lastPeriod = data[data.length - 1];

    const incomeTrend =
      lastPeriod.income > firstPeriod.income
        ? "growing"
        : lastPeriod.income < firstPeriod.income
        ? "declining"
        : "stable";
    const expenseTrend =
      lastPeriod.expense > firstPeriod.expense
        ? "growing"
        : lastPeriod.expense < firstPeriod.expense
        ? "declining"
        : "stable";

    return {
      avgSavingsRate,
      incomeTrend,
      expenseTrend,
      totalIncome: data.reduce((acc, item) => acc + item.income, 0),
      totalExpense: data.reduce((acc, item) => acc + item.expense, 0),
    };
  };

  const insights = calculateInsights();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para análise de tendências
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise de Tendências
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Evolução temporal das suas finanças com insights automáticos
            </p>
          </div>

          {/* Badges de Tendência */}
          {insights && (
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {insights.incomeTrend === "growing" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : insights.incomeTrend === "declining" ? (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                ) : (
                  <DollarSign className="h-3 w-3 text-gray-600" />
                )}
                Receitas
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {insights.avgSavingsRate.toFixed(0)}% Poupança
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#666" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#666" }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Area
                type="monotone"
                dataKey="income"
                name="Receitas"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Despesas"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights automáticos */}
        {insights && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">💡 Insights Automáticos</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <span>
                  Sua taxa de poupança média é de{" "}
                  <strong>{insights.avgSavingsRate.toFixed(1)}%</strong>
                  {insights.avgSavingsRate >= 20
                    ? " - Excelente!"
                    : insights.avgSavingsRate >= 10
                    ? " - Bom progresso!"
                    : " - Considere aumentar."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <span>
                  Tendência de receitas:{" "}
                  {insights.incomeTrend === "growing"
                    ? "📈 Crescendo"
                    : insights.incomeTrend === "declining"
                    ? "📉 Diminuindo"
                    : "➡️ Estável"}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <span>
                  Tendência de despesas:{" "}
                  {insights.expenseTrend === "growing"
                    ? "📈 Crescendo"
                    : insights.expenseTrend === "declining"
                    ? "📉 Diminuindo"
                    : "➡️ Estável"}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <span>
                  Total economizado:{" "}
                  <strong>
                    {formatCurrency(
                      insights.totalIncome - insights.totalExpense
                    )}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
