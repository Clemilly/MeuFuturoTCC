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
import { MaterialIcon } from "@/lib/material-icons"
import { MainNavigation } from "@/components/main-navigation"

export default function SecurityPage() {
  const { user, enableTwoFactor, confirmTwoFactor, disableTwoFactor } = useAuth()
  const [setupStep, setSetupStep] = useState<"initial" | "setup" | "confirm">("initial")
  const [verificationCode, setVerificationCode] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [qrSecret, setQrSecret] = useState("")
  const [backupCodes] = useState([
    "ABC123DEF",
    "GHI456JKL",
    "MNO789PQR",
    "STU012VWX",
    "YZA345BCD",
    "EFG678HIJ",
    "KLM901NOP",
    "QRS234TUV",
  ])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleEnable2FA = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await enableTwoFactor()
      setQrSecret(result.secret)
      setSetupStep("setup")
    } catch (err) {
      setError("Erro ao configurar autenticação de dois fatores")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await confirmTwoFactor(verificationCode)

      if (result.success) {
        setSuccess("Autenticação de dois fatores ativada com sucesso!")
        setSetupStep("initial")
        setVerificationCode("")
      } else {
        setError(result.message || "Código inválido")
      }
    } catch (err) {
      setError("Erro interno do sistema")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await disableTwoFactor(disableCode)

      if (result.success) {
        setSuccess("Autenticação de dois fatores desativada")
        setDisableCode("")
      } else {
        setError(result.message || "Código inválido")
      }
    } catch (err) {
      setError("Erro interno do sistema")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(null), 2000)
    }
  }

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configurações de Segurança</h1>
            <p className="text-muted-foreground">Gerencie suas configurações de autenticação e segurança da conta</p>
          </div>

          {(error || success) && (
            <Alert className={`mb-6 ${success ? "border-green-200 bg-green-50" : ""}`} role="alert">
              <AlertDescription className={success ? "text-green-800" : ""}>{error || success}</AlertDescription>
            </Alert>
          )}

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
                  <Badge variant="secondary">{user?.email}</Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {user?.twoFactorEnabled ? (
                      <MaterialIcon name="shield-check" size={20} className="text-green-600" aria-hidden="true" />
                    ) : (
                      <MaterialIcon name="shield-x" size={20} className="text-orange-600" aria-hidden="true" />
                    )}
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.twoFactorEnabled ? "Ativada e protegendo sua conta" : "Não configurada"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={user?.twoFactorEnabled ? "default" : "secondary"}>
                    {user?.twoFactorEnabled ? "Ativada" : "Inativa"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Configuração de 2FA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MaterialIcon name="smartphone" size={20} aria-hidden="true" />
                  Autenticação de Dois Fatores (2FA)
                </CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user?.twoFactorEnabled ? (
                  <>
                    {setupStep === "initial" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Como funciona?</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Instale um app autenticador (Google Authenticator, Authy, etc.)</li>
                            <li>• Escaneie o QR Code que será gerado</li>
                            <li>• Digite o código de 6 dígitos para confirmar</li>
                            <li>• Sua conta ficará mais segura!</li>
                          </ul>
                        </div>

                        <Button onClick={handleEnable2FA} disabled={isLoading} className="w-full">
                          {isLoading ? "Configurando..." : "Ativar Autenticação de Dois Fatores"}
                        </Button>
                      </div>
                    )}

                    {setupStep === "setup" && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h4 className="font-medium mb-4">Escaneie o QR Code</h4>
                          <div className="bg-white p-4 rounded-lg border inline-block">
                            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                              <div className="text-center">
                                <Key className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
                                <p className="text-sm text-muted-foreground">QR Code</p>
                                <p className="text-xs text-muted-foreground mt-1">(Simulado para demonstração)</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Escaneie este código com seu aplicativo autenticador
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Código Manual (alternativa ao QR Code)</Label>
                          <div className="flex gap-2">
                            <Input value={qrSecret} readOnly className="font-mono text-sm" />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(qrSecret)}
                              aria-label="Copiar código manual"
                            >
                              {copiedCode === qrSecret ? (
                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Copy className="h-4 w-4" aria-hidden="true" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button
                          onClick={() => setSetupStep("confirm")}
                          className="w-full"
                          aria-describedby="setup-help"
                        >
                          Continuar para Verificação
                        </Button>
                        <p id="setup-help" className="text-sm text-muted-foreground text-center">
                          Após configurar o app, clique para inserir o código de verificação
                        </p>
                      </div>
                    )}

                    {setupStep === "confirm" && (
                      <form onSubmit={handleConfirm2FA} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="verification-code">Código de Verificação</Label>
                          <Input
                            id="verification-code"
                            type="text"
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="text-center tracking-widest"
                            maxLength={6}
                            required
                            aria-describedby="verification-help"
                          />
                          <p id="verification-help" className="text-sm text-muted-foreground">
                            Digite o código de 6 dígitos do seu aplicativo autenticador
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? "Verificando..." : "Confirmar e Ativar"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSetupStep("setup")
                              setVerificationCode("")
                              setError("")
                            }}
                          >
                            Voltar
                          </Button>
                        </div>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MaterialIcon name="shield-check" size={20} className="text-green-600" aria-hidden="true" />
                        <h4 className="font-medium text-green-900">2FA Ativado</h4>
                      </div>
                      <p className="text-sm text-green-800">
                        Sua conta está protegida com autenticação de dois fatores
                      </p>
                    </div>

                    <form onSubmit={handleDisable2FA} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="disable-code">Código para Desativar</Label>
                        <Input
                          id="disable-code"
                          type="text"
                          placeholder="000000"
                          value={disableCode}
                          onChange={(e) => setDisableCode(e.target.value)}
                          className="text-center tracking-widest"
                          maxLength={6}
                          required
                          aria-describedby="disable-help"
                        />
                        <p id="disable-help" className="text-sm text-muted-foreground">
                          Digite um código do seu aplicativo autenticador para desativar o 2FA
                        </p>
                      </div>

                      <Button type="submit" variant="destructive" disabled={isLoading} className="w-full">
                        {isLoading ? "Desativando..." : "Desativar Autenticação de Dois Fatores"}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Códigos de Backup */}
            {user?.twoFactorEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" aria-hidden="true" />
                    Códigos de Backup
                  </CardTitle>
                  <CardDescription>
                    Use estes códigos se não conseguir acessar seu aplicativo autenticador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        <strong>Importante:</strong> Guarde estes códigos em local seguro. Cada código só pode ser usado
                        uma vez.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <code className="flex-1 text-sm font-mono">{code}</code>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code)}
                            aria-label={`Copiar código ${code}`}
                          >
                            {copiedCode === code ? (
                              <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                            ) : (
                              <Copy className="h-4 w-4" aria-hidden="true" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        const allCodes = backupCodes.join("\n")
                        copyToClipboard(allCodes)
                      }}
                      className="w-full"
                    >
                      Copiar Todos os Códigos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
