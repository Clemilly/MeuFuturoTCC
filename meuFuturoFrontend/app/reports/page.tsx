import { ReportsPageModular } from "@/components/reports/reports-page-modular";
import { MainNavigation } from "@/components/main-navigation";
import { RouteGuard } from "@/components/route-guard";

export default function ReportsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <MainNavigation />

        <main id="main-content">
          <ReportsPageModular />
        </main>
      </div>
    </RouteGuard>
  );
}
