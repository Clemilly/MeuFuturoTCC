"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { MaterialIcon } from "@/lib/material-icons"
import { MainNavigation } from "@/components/main-navigation"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferences, setPreferences] = useState({
    weeklyReports: true,
    marketingEmails: false,
    dataSharing: false,
  })

  const [recentActivity] = useState([
    { action: "Login realizado", date: "2024-01-15 14:30", ip: "192.168.1.1" },
    { action: "Transação adicionada", date: "2024-01-15 10:15", ip: "192.168.1.1" },
    { action: "Relatório visualizado", date: "2024-01-14 16:45", ip: "192.168.1.1" },
    { action: "Configurações alteradas", date: "2024-01-14 09:20", ip: "192.168.1.1" },
    { action: "Login realizado", date: "2024-01-13 18:10", ip: "192.168.1.2" },
  ])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // TODO: Implement API call for profile update
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("Perfil atualizado com sucesso!")
      setIsEditing(false)
    } catch (err) {
      setError("Erro ao atualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres")
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implement API call for password change
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("Senha alterada com sucesso!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setError("Erro ao alterar senha")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    // In real app, would save to API
    setSuccess("Preferências atualizadas!")
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências da conta</p>
          </div>

          {(error || success) && (
            <Alert className={`mb-6 ${success ? "border-green-200 bg-green-50" : ""}`} role="alert">
              <AlertDescription className={success ? "text-green-800" : ""}>{error || success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MaterialIcon name="user" size={20} aria-hidden="true" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>Atualize suas informações básicas da conta</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Nome Completo</Label>
                      <Input
                        id="profile-name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        required
                        aria-describedby="name-help"
                      />
                      <p id="name-help" className="text-sm text-muted-foreground sr-only">
                        Digite seu nome completo
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-email">Email</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        required
                        aria-describedby="email-help"
                      />
                      <p id="email-help" className="text-sm text-muted-foreground sr-only">
                        Digite seu endereço de email
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={user?.twoFactorEnabled ? "default" : "secondary"}>
                        {user?.twoFactorEnabled ? "2FA Ativado" : "2FA Inativo"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {user?.twoFactorEnabled
                          ? "Sua conta está protegida com autenticação de dois fatores"
                          : "Configure 2FA nas configurações de segurança"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button type="button" onClick={() => setIsEditing(true)}>
                          Editar Perfil
                        </Button>
                      ) : (
                        <>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Alterações"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              setProfileData({ name: user?.name || "", email: user?.email || "" })
                              setError("")
                            }}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MaterialIcon name="lock" size={20} aria-hidden="true" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          className="pr-10"
                          required
                          aria-describedby="current-password-help"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          aria-label={showCurrentPassword ? "Ocultar senha atual" : "Mostrar senha atual"}
                        >
                          {showCurrentPassword ? (
                            <MaterialIcon name="eye-off" size={16} aria-hidden="true" />
                          ) : (
                            <MaterialIcon name="eye" size={16} aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                      <p id="current-password-help" className="text-sm text-muted-foreground sr-only">
                        Digite sua senha atual
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                          className="pr-10"
                          minLength={6}
                          required
                          aria-describedby="new-password-help"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
                        >
                          {showNewPassword ? (
                            <MaterialIcon name="eye-off" size={16} aria-hidden="true" />
                          ) : (
                            <MaterialIcon name="eye" size={16} aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                      <p id="new-password-help" className="text-sm text-muted-foreground">
                        A nova senha deve ter pelo menos 8 caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pr-10"
                          required
                          aria-describedby="confirm-password-help"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"}
                        >
                          {showConfirmPassword ? (
                            <MaterialIcon name="eye-off" size={16} aria-hidden="true" />
                          ) : (
                            <MaterialIcon name="eye" size={16} aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                      <p id="confirm-password-help" className="text-sm text-muted-foreground">
                        Repita a nova senha para confirmação
                      </p>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MaterialIcon name="shield" size={20} aria-hidden="true" />
                    Configurações de Segurança
                  </CardTitle>
                  <CardDescription>Gerencie recursos avançados de segurança</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Autenticação de Dois Fatores</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.twoFactorEnabled ? "Ativada e protegendo sua conta" : "Configure para maior segurança"}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <a href="/security">Gerenciar 2FA</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MaterialIcon name="bell" size={20} aria-hidden="true" />
                    Notificações
                  </CardTitle>
                  <CardDescription>Configure como e quando você quer receber notificações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-reports">Relatórios Semanais</Label>
                      <p className="text-sm text-muted-foreground">Receba resumos semanais das suas finanças</p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={preferences.weeklyReports}
                      onCheckedChange={(checked) => handlePreferenceChange("weeklyReports", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Emails de Marketing</Label>
                      <p className="text-sm text-muted-foreground">Receba dicas e novidades sobre finanças</p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={preferences.marketingEmails}
                      onCheckedChange={(checked) => handlePreferenceChange("marketingEmails", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacidade</CardTitle>
                  <CardDescription>Controle como seus dados são utilizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-sharing">Compartilhamento de Dados</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir uso anônimo de dados para melhorar o serviço
                      </p>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={preferences.dataSharing}
                      onCheckedChange={(checked) => handlePreferenceChange("dataSharing", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MaterialIcon name="activity" size={20} aria-hidden="true" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>Histórico das suas ações na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">IP: {activity.ip}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </RouteGuard>
  )
}
