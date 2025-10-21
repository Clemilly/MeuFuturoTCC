"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MaterialIcon } from "@/lib/material-icons"
import { useFinancialOverview } from "@/hooks/use-financial-overview"
import { useFinancialGoals } from "@/hooks/use-financial-goals"
import { useFinancialAlerts } from "@/hooks/use-financial-alerts"
import { FinancialOverviewSkeleton } from "./financial-overview-skeleton"
import { formatCurrency } from "@/lib/utils"
import { FinancialGoal, FinancialAlert } from "@/lib/types"

export function FinancialOverview() {
  const { overview, loading, error, refreshOverview } = useFinancialOverview()

  if (loading) {
    return <FinancialOverviewSkeleton />
  }

  if (error) {
    return (
      <section aria-labelledby="financial-overview-title">
        <h2 id="financial-overview-title" className="text-2xl font-semibold mb-6">
          Resumo Financeiro
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MaterialIcon name="alert-triangle" size={48} className="text-destructive mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshOverview} variant="outline">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!overview) {
    return (
      <section aria-labelledby="financial-overview-title">
        <h2 id="financial-overview-title" className="text-2xl font-semibold mb-6">
          Resumo Financeiro
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 60) return "bg-blue-100 dark:bg-blue-900/20"
    if (score >= 40) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <MaterialIcon name="trending-up" size={16} className="text-green-600" aria-hidden="true" />
      case "down":
        return <MaterialIcon name="trending-down" size={16} className="text-red-600" aria-hidden="true" />
      default:
        return <MaterialIcon name="bar-chart-3" size={16} className="text-gray-600" aria-hidden="true" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "bill":
        return <MaterialIcon name="dollar-sign" size={16} aria-hidden="true" />
      case "goal":
        return <MaterialIcon name="target" size={16} aria-hidden="true" />
      case "budget":
        return <MaterialIcon name="bar-chart-3" size={16} aria-hidden="true" />
      default:
        return <MaterialIcon name="alert-circle" size={16} aria-hidden="true" />
    }
  }

  return (
    <section aria-labelledby="financial-overview-title">
      <h2 id="financial-overview-title" className="text-2xl font-semibold mb-6">
        Resumo Financeiro
      </h2>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <MaterialIcon name="dollar-sign" size={16} className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview.current_balance || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(overview.trends?.savings_trend || "stable")}
              <span className="ml-1">
                {overview.trends?.savings_trend === "up" ? "Crescendo" : 
                 overview.trends?.savings_trend === "down" ? "Diminuindo" : "Estável"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <MaterialIcon name="trending-up" size={16} className="text-green-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(overview.monthly_income || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(overview.trends?.income_trend || "stable")}
              <span className="ml-1">
                {overview.trends?.income_trend === "up" ? "Crescendo" : 
                 overview.trends?.income_trend === "down" ? "Diminuindo" : "Estável"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <MaterialIcon name="trending-down" size={16} className="text-red-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(overview.monthly_expenses || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(overview.trends?.expense_trend || "stable")}
              <span className="ml-1">
                {overview.trends?.expense_trend === "up" ? "Crescendo" : 
                 overview.trends?.expense_trend === "down" ? "Diminuindo" : "Estável"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poupança</CardTitle>
            <MaterialIcon name="piggy-bank" size={16} className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview.savings || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {(overview.savings || 0) > 0 ? "Saldo positivo" : "Saldo negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Score and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Financial Health Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MaterialIcon name="bar-chart-3" size={20} aria-hidden="true" />
              Saúde Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score</span>
                <span className={`text-2xl font-bold ${getHealthScoreColor(overview.health_score || 0)}`}>
                  {overview.health_score || 0}
                </span>
              </div>
              <Progress 
                value={overview.health_score || 0} 
                className="h-2"
              />
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreBgColor(overview.health_score || 0)}`}>
                {overview.health_label || "Indisponível"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MaterialIcon name="target" size={20} aria-hidden="true" />
              Metas Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(overview.financial_goals || []).length === 0 ? (
              <div className="text-center py-8">
                <MaterialIcon name="target" size={48} className="text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <p className="text-muted-foreground mb-4">Nenhuma meta definida</p>
                <Button size="sm" variant="outline">
                  <MaterialIcon name="plus-circle" size={16} className="mr-2" aria-hidden="true" />
                  Criar Meta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {overview.financial_goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal.name}</span>
                      <Badge variant={goal.is_completed ? "default" : "secondary"}>
                        {goal.is_completed ? "Concluída" : goal.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(goal.current_amount)}</span>
                        <span>{formatCurrency(goal.target_amount)}</span>
                      </div>
                      <Progress value={goal.progress_percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {goal.progress_percentage.toFixed(1)}% concluído
                        {goal.days_remaining && (
                          <span className="ml-2">
                            • {goal.days_remaining} dias restantes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {overview.financial_goals.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todas as metas ({overview.financial_goals.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MaterialIcon name="bar-chart-3" size={20} aria-hidden="true" />
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(overview.recent_transactions || []).length === 0 ? (
              <div className="text-center py-8">
                <MaterialIcon name="bar-chart-3" size={48} className="text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <p className="text-muted-foreground">Nenhuma transação recente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overview.recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category?.name || "Sem categoria"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  Ver todas as transações
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MaterialIcon name="alert-triangle" size={20} aria-hidden="true" />
              Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(overview.alerts || []).length === 0 ? (
              <div className="text-center py-8">
                <MaterialIcon name="check-circle" size={48} className="text-green-600 mx-auto mb-4" aria-hidden="true" />
                <p className="text-muted-foreground">Nenhum alerta ativo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overview.alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <Badge variant={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      {alert.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MaterialIcon name="clock" size={12} aria-hidden="true" />
                          <span>
                            {alert.days_until_due !== undefined && alert.days_until_due > 0
                              ? `${alert.days_until_due} dias restantes`
                              : alert.is_overdue
                              ? "Vencido"
                              : "Hoje"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {overview.alerts.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos os alertas ({overview.alerts.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {overview.insights && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MaterialIcon name="bar-chart-3" size={20} aria-hidden="true" />
              Insights de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthScoreColor(overview.insights?.health_score || 0)}`}>
                  {overview.insights?.health_score || 0}
                </div>
                <p className="text-sm text-muted-foreground">Score de Saúde</p>
              </div>
              <div className="text-center">
                <Badge variant={overview.insights?.risk_level === "low" ? "default" : 
                               overview.insights?.risk_level === "medium" ? "secondary" : "destructive"}>
                  {overview.insights?.risk_level === "low" ? "Baixo Risco" :
                   overview.insights?.risk_level === "medium" ? "Médio Risco" : "Alto Risco"}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Nível de Risco</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {getTrendIcon(overview.insights?.monthly_trend || "stable")}
                  <span className="text-sm font-medium">
                    {overview.insights?.monthly_trend === "up" ? "Crescendo" :
                     overview.insights?.monthly_trend === "down" ? "Diminuindo" : "Estável"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Tendência Mensal</p>
              </div>
            </div>
            {overview.insights?.recommendations && overview.insights.recommendations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Recomendações</h4>
                <ul className="space-y-2">
                  {overview.insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-20 flex flex-col gap-2">
            <MaterialIcon name="plus-circle" size={24} aria-hidden="true" />
            <span>Nova Transação</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <MaterialIcon name="target" size={24} aria-hidden="true" />
            <span>Nova Meta</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <MaterialIcon name="bar-chart-3" size={24} aria-hidden="true" />
            <span>Ver Relatórios</span>
          </Button>
        </div>
      </div>
    </section>
  )
}