import { AccessibilityMenu } from "@/components/accessibility-menu"
import { MainNavigation } from "@/components/main-navigation"
import { FinancialOverview } from "@/components/financial-overview"
import { RouteGuard } from "@/components/route-guard"

export default function HomePage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <AccessibilityMenu />

        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <header className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Bem-vindo ao MeuFuturo</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sua plataforma de gestão financeira pessoal, desenvolvida com foco em acessibilidade e facilidade de uso
              </p>
            </header>

            <FinancialOverview />
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
