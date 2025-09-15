"use client"

import { RouteGuard } from "@/components/route-guard"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import { MainNavigation } from "@/components/main-navigation"
import { CategoryManagement } from "@/components/category-management"

export default function CategoriesPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <AccessibilityMenu />
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8 max-w-6xl">
          <CategoryManagement />
        </main>
      </div>
    </RouteGuard>
  )
}
