"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MaterialIcon } from "@/lib/material-icons"
import Link from "next/link"

export default function LoginPage() {
  const { login, verifyTwoFactor, pendingUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const isMounted = useRef(true)

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email é obrigatório"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Email deve ter um formato válido"
    }
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password.trim()) {
      return "Senha é obrigatória"
    }
    if (password.length < 8) {
      return "Senha deve ter pelo menos 8 caracteres"
    }
    return undefined
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    const error = validateEmail(value)
    setErrors(prev => ({ ...prev, email: error }))
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    const error = validatePassword(value)
    setErrors(prev => ({ ...prev, password: error }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted.current) return
    
    // Validate form
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError })
      return
    }
    
    setIsLoading(true)
    setError("")
    setErrors({})

    try {
      const result = await login(email, password)

      if (!isMounted.current) return

      if (result.success) {
        // Login successful, will be redirected by RouteGuard
      } else if (result.requiresTwoFactor) {
        setShowTwoFactor(true)
      } else {
        setError(result.message || "Erro no login")
      }
    } catch (err) {
      if (isMounted.current) {
        setError("Erro interno do sistema")
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  const handleTwoFactorVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted.current) return
    
    setIsLoading(true)
    setError("")

    try {
      const result = await verifyTwoFactor(twoFactorCode)

      if (!isMounted.current) return

      if (result.success) {
        // Login successful, will be redirected by RouteGuard
      } else {
        setError(result.message || "Código inválido")
      }
    } catch (err) {
      if (isMounted.current) {
        setError("Erro interno do sistema")
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  return (
    <RouteGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              {showTwoFactor ? "Verificação em Duas Etapas" : "Entrar no MeuFuturo"}
            </CardTitle>
            <CardDescription>
              {showTwoFactor
                ? `Digite o código de verificação para ${pendingUser?.name}`
                : "Acesse sua conta para gerenciar suas finanças"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!showTwoFactor ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <MaterialIcon name="mail" size={16} className="absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      required
                      aria-describedby="email-help"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                  <p id="email-help" className="text-sm text-muted-foreground sr-only">
                    Digite seu endereço de email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <MaterialIcon name="lock" size={16} className="absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      required
                      aria-describedby="password-help"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <MaterialIcon name="eye-off" size={16} aria-hidden="true" />
                      ) : (
                        <MaterialIcon name="eye" size={16} aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                  <p id="password-help" className="text-sm text-muted-foreground sr-only">
                    Digite sua senha
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      Cadastre-se
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleTwoFactorVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Código de Verificação</Label>
                  <div className="relative">
                    <MaterialIcon name="shield" size={16} className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="twoFactorCode"
                      type="text"
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="pl-10 text-center tracking-widest"
                      maxLength={6}
                      required
                      aria-describedby="code-help"
                    />
                  </div>
                  <p id="code-help" className="text-sm text-muted-foreground">
                    Digite o código de 6 dígitos do seu aplicativo autenticador
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Verificar Código"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setShowTwoFactor(false)
                    setTwoFactorCode("")
                    setError("")
                  }}
                >
                  Voltar ao Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
