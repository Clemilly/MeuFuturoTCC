import { TransactionsPage } from "@/components/transactions/transactions-page"
import { MainNavigation } from "@/components/main-navigation"
import { RouteGuard } from "@/components/route-guard"

export default function Transactions() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <TransactionsPage />
        </main>
      </div>
    </RouteGuard>
  )
}
