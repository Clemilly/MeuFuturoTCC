/**
 * Gráfico de comparação mensal com cores corretas e escala adequada
 * Baseado em ferramentas do mercado (Mint, YNAB)
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
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MonthlyComparisonData } from "@/hooks/reports/use-reports-data";

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonData[];
  loading?: boolean;
}

export function MonthlyComparisonChart({
  data,
  loading,
}: MonthlyComparisonChartProps) {
  // Preparar dados para o gráfico
  const chartData = data.map((item) => {
    // Parse do período "YYYY-MM" de forma segura (evita problemas de timezone)
    const [year, month] = item.month.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);

    return {
      ...item,
      monthLabel: date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
    };
  });

  // Calcular valores máximos para escala adequada
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.income, item.expense]),
    100 // Mínimo de 100 para evitar escala zero
  );

  // Formatar valores para tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Tooltip customizado
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
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Receitas vs Despesas por Mês
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
            Receitas vs Despesas por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
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
          Receitas vs Despesas por Mês
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparação mensal entre receitas e despesas
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#666" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#666" }}
                tickFormatter={(value) => {
                  if (value === 0) return "R$ 0";
                  return `R$ ${(value / 1000).toFixed(0)}k`;
                }}
                domain={[0, maxValue * 1.1]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Barra de Receitas - Verde */}
              <Bar
                dataKey="income"
                name="Receitas"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />

              {/* Barra de Despesas - Vermelho */}
              <Bar
                dataKey="expense"
                name="Despesas"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda e Resumo */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Despesas</span>
            </div>
          </div>

          {/* Totais do período */}
          <div className="text-right text-sm">
            <div className="font-medium">
              Saldo Total:{" "}
              {formatCurrency(
                data.reduce((acc, item) => acc + item.balance, 0)
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {data.length} {data.length === 1 ? "período" : "períodos"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
