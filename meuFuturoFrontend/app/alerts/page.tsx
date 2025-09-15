import { AlertsAndNotifications } from "@/components/alerts-and-notifications"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import { MainNavigation } from "@/components/main-navigation"
import { RouteGuard } from "@/components/route-guard"

export default function AlertsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <AccessibilityMenu />
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <header className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Alertas e Notificações</h1>
              <p className="text-lg text-muted-foreground">
                Gerencie seus lembretes financeiros e configure notificações personalizadas
              </p>
            </header>

            <AlertsAndNotifications />
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
