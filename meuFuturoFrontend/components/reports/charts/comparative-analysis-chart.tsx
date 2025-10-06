/**
 * Gráfico de análise comparativa baseado em ferramentas do mercado
 * Compara períodos com métricas de performance
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ComparativeData } from "@/hooks/reports/use-reports-data";

interface ComparativeAnalysisChartProps {
  data: ComparativeData[];
  loading?: boolean;
}

export function ComparativeAnalysisChart({
  data,
  loading,
}: ComparativeAnalysisChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeColor = (percentage: number) => {
    if (percentage > 0) return "text-green-600";
    if (percentage < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (percentage: number) => {
    if (percentage > 0)
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (percentage < 0)
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">
                Período Anterior: {formatCurrency(payload[0].value)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">
                Período Atual: {formatCurrency(payload[1].value)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Preparar dados para o gráfico
  const chartData = data.map((item) => ({
    metric: item.metric,
    "Período Anterior": item.previous,
    "Período Atual": item.current,
    percentage: item.percentage,
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise Comparativa
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
            Análise Comparativa
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ative "Comparação de Períodos" nos filtros para visualizar este
            gráfico
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Nenhum dado comparativo disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise Comparativa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparação entre período atual e anterior
        </p>
      </CardHeader>
      <CardContent>
        {/* Gráfico */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="metric"
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
              <Bar
                dataKey="Período Anterior"
                fill="#60a5fa"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Período Atual"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {item.metric}
                </span>
                <div className="flex items-center gap-1">
                  {getChangeIcon(item.percentage)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {formatCurrency(item.current)}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Anterior: {formatCurrency(item.previous)}
                  </span>
                  <Badge
                    variant={
                      item.percentage > 0
                        ? "default"
                        : item.percentage < 0
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {formatPercentage(item.percentage)}
                  </Badge>
                </div>
              </div>

              {/* Diferença absoluta */}
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                Diferença:{" "}
                {formatCurrency(Math.abs(item.current - item.previous))}
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">📊 Resumo da Análise</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {data.map((item, index) => {
              const isPositive = item.percentage > 0;
              const isIncome = item.metric === "Receitas";
              const isGood =
                (isIncome && isPositive) || (!isIncome && !isPositive);

              return (
                <p key={index}>
                  • {item.metric}: {isPositive ? "aumento" : "redução"} de{" "}
                  {Math.abs(item.percentage).toFixed(1)}%
                  {isGood && item.metric !== "Saldo" && " ✅"}
                </p>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




