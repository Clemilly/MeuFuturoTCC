import { TransactionsPageModular } from "@/components/transactions/transactions-page-modular";
import { MainNavigation } from "@/components/main-navigation";
import { RouteGuard } from "@/components/route-guard";

export default function Transactions() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <TransactionsPageModular />
        </main>
      </div>
    </RouteGuard>
  );
}
