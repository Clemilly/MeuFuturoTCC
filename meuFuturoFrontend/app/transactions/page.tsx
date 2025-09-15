import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import { MainNavigation } from "@/components/main-navigation"
import { RouteGuard } from "@/components/route-guard"

export default function TransactionsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <AccessibilityMenu />
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <header className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Gerenciar Transações</h1>
              <p className="text-lg text-muted-foreground">Adicione, edite e organize suas receitas e despesas</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <TransactionForm />
              </div>
              <div className="lg:col-span-2">
                <TransactionList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
