"use client";

import { useState, useEffect } from "react";
import { useMonthlyAIReport } from "@/hooks/use-monthly-ai-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Lightbulb,
  Download,
} from "lucide-react";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getLast12Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const label = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    months.push({ value, label });
  }
  return months;
};

export function MonthlyReport() {
  const { report, loading, error, fetchReport } = useMonthlyAIReport();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const months = getLast12Months();

  useEffect(() => {
    if (selectedMonth) {
      fetchReport(selectedMonth);
    }
  }, [selectedMonth, fetchReport]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[150px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return (
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Selecione um mês para gerar o relatório
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Relatório Mensal de IA
          </h2>
          <p className="text-muted-foreground">
            Análise completa e insights do mês
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumo Executivo</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Score:</span>
              <Badge
                variant={report.health_score >= 70 ? "default" : "secondary"}
              >
                {report.health_score}
              </Badge>
              {report.health_score_change !== 0 && (
                <Badge
                  variant={
                    report.health_score_change > 0 ? "default" : "destructive"
                  }
                >
                  {report.health_score_change > 0 ? "+" : ""}
                  {report.health_score_change}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{report.executive_summary}</p>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {report.income_total.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {report.expense_total.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Poupança</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              R$ {report.savings_total.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Poupança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {report.savings_rate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements and Improvements */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Conquistas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.achievements.length > 0 ? (
              <ul className="space-y-2">
                {report.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma conquista este mês
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Áreas para Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.areas_for_improvement.length > 0 ? (
              <ul className="space-y-2">
                {report.areas_for_improvement.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Tudo em ordem!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      {report.key_insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Principais Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.key_insights.map((insight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Goals Progress */}
      {report.goals_progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso de Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.goals_progress.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal.goal_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {goal.progress.toFixed(1)}%
                      </span>
                      <Badge
                        variant={goal.on_track ? "default" : "destructive"}
                      >
                        {goal.on_track ? "No prazo" : "Atrasado"}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={goal.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Month Prediction */}
      {report.next_month_prediction && (
        <Card>
          <CardHeader>
            <CardTitle>Previsão para Próximo Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Receita Prevista
                </p>
                <p className="text-xl font-bold">
                  R$ {report.next_month_prediction.predicted_income.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Despesa Prevista
                </p>
                <p className="text-xl font-bold">
                  R${" "}
                  {report.next_month_prediction.predicted_expenses.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Previsto</p>
                <p className="text-xl font-bold">
                  R$ {report.next_month_prediction.predicted_balance.toFixed(2)}
                </p>
              </div>
            </div>
            {report.next_month_prediction.risk_factors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Fatores de Risco:</p>
                <ul className="space-y-1">
                  {report.next_month_prediction.risk_factors.map(
                    (risk, index) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {risk}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Confiança da previsão:
              </span>
              <Progress
                value={report.next_month_prediction.confidence * 100}
                className="flex-1"
              />
              <span className="text-sm font-medium">
                {(report.next_month_prediction.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
