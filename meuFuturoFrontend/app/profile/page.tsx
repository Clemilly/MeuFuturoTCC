"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { apiService } from "@/lib/api"

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

  const [originalProfileData, setOriginalProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  // Sincronizar os dados do perfil quando o usuário carregar ou mudar
  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.name || "",
        email: user.email || "",
      }
      setProfileData(initialData)
      setOriginalProfileData(initialData)
    }
  }, [user])

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // NOTIFICAÇÕES DESABILITADAS: Preferências de notificação comentadas
  // O sistema não envia notificações automáticas (email, SMS, push, etc.) no momento
  const [preferences, setPreferences] = useState({
    // weeklyReports: true,  // DESABILITADO - notificações não implementadas
    // marketingEmails: false,  // DESABILITADO - notificações não implementadas
    dataSharing: false,
  })

  const handleEditClick = () => {
    // Quando clicar em "Editar Perfil", apenas ativa o modo de edição
    // Sincroniza os dados atuais do usuário nos campos editáveis
    if (user) {
      const currentData = {
        name: user.name || "",
        email: user.email || "",
      }
      setProfileData(currentData)
      setOriginalProfileData(currentData)
    }
    setIsEditing(true)
    setError("")
    setSuccess("")
  }

  const handleCancelEdit = () => {
    // Restaura os dados originais e desativa o modo de edição
    setProfileData(originalProfileData)
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Preparar apenas os campos que foram modificados
      const updateData: { name?: string; email?: string } = {}
      
      if (profileData.name !== originalProfileData.name) {
        updateData.name = profileData.name
      }
      
      if (profileData.email !== originalProfileData.email) {
        updateData.email = profileData.email
      }

      // Verificar se há alguma alteração
      if (Object.keys(updateData).length === 0) {
        setError("Nenhuma alteração foi feita")
        setIsLoading(false)
        return
      }

      // Fazer a chamada à API
      const response = await apiService.updateProfile(updateData)

      if (response.error) {
        setError(response.error || "Erro ao atualizar perfil")
        setIsLoading(false)
        return
      }

      // Atualizar os dados originais com os novos valores
      const updatedData = {
        name: updateData.name !== undefined ? updateData.name : originalProfileData.name,
        email: updateData.email !== undefined ? updateData.email : originalProfileData.email,
      }
      setOriginalProfileData(updatedData)

      // Recarregar o perfil do usuário para atualizar o contexto
      const profileResponse = await apiService.getProfile()
      if (profileResponse.data && typeof profileResponse.data === 'object' && 'name' in profileResponse.data) {
        // Atualizar o localStorage e recarregar a página para sincronizar o contexto
        if (typeof window !== 'undefined') {
          const storedUserStr = localStorage.getItem("meufuturo_user")
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr)
            const profileData = profileResponse.data as { name?: string; email?: string }
            if (profileData.name) storedUser.name = profileData.name
            if (profileData.email) storedUser.email = profileData.email
            localStorage.setItem("meufuturo_user", JSON.stringify(storedUser))
          }
          // Recarregar a página para atualizar o contexto de autenticação
          window.location.reload()
        }
      }

      setSuccess("Perfil atualizado com sucesso!")
      setIsEditing(false)
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err)
      setError("Erro ao atualizar perfil. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validação: Verificar se todos os campos estão preenchidos
    if (!passwordData.currentPassword.trim()) {
      setError("Por favor, informe a senha atual")
      setIsLoading(false)
      return
    }

    if (!passwordData.newPassword.trim()) {
      setError("Por favor, informe a nova senha")
      setIsLoading(false)
      return
    }

    if (!passwordData.confirmPassword.trim()) {
      setError("Por favor, confirme a nova senha")
      setIsLoading(false)
      return
    }

    // Validação: Verificar se a nova senha tem pelo menos 8 caracteres
    if (passwordData.newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres")
      setIsLoading(false)
      return
    }

    // Validação: Verificar se a nova senha e confirmação coincidem
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("As senhas não coincidem. Verifique a nova senha e a confirmação.")
      setIsLoading(false)
      return
    }

    // Validação: Verificar se a nova senha é diferente da atual
    if (passwordData.currentPassword === passwordData.newPassword) {
      setError("A nova senha deve ser diferente da senha atual")
      setIsLoading(false)
      return
    }

    try {
      // Chamada à API para alterar a senha
      const response = await apiService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      })

      if (response.error) {
        // Tratar erros específicos do backend
        const errorMessage = response.error || response.message || "Erro ao alterar senha"
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      // Sucesso: Limpar os campos e exibir mensagem
      setSuccess("Senha alterada com sucesso!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      
      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setSuccess("")
      }, 5000)
    } catch (err) {
      console.error("Erro ao alterar senha:", err)
      // Tratar erros de rede ou outros erros inesperados
      const errorMessage = err instanceof Error ? err.message : "Erro ao alterar senha. Verifique sua conexão e tente novamente."
      setError(errorMessage)
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MaterialIcon name="user" size={20} aria-hidden={true} />
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


                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button type="button" onClick={handleEditClick}>
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
                            onClick={handleCancelEdit}
                            disabled={isLoading}
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
                    <MaterialIcon name="lock" size={20} aria-hidden={true} />
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
                            <MaterialIcon name="eye-off" size={16} aria-hidden={true} />
                          ) : (
                            <MaterialIcon name="eye" size={16} aria-hidden={true} />
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
                          minLength={8}
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
                            <MaterialIcon name="eye-off" size={16} aria-hidden={true} />
                          ) : (
                            <MaterialIcon name="eye" size={16} aria-hidden={true} />
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
                            <MaterialIcon name="eye-off" size={16} aria-hidden={true} />
                          ) : (
                            <MaterialIcon name="eye" size={16} aria-hidden={true} />
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

            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
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
          </Tabs>
        </main>
      </div>
    </RouteGuard>
  )
}
