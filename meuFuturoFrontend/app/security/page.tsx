"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MaterialIcon } from "@/lib/material-icons"
import { MainNavigation } from "@/components/main-navigation"

export default function SecurityPage() {
  const { user } = useAuth()

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configurações de Segurança</h1>
            <p className="text-muted-foreground">Gerencie suas configurações de autenticação e segurança da conta</p>
          </div>

          <div className="grid gap-6">
            {/* Status da Conta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MaterialIcon name="shield" size={20} aria-hidden="true" />
                  Status da Conta
                </CardTitle>
                <CardDescription>Informações sobre a segurança da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Usuário</p>
                    <p className="text-sm text-muted-foreground">{user?.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>

                <Separator />

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Segurança da Conta</h4>
                  <p className="text-sm text-blue-800">
                    Sua conta está protegida com autenticação de senha segura.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
