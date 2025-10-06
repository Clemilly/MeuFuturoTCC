/**
 * Página principal de relatórios usando sistema modular
 * Seguindo padrão da tela de transações
 */

"use client";

import { useEffect } from "react";
import { useReportsFilters } from "@/hooks/reports/use-reports-filters";
import { useReportsData } from "@/hooks/reports/use-reports-data";
import {
  useReportsExport,
  type ExportFormat,
} from "@/hooks/reports/use-reports-export";
import { useCategories } from "@/hooks/use-categories";
import { ReportsFiltersInline } from "./reports-filters-inline";
import { MonthlyComparisonChart } from "./charts/monthly-comparison-chart";
import { TrendsAnalysisChart } from "./charts/trends-analysis-chart";
import { ComparativeAnalysisChart } from "./charts/comparative-analysis-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  Download,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FileBarChart,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ReportsPageModular() {
  // Hooks especializados
  const filterHook = useReportsFilters();
  const dataHook = useReportsData();
  const exportHook = useReportsExport();
  const { categories, loading: categoriesLoading } = useCategories();

  // Carregamento inicial
  useEffect(() => {
    console.log("📊 Reports page mounted - loading initial data");
    dataHook.loadReportData(filterHook.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplicar filtros
  const handleApplyFilters = async () => {
    console.log("🎯 Applying report filters...");
    await dataHook.loadReportData(filterHook.filters);
  };

  // Limpar filtros
  const handleClearFilters = async () => {
    console.log("🗑️ Clearing report filters...");
    filterHook.clearFilters();
    await dataHook.loadReportData(filterHook.filters);
  };

  // Refresh
  const handleRefresh = async () => {
    console.log("🔄 Refreshing report data...");
    await dataHook.loadReportData(filterHook.filters);
  };

  // Exportar
  const handleExport = async (format: ExportFormat) => {
    console.log(`📤 Exporting as ${format}...`);
    await exportHook.exportReport(filterHook.filters, format);
  };

  // Calcular estatísticas resumidas
  const summaryStats = dataHook.data?.summary
    ? {
        totalIncome: dataHook.data.summary.total_income || 0,
        totalExpenses: dataHook.data.summary.total_expenses || 0,
        balance: dataHook.data.summary.net_amount || 0,
        transactionCount: dataHook.data.summary.transaction_count || 0,
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Relatórios Financeiros
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualize e analise suas finanças através de gráficos
                  detalhados
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={dataHook.loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      dataHook.loading ? "animate-spin" : ""
                    }`}
                  />
                  Atualizar
                </Button>

                {/* Dropdown de Exportação */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      disabled={exportHook.exporting || !dataHook.data}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      <FileBarChart className="h-4 w-4 mr-2" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel (XLSX)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      <FileText className="h-4 w-4 mr-2" />
                      CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error alert */}
        {dataHook.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{dataHook.error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros Inline */}
        <ReportsFiltersInline
          filters={filterHook.filters}
          onFiltersChange={filterHook.updateFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          loading={dataHook.loading}
          categories={categories}
          activeFiltersCount={filterHook.activeFiltersCount}
        />

        {/* Cards de Resumo */}
        {summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total de Receitas
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(summaryStats.totalIncome)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total de Despesas
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(summaryStats.totalExpenses)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Saldo
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        summaryStats.balance >= 0
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(summaryStats.balance)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Transações
                    </p>
                    <p className="text-2xl font-bold">
                      {summaryStats.transactionCount}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-gray-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico de Comparação Mensal */}
        <MonthlyComparisonChart
          data={dataHook.data?.monthlyComparison || []}
          loading={dataHook.loading}
        />

        {/* Gráfico de Tendências */}
        <TrendsAnalysisChart
          data={dataHook.data?.trends || []}
          loading={dataHook.loading}
        />

        {/* Gráfico Comparativo (quando ativado) */}
        {filterHook.filters.comparisonPeriod && (
          <ComparativeAnalysisChart
            data={dataHook.data?.comparative || []}
            loading={dataHook.loading}
          />
        )}
      </div>
    </div>
  );
}




