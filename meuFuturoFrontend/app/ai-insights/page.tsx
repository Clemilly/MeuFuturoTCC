import { AIFinancialInsights } from "@/components/ai-financial-insights"
import { MainNavigation } from "@/components/main-navigation"
import { RouteGuard } from "@/components/route-guard"

export default function AIInsightsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <header className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Inteligência Financeira</h1>
              <p className="text-lg text-muted-foreground">
                Análises inteligentes e previsões personalizadas para suas finanças
              </p>
            </header>

            <AIFinancialInsights />
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
