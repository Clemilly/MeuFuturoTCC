"use client";

import { usePatternAnalysis } from "@/hooks/use-pattern-analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  AlertTriangle,
  Calendar,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Activity,
} from "lucide-react";

export function PatternAnalysis() {
  const { patterns, seasonal, anomalies, loading, error, refresh } =
    usePatternAnalysis();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar análise</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Prepare weekday data
  const weekdayData = patterns?.spending_by_weekday
    ? Object.entries(patterns.spending_by_weekday).map(([day, amount]) => ({
        day,
        amount: Number(amount),
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Análise de Padrões
          </h2>
          <p className="text-muted-foreground">
            Insights sobre seus hábitos e comportamento financeiro
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="temporal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="temporal">Padrões Temporais</TabsTrigger>
          <TabsTrigger value="seasonal">Sazonalidade</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Temporal Patterns */}
        <TabsContent value="temporal" className="space-y-4">
          {/* Impulse Spending Score */}
          <Card>
            <CardHeader>
              <CardTitle>Score de Compras Impulsivas</CardTitle>
              <CardDescription>
                Tendência a fazer compras não planejadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">
                    {patterns?.impulse_spending_score.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {patterns && patterns.impulse_spending_score < 30
                      ? "Baixa tendência"
                      : patterns && patterns.impulse_spending_score < 60
                      ? "Tendência moderada"
                      : "Alta tendência"}
                  </p>
                </div>
                <Activity
                  className={`h-16 w-16 ${
                    patterns && patterns.impulse_spending_score < 30
                      ? "text-green-500"
                      : patterns && patterns.impulse_spending_score < 60
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Spending by Weekday */}
          {weekdayData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Dia da Semana</CardTitle>
                <CardDescription>Média de gastos em cada dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weekdayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" name="Gasto Médio" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Temporal Patterns Info */}
          {patterns?.temporal_patterns && (
            <Card>
              <CardHeader>
                <CardTitle>Padrões Identificados</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Dia de maior gasto:
                    </dt>
                    <dd className="font-semibold">
                      {patterns.temporal_patterns.peak_spending_day}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Dia de menor gasto:
                    </dt>
                    <dd className="font-semibold">
                      {patterns.temporal_patterns.lowest_spending_day}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Seasonal Patterns */}
        <TabsContent value="seasonal" className="space-y-4">
          {seasonal.length > 0 ? (
            seasonal.map((pattern, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{pattern.category}</CardTitle>
                    <Badge variant="outline">
                      <Calendar className="mr-1 h-3 w-3" />
                      {pattern.pattern_type}
                    </Badge>
                  </div>
                  <CardDescription>{pattern.recommendation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Meses de pico:
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {pattern.peak_months.map((month, i) => (
                          <Badge key={i} variant="secondary">
                            {month}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Variação média:
                      </span>
                      <span className="font-semibold">
                        {pattern.average_variation.toFixed(1)}%
                      </span>
                    </div>
                    {pattern.next_peak_date && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          Próximo pico esperado: {pattern.next_peak_date}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Nenhum padrão sazonal detectado</AlertTitle>
              <AlertDescription>
                Continue registrando transações por mais tempo para que possamos
                identificar padrões sazonais.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Anomalies */}
        <TabsContent value="anomalies" className="space-y-4">
          {anomalies.length > 0 ? (
            anomalies.map((anomaly, index) => (
              <Alert
                key={index}
                variant={
                  anomaly.anomaly_score > 0.7 ? "destructive" : "default"
                }
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{anomaly.category}</span>
                  <Badge
                    variant={
                      anomaly.anomaly_score > 0.7 ? "destructive" : "secondary"
                    }
                  >
                    Score: {(anomaly.anomaly_score * 100).toFixed(0)}%
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Valor: R$ {anomaly.amount.toFixed(2)}</span>
                      <span className="text-xs">
                        Esperado: R$ {anomaly.expected_range.min.toFixed(2)} -
                        R$ {anomaly.expected_range.max.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm">{anomaly.suggestion}</p>
                    {anomaly.detected_at && (
                      <p className="text-xs text-muted-foreground">
                        Detectado em: {anomaly.detected_at}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Nenhuma anomalia detectada</AlertTitle>
              <AlertDescription>
                Seus gastos estão dentro do padrão esperado!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Behavioral Insights */}
        <TabsContent value="insights" className="space-y-4">
          {patterns?.behavioral_insights &&
          patterns.behavioral_insights.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Insights Comportamentais</CardTitle>
                <CardDescription>Padrões identificados pela IA</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {patterns.behavioral_insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {/* Category Correlations */}
          {patterns?.category_correlations &&
            patterns.category_correlations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Correlações entre Categorias</CardTitle>
                  <CardDescription>
                    Categorias que tendem a ter gastos simultâneos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patterns.category_correlations.map((corr, index) => (
                      <div
                        key={index}
                        className="border-b pb-3 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex gap-2">
                            {corr.categories.map((cat, i) => (
                              <Badge key={i} variant="outline">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                          <Badge>{(corr.correlation * 100).toFixed(0)}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {corr.insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}








