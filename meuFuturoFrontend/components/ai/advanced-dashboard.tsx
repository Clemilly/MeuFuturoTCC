"use client";

import { useAdvancedAIDashboard } from "@/hooks/use-advanced-ai-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialIcon } from "@/lib/material-icons";
import {
  Target,
  Brain,
  Sparkles,
  Activity,
  RefreshCw,
  DollarSign,
  PieChart,
  BarChart3,
  LineChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function AdvancedAIDashboard() {
  const { dashboard, loading, error, refresh } = useAdvancedAIDashboard();

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Error State
  if (error || !dashboard) {
    return (
      <Alert variant="destructive">
        <MaterialIcon name="alert-triangle" size={16} aria-hidden="true" />
        <AlertTitle>Erro ao carregar dashboard</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error || "Não foi possível carregar os dados"}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <MaterialIcon name="refresh-cw" size={16} className="mr-2" aria-hidden="true" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Helper functions
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Boa";
    if (score >= 40) return "Regular";
    if (score >= 20) return "Fraca";
    return "Crítica";
  };

  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      "Muito Baixo": "bg-green-500",
      Baixo: "bg-blue-500",
      Médio: "bg-yellow-500",
      Alto: "bg-orange-500",
      "Muito Alto": "bg-red-500",
    };
    return colors[level] || "bg-gray-500";
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes("Positiva") || trend.includes("melhor"))
      return <MaterialIcon name="trending-up" size={20} className="text-green-500" aria-hidden="true" />;
    if (trend.includes("Negativa") || trend.includes("pior"))
      return <MaterialIcon name="trending-down" size={20} className="text-red-500" aria-hidden="true" />;
    return <MaterialIcon name="activity" size={20} className="text-blue-500" aria-hidden="true" />;
  };

  // Prepare chart data
  const spendingPatternsData = dashboard.spending_patterns.map((pattern) => ({
    category: pattern.category || "Sem categoria",
    amount: pattern.average_monthly || pattern.percentage || 0,
    percentage: pattern.percentage || 0,
  }));

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Dashboard de IA Financeira
          </h2>
          <p className="text-muted-foreground">
            Análise completa da sua saúde financeira
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <MaterialIcon name="refresh-cw" size={16} className="mr-2" aria-hidden="true" />
          Atualizar
        </Button>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Health Score Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saúde Financeira
            </CardTitle>
            <MaterialIcon name="brain" size={16} className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${getHealthScoreColor(
                dashboard.health_score
              )}`}
            >
              {dashboard.health_score}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {getHealthScoreLabel(dashboard.health_score)}
              </p>
              <Progress value={dashboard.health_score} className="w-[60%]" />
            </div>
          </CardContent>
        </Card>

        {/* Risk Level Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nível de Risco
            </CardTitle>
            <MaterialIcon name="alert-triangle" size={16} className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <Badge
              className={`${getRiskLevelColor(
                dashboard.risk_level
              )} text-white`}
            >
              {dashboard.risk_level}
            </Badge>
            <p className="text-xs text-muted-foreground mt-3">
              Baseado em análise de IA
            </p>
          </CardContent>
        </Card>

        {/* Monthly Trend Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tendência Mensal
            </CardTitle>
            <MaterialIcon name="activity" size={16} className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getTrendIcon(dashboard.monthly_trend)}
              <span className="text-2xl font-bold">
                {dashboard.monthly_trend}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Análise do último mês
            </p>
          </CardContent>
        </Card>

        {/* Savings Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Poupança
            </CardTitle>
            <MaterialIcon name="target" size={16} className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof dashboard.advanced_metrics.savings_rate === "number"
                ? dashboard.advanced_metrics.savings_rate.toFixed(1)
                : "0.0"}
              %
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Ideal: {dashboard.advanced_metrics.ideal_savings_rate}%
              </p>
              <Progress
                value={
                  (dashboard.advanced_metrics.savings_rate /
                    dashboard.advanced_metrics.ideal_savings_rate) *
                  100
                }
                className="w-[50%]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Liquidity Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Liquidez</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.advanced_metrics.liquidity_score}
                </div>
                <Progress
                  value={dashboard.advanced_metrics.liquidity_score}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Diversification Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Diversificação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.advanced_metrics.diversification_score}
                </div>
                <Progress
                  value={dashboard.advanced_metrics.diversification_score}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Stability Index */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof dashboard.advanced_metrics.stability_index ===
                  "number"
                    ? (
                        dashboard.advanced_metrics.stability_index * 100
                      ).toFixed(0)
                    : "0"}
                  %
                </div>
                <Progress
                  value={dashboard.advanced_metrics.stability_index * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Spending Patterns Chart */}
          {spendingPatternsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Padrões de Gastos</CardTitle>
                <CardDescription>
                  Distribuição de gastos por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spendingPatternsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="percentage" fill="#3b82f6" name="% do Total">
                      {spendingPatternsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          {/* Seasonal Patterns */}
          {dashboard.seasonal_patterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Padrões Sazonais</CardTitle>
                <CardDescription>
                  Categorias com variações sazonais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.seasonal_patterns.map((pattern, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{pattern.category}</h4>
                        <Badge variant="outline">{pattern.pattern_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pattern.recommendation}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Picos: {pattern.peak_months.join(", ")}</span>
                        <span>•</span>
                        <span>
                          Variação:{" "}
                          {typeof pattern.average_variation === "number"
                            ? pattern.average_variation.toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Anomalies */}
          {dashboard.anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Anomalias Detectadas</CardTitle>
                <CardDescription>
                  Gastos fora do padrão habitual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard.anomalies.map((anomaly, index) => (
                    <Alert
                      key={index}
                      variant={
                        anomaly.anomaly_score > 0.7 ? "destructive" : "default"
                      }
                    >
                      <MaterialIcon name="alert-triangle" size={16} aria-hidden="true" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>{anomaly.category}</span>
                        <Badge
                          variant={
                            anomaly.anomaly_score > 0.7
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          Score:{" "}
                          {typeof anomaly.anomaly_score === "number"
                            ? (anomaly.anomaly_score * 100).toFixed(0)
                            : "0"}
                          %
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">
                          R${" "}
                          {typeof anomaly.amount === "number"
                            ? anomaly.amount.toFixed(2)
                            : "0.00"}
                        </p>
                        <p className="text-xs">{anomaly.suggestion}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Behavioral Insights */}
          {dashboard.pattern_analysis.behavioral_insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Insights Comportamentais</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dashboard.pattern_analysis.behavioral_insights.map(
                    (insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <MaterialIcon name="sparkles" size={16} className="mt-0.5 text-yellow-500 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {dashboard.recommendations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dashboard.recommendations.slice(0, 6).map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                      <Badge
                        variant={
                          rec.priority === "urgent" || rec.priority === "high"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-green-600">
                        +R${" "}
                        {(typeof rec.potential_impact === "number"
                          ? rec.potential_impact
                          : 0
                        ).toFixed(2)}
                        /mês
                      </span>
                      <span className="text-muted-foreground">
                        Confiança:{" "}
                        {typeof rec.ai_confidence === "number"
                          ? (rec.ai_confidence * 100).toFixed(0)
                          : "0"}
                        %
                      </span>
                    </div>
                    <Progress
                      value={rec.ai_confidence * 100}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <MaterialIcon name="sparkles" size={16} aria-hidden="true" />
              <AlertTitle>Nenhuma recomendação disponível</AlertTitle>
              <AlertDescription>
                Continue registrando suas transações para receber recomendações
                personalizadas.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-4">
          {/* Savings Projections */}
          <Card>
            <CardHeader>
              <CardTitle>Projeções de Poupança</CardTitle>
              <CardDescription>
                Cenários de economia baseados em seu histórico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(dashboard.savings_projection).map(
                  ([scenario, values]) => (
                    <div key={scenario} className="space-y-2">
                      <h4 className="font-semibold capitalize">{scenario}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            6 meses:
                          </span>
                          <span className="font-medium">
                            R${" "}
                            {typeof values.six_months === "number"
                              ? values.six_months.toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">1 ano:</span>
                          <span className="font-medium">
                            R${" "}
                            {typeof values.one_year === "number"
                              ? values.one_year.toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Goal Projections */}
          {dashboard.goal_projections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Projeção de Metas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.goal_projections.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal.goal_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.probability_of_success}% probabilidade
                        </span>
                      </div>
                      <Progress value={goal.probability_of_success} />
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
