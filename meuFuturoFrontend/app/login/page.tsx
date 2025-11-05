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
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
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
        // Login successful - redirect manually to ensure it works
        const redirectPath = searchParams.get('redirect') || '/'
        // Use setTimeout to ensure state is updated before redirect
        setTimeout(() => {
          router.replace(redirectPath)
        }, 100)
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

  // Also handle redirect if user becomes authenticated (backup to manual redirect)
  useEffect(() => {
    if (isAuthenticated && isMounted.current) {
      const redirectPath = searchParams.get('redirect') || '/'
      router.replace(redirectPath)
    }
  }, [isAuthenticated, router, searchParams])


  return (
    <RouteGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Entrar no MeuFuturo
            </CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar suas finanças
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
