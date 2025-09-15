import { FinancialReports } from "@/components/financial-reports"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import { MainNavigation } from "@/components/main-navigation"
import { RouteGuard } from "@/components/route-guard"

export default function ReportsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <AccessibilityMenu />
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <header className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
              <p className="text-lg text-muted-foreground">
                Visualize e analise suas finanças através de gráficos e tabelas detalhadas
              </p>
            </header>

            <FinancialReports />
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
