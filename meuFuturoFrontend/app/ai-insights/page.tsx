import { AdvancedAIDashboard } from "@/components/ai/advanced-dashboard";
import { FinancialSimulator } from "@/components/ai/financial-simulator";
import { PatternAnalysis } from "@/components/ai/pattern-analysis";
import { AIRecommendations } from "@/components/ai/ai-recommendations";
import { MonthlyReport } from "@/components/ai/monthly-report";
import { MainNavigation } from "@/components/main-navigation";
import { RouteGuard } from "@/components/route-guard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIInsightsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Inteligência Financeira</h1>
            <p className="text-lg text-muted-foreground">
              Análises avançadas e insights personalizados com IA
            </p>
          </header>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="patterns">Padrões</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
              <TabsTrigger value="simulator">Simulador</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AdvancedAIDashboard />
            </TabsContent>

            <TabsContent value="patterns">
              <PatternAnalysis />
            </TabsContent>

            <TabsContent value="recommendations">
              <AIRecommendations />
            </TabsContent>

            <TabsContent value="simulator">
              <FinancialSimulator />
            </TabsContent>

            <TabsContent value="reports">
              <MonthlyReport />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </RouteGuard>
  );
}
