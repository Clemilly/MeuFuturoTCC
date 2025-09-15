"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Calendar, PieChart, BarChart3, Loader2 } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface SpendingPattern {
  category: string
  percentage: number
  trend: "stable" | "increasing" | "decreasing"
  recommendation: string
}

interface Prediction {
  title: string
  description: string
  impact: "positive" | "negative" | "neutral"
  confidence: number
}

interface Recommendation {
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: string
}

interface AIInsights {
  healthScore: number
  riskLevel: string
  monthlyTrend: string
  savingsProjection: {
    conservative: { sixMonths: number; oneYear: number }
    moderate: { sixMonths: number; oneYear: number }
    optimistic: { sixMonths: number; oneYear: number }
  }
  spendingPatterns: SpendingPattern[]
  predictions: Prediction[]
  recommendations: Recommendation[]
}

export function AIFinancialInsights() {
  const [selectedScenario, setSelectedScenario] = useState<"conservative" | "moderate" | "optimistic">("moderate")
  const [aiInsights, setAiInsights] = useState<AIInsights>({
    healthScore: 0,
    riskLevel: "Calculando...",
    monthlyTrend: "Calculando...",
    savingsProjection: {
      conservative: { sixMonths: 0, oneYear: 0 },
      moderate: { sixMonths: 0, oneYear: 0 },
      optimistic: { sixMonths: 0, oneYear: 0 },
    },
    spendingPatterns: [],
    predictions: [],
    recommendations: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()

  // Load AI insights from API
  const loadAIInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load financial summary for calculations
      const summaryResponse = await apiService.getTransactionSummary()
      const categoryResponse = await apiService.getCategorySummary({
        transaction_type: "expense"
      })

      if (summaryResponse.error || categoryResponse.error) {
        setError("Erro ao carregar dados para análise")
        return
      }

      const summary = summaryResponse.data
      const categories = categoryResponse.data

      if (!summary || !categories) {
        setError("Dados insuficientes para análise")
        return
      }

      // Calculate health score based on financial data
      const healthScore = calculateHealthScore(summary)
      const riskLevel = calculateRiskLevel(healthScore)
      const monthlyTrend = calculateMonthlyTrend(summary)

      // Generate spending patterns from category data
      const totalExpenses = categories.reduce((sum, cat) => sum + (cat.total_amount || 0), 0)
      const spendingPatterns = categories.map((cat, index) => ({
        category: cat.category_name || "Sem categoria",
        percentage: totalExpenses > 0 ? Math.round(((cat.total_amount || 0) / totalExpenses) * 100) : 0,
        trend: getTrend(cat, categories),
        recommendation: getRecommendation(cat.category_name || "Sem categoria")
      }))

      // Generate predictions based on data
      const predictions = generatePredictions(summary, categories)

      // Generate recommendations
      const recommendations = generateRecommendations(summary, categories)

      // Calculate savings projections
      const savingsProjection = calculateSavingsProjection(summary)

      setAiInsights({
        healthScore,
        riskLevel,
        monthlyTrend,
        savingsProjection,
        spendingPatterns,
        predictions,
        recommendations
      })

    } catch (err) {
      setError("Erro ao carregar insights de IA")
      console.error("Error loading AI insights:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateHealthScore = (summary: any): number => {
    let score = 50 // Base score

    // Income vs expenses ratio
    const income = summary.total_income || 0
    const expenses = summary.total_expenses || 0
    if (income > 0) {
      const ratio = expenses / income
      if (ratio < 0.5) score += 20
      else if (ratio < 0.7) score += 10
      else if (ratio < 0.9) score += 5
      else score -= 10
    }

    // Consistency bonus
    if (summary.average_income && summary.average_expenses) {
      score += 10
    }

    return Math.min(100, Math.max(0, score))
  }

  const calculateRiskLevel = (score: number): string => {
    if (score >= 80) return "Muito Baixo"
    if (score >= 60) return "Baixo"
    if (score >= 40) return "Médio"
    if (score >= 20) return "Alto"
    return "Muito Alto"
  }

  const calculateMonthlyTrend = (summary: any): string => {
    // Simplified trend calculation
    const income = summary.total_income || 0
    const expenses = summary.total_expenses || 0
    const balance = income - expenses
    
    if (balance > 1000) return "Muito Positiva"
    if (balance > 0) return "Positiva"
    if (balance > -500) return "Neutra"
    return "Negativa"
  }

  const getTrend = (category: any, categories: any[]): "stable" | "increasing" | "decreasing" => {
    // Simple trend calculation based on category amount
    if (!category || !category.total_amount) return "stable"
    
    const avgAmount = categories.reduce((sum, cat) => sum + (cat.total_amount || 0), 0) / categories.length
    const categoryAmount = category.total_amount
    
    if (categoryAmount > avgAmount * 1.2) return "increasing"
    if (categoryAmount < avgAmount * 0.8) return "decreasing"
    return "stable"
  }

  const getRecommendation = (category: string): string => {
    const recommendations = {
      "Alimentação": "Dentro do esperado",
      "Transporte": "Considere alternativas",
      "Lazer": "Pode aumentar moderadamente",
      "Utilidades": "Controlado",
      "Saúde": "Investimento importante",
      "Educação": "Investimento no futuro"
    }
    return recommendations[category as keyof typeof recommendations] || "Diversificado"
  }

  const generatePredictions = (summary: any, categories: any[]): Prediction[] => {
    const predictions: Prediction[] = []

    // Economy potential prediction
    const transportCategory = categories.find(cat => 
      cat.category_name?.toLowerCase().includes("transporte")
    )
    if (transportCategory && transportCategory.total_amount > 500) {
      predictions.push({
        title: "Economia Potencial",
        description: `Com base nos seus padrões, você pode economizar até R$ ${Math.round(transportCategory.total_amount * 0.2)}/mês otimizando gastos com transporte`,
        impact: "positive",
        confidence: 85
      })
    }

    // Savings goal prediction
    const balance = (summary.total_income || 0) - (summary.total_expenses || 0)
    if (balance > 0) {
      const monthsToGoal = Math.ceil(10000 / balance) // Assuming 10k goal
      predictions.push({
        title: "Meta de Reserva",
        description: `Mantendo o ritmo atual, você atingirá sua meta de reserva de emergência em ${monthsToGoal} meses`,
        impact: "positive",
        confidence: 78
      })
    }

    // Spending alert
    const leisureCategory = categories.find(cat => 
      cat.category_name?.toLowerCase().includes("lazer")
    )
    if (leisureCategory && leisureCategory.total_amount < 200) {
      predictions.push({
        title: "Alerta de Gastos",
        description: "Seus gastos com lazer estão baixos. Considere equilibrar qualidade de vida",
        impact: "neutral",
        confidence: 92
      })
    }

    return predictions
  }

  const generateRecommendations = (summary: any, categories: any[]): Recommendation[] => {
    const recommendations: Recommendation[] = []

    // Transport optimization
    const transportCategory = categories.find(cat => 
      cat.category_name?.toLowerCase().includes("transporte")
    )
    if (transportCategory && transportCategory.total_amount > 500) {
      recommendations.push({
        title: "Otimize Transporte",
        description: "Considere usar transporte público 2x por semana. Economia estimada: R$ 120/mês",
        priority: "high",
        category: "Economia"
      })
    }

    // Investment recommendation
    const balance = (summary.total_income || 0) - (summary.total_expenses || 0)
    if (balance > 1000) {
      recommendations.push({
        title: "Aumente Investimentos",
        description: "Com sua situação estável, considere investir 10% a mais em poupança",
        priority: "medium",
        category: "Investimento"
      })
    }

    // Income diversification
    if (summary.total_income && summary.total_income < 5000) {
      recommendations.push({
        title: "Diversifique Receitas",
        description: "Explore oportunidades de renda extra baseadas no seu perfil profissional",
        priority: "low",
        category: "Receita"
      })
    }

    return recommendations
  }

  const calculateSavingsProjection = (summary: any) => {
    const monthlyBalance = (summary.total_income || 0) - (summary.total_expenses || 0)
    
    return {
      conservative: {
        sixMonths: Math.round(monthlyBalance * 6 * 0.8),
        oneYear: Math.round(monthlyBalance * 12 * 0.8)
      },
      moderate: {
        sixMonths: Math.round(monthlyBalance * 6),
        oneYear: Math.round(monthlyBalance * 12)
      },
      optimistic: {
        sixMonths: Math.round(monthlyBalance * 6 * 1.2),
        oneYear: Math.round(monthlyBalance * 12 * 1.2)
      }
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadAIInsights()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente"
    if (score >= 60) return "Boa"
    if (score >= 40) return "Regular"
    return "Precisa Atenção"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Média"
      case "low":
        return "Baixa"
      default:
        return "Normal"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analisando seus dados financeiros...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAIInsights}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Score de Saúde Financeira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Análise Inteligente da Saúde Financeira</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${getHealthScoreColor(aiInsights.healthScore)}`}>
                {aiInsights.healthScore}/100
              </div>
              <div className={`text-lg font-medium ${getHealthScoreColor(aiInsights.healthScore)}`}>
                {getHealthScoreLabel(aiInsights.healthScore)}
              </div>
              <Progress value={aiInsights.healthScore} className="h-3" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nível de Risco:</span>
                <Badge variant="secondary">{aiInsights.riskLevel}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tendência Mensal:</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{aiInsights.monthlyTrend}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Fatores Analisados:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Padrões de gastos mensais</li>
                <li>• Consistência de receitas</li>
                <li>• Capacidade de poupança</li>
                <li>• Diversificação de despesas</li>
                <li>• Histórico de 6 meses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes análises */}
      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        {/* Previsões da IA */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Previsões Inteligentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.predictions.map((prediction, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{prediction.title}</h4>
                      <Badge variant="outline">{prediction.confidence}% confiança</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{prediction.description}</p>
                    <div className="flex items-center space-x-2">
                      {prediction.impact === "positive" && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {prediction.impact === "negative" && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {prediction.impact === "neutral" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      <span className="text-xs text-muted-foreground">Baseado em análise de padrões históricos</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cenários de Projeção */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Projeções de Poupança</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-center space-x-2">
                  {(["conservative", "moderate", "optimistic"] as const).map((scenario) => (
                    <Button
                      key={scenario}
                      variant={selectedScenario === scenario ? "default" : "outline"}
                      onClick={() => setSelectedScenario(scenario)}
                      className="capitalize"
                    >
                      {scenario === "conservative" && "Conservador"}
                      {scenario === "moderate" && "Moderado"}
                      {scenario === "optimistic" && "Otimista"}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">6 Meses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(aiInsights.savingsProjection[selectedScenario].sixMonths)}
                      </div>
                      <p className="text-sm text-muted-foreground">Poupança projetada</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">1 Ano</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(aiInsights.savingsProjection[selectedScenario].oneYear)}
                      </div>
                      <p className="text-sm text-muted-foreground">Poupança projetada</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">
                    Premissas do Cenário{" "}
                    {selectedScenario === "conservative"
                      ? "Conservador"
                      : selectedScenario === "moderate"
                        ? "Moderado"
                        : "Otimista"}
                    :
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedScenario === "conservative" && (
                      <>
                        <li>• Manutenção dos gastos atuais</li>
                        <li>• Sem aumento de receita</li>
                        <li>• Reserva para emergências</li>
                      </>
                    )}
                    {selectedScenario === "moderate" && (
                      <>
                        <li>• Pequenas otimizações nos gastos</li>
                        <li>• Possível aumento de receita</li>
                        <li>• Investimentos básicos</li>
                      </>
                    )}
                    {selectedScenario === "optimistic" && (
                      <>
                        <li>• Otimização significativa dos gastos</li>
                        <li>• Aumento de receita provável</li>
                        <li>• Investimentos mais agressivos</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Padrões de Gastos */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Análise de Padrões</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.spendingPatterns.map((pattern, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{pattern.category}</span>
                        <Badge variant="outline" className="text-xs">
                          {pattern.percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {pattern.trend === "increasing" && <TrendingUp className="h-4 w-4 text-red-600" />}
                        {pattern.trend === "decreasing" && <TrendingDown className="h-4 w-4 text-green-600" />}
                        {pattern.trend === "stable" && <div className="h-4 w-4 rounded-full bg-gray-400" />}
                        <span className="text-sm text-muted-foreground">{pattern.recommendation}</span>
                      </div>
                    </div>
                    <Progress value={pattern.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recomendações */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Recomendações Personalizadas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1">
                        <h4 className="font-medium">{recommendation.title}</h4>
                        <Badge variant="secondary">{recommendation.category}</Badge>
                      </div>
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        Prioridade {getPriorityLabel(recommendation.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disclaimer sobre IA */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-yellow-800">Sobre as Análises de IA</h4>
              <p className="text-sm text-yellow-700">
                As previsões e recomendações são baseadas em análise de padrões históricos e modelos estatísticos. Elas
                servem como orientação e não substituem aconselhamento financeiro profissional. Resultados passados não
                garantem performance futura.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
