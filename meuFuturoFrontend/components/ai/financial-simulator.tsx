"use client";

import { useState } from "react";
import { useFinancialSimulator } from "@/hooks/use-financial-simulator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  PlayCircle,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function FinancialSimulator() {
  const { result, loading, runSimulation, clearResult } =
    useFinancialSimulator();

  // State para controles
  const [scenarioName, setScenarioName] = useState("");
  const [incomeAdjustment, setIncomeAdjustment] = useState([0]);
  const [expenseAdjustment, setExpenseAdjustment] = useState([0]);
  const [savingsIncrease, setSavingsIncrease] = useState([0]);
  const [timeHorizon, setTimeHorizon] = useState([12]);

  const handleSimulation = async () => {
    const name = scenarioName || "Simulação Personalizada";

    await runSimulation({
      scenario_name: name,
      income_adjustment: incomeAdjustment[0],
      expense_adjustment: expenseAdjustment[0],
      savings_increase: savingsIncrease[0],
      time_horizon_months: timeHorizon[0],
    });
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case "save_10":
        setScenarioName("E se eu economizasse 10% mais?");
        setIncomeAdjustment([0]);
        setExpenseAdjustment([-10]);
        setSavingsIncrease([10]);
        setTimeHorizon([12]);
        break;
      case "raise_20":
        setScenarioName("E se eu conseguisse um aumento de 20%?");
        setIncomeAdjustment([20]);
        setExpenseAdjustment([0]);
        setSavingsIncrease([0]);
        setTimeHorizon([12]);
        break;
      case "reduce_15":
        setScenarioName("E se eu reduzisse gastos em 15%?");
        setIncomeAdjustment([0]);
        setExpenseAdjustment([-15]);
        setSavingsIncrease([0]);
        setTimeHorizon([12]);
        break;
    }
  };

  const resetSimulation = () => {
    setScenarioName("");
    setIncomeAdjustment([0]);
    setExpenseAdjustment([0]);
    setSavingsIncrease([0]);
    setTimeHorizon([12]);
    clearResult();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Simulador Financeiro
          </h2>
          <p className="text-muted-foreground">
            Teste diferentes cenários "e se..." para seu futuro financeiro
          </p>
        </div>
        {result && (
          <Button variant="outline" size="sm" onClick={resetSimulation}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Nova Simulação
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros da Simulação</CardTitle>
            <CardDescription>
              Ajuste os controles para ver como diferentes cenários afetam suas
              finanças
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scenario Name */}
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Nome do Cenário</Label>
              <Input
                id="scenario-name"
                placeholder="Ex: Cenário de Economia Agressiva"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </div>

            {/* Income Adjustment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ajuste de Renda</Label>
                <Badge variant="outline">
                  {incomeAdjustment[0] > 0 ? "+" : ""}
                  {incomeAdjustment[0]}%
                </Badge>
              </div>
              <Slider
                value={incomeAdjustment}
                onValueChange={setIncomeAdjustment}
                min={-50}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-50%</span>
                <span>+100%</span>
              </div>
            </div>

            {/* Expense Adjustment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ajuste de Despesas</Label>
                <Badge variant="outline">
                  {expenseAdjustment[0] > 0 ? "+" : ""}
                  {expenseAdjustment[0]}%
                </Badge>
              </div>
              <Slider
                value={expenseAdjustment}
                onValueChange={setExpenseAdjustment}
                min={-50}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-50%</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Savings Increase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Aumento de Poupança</Label>
                <Badge variant="outline">+{savingsIncrease[0]}%</Badge>
              </div>
              <Slider
                value={savingsIncrease}
                onValueChange={setSavingsIncrease}
                min={0}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Time Horizon */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Horizonte Temporal</Label>
                <Badge variant="outline">{timeHorizon[0]} meses</Badge>
              </div>
              <Slider
                value={timeHorizon}
                onValueChange={setTimeHorizon}
                min={3}
                max={120}
                step={3}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 meses</span>
                <span>10 anos</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <Label>Cenários Rápidos</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset("save_10")}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Economizar 10% mais
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset("raise_20")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Aumento de 20%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset("reduce_15")}
                >
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Reduzir gastos 15%
                </Button>
              </div>
            </div>

            {/* Run Button */}
            <Button
              onClick={handleSimulation}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                "Calculando..."
              ) : (
                <>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Executar Simulação
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {result.scenario_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Saldo Final
                      </p>
                      <p className="text-2xl font-bold">
                        R$ {result.final_balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Poupado
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {result.total_savings.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Média Mensal
                      </p>
                      <p className="text-lg font-semibold">
                        R$ {result.monthly_average_balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Melhoria</p>
                      <div className="flex items-center gap-1">
                        {result.comparison_to_current.better_outcome ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <p
                          className={`text-lg font-semibold ${
                            result.comparison_to_current.better_outcome
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.comparison_to_current.percentage_improvement.toFixed(
                            1
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Alert */}
                  <Alert>
                    <ArrowRight className="h-4 w-4" />
                    <AlertTitle>Comparação com Cenário Atual</AlertTitle>
                    <AlertDescription>
                      {result.comparison_to_current.better_outcome ? (
                        <span className="text-green-600">
                          Você teria R${" "}
                          {result.comparison_to_current.balance_difference.toFixed(
                            2
                          )}{" "}
                          a mais no final do período!
                        </span>
                      ) : (
                        <span className="text-red-600">
                          Você teria R${" "}
                          {Math.abs(
                            result.comparison_to_current.balance_difference
                          ).toFixed(2)}{" "}
                          a menos no final do período.
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Achievable Goals */}
                  {result.goals_achievable.length > 0 && (
                    <div className="space-y-2">
                      <Label>Metas Alcançáveis</Label>
                      <div className="flex flex-wrap gap-2">
                        {result.goals_achievable.map((goal, index) => (
                          <Badge key={index} variant="secondary">
                            <Target className="mr-1 h-3 w-3" />
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução ao Longo do Tempo</CardTitle>
                  <CardDescription>
                    Projeção mês a mês do seu saldo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={result.timeline_data}>
                      <defs>
                        <linearGradient
                          id="colorBalance"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        label={{
                          value: "Mês",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Saldo (R$)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        name="Saldo Acumulado"
                      />
                      <Line
                        type="monotone"
                        dataKey="savings"
                        stroke="#10b981"
                        name="Poupança Mensal"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Pronto para Simular?
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Ajuste os parâmetros ao lado e clique em "Executar Simulação"
                  para ver como diferentes cenários podem afetar seu futuro
                  financeiro.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}







