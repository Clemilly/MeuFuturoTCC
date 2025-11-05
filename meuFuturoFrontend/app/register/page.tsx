"use client"

import type React from "react"

import { useState } from "react"
import { RouteGuard } from "@/components/route-guard"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MaterialIcon } from "@/lib/material-icons"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Real-time validation
    let error: string | undefined
    switch (name) {
      case 'name':
        error = validateName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value)
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value)
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }))
        }
        break
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password)
        break
    }
    
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return "Nome é obrigatório"
    }
    if (name.trim().length < 2) {
      return "Nome deve ter pelo menos 2 caracteres"
    }
    return undefined
  }

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
    if (!/(?=.*[a-z])/.test(password)) {
      return "Senha deve conter pelo menos uma letra minúscula"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Senha deve conter pelo menos uma letra maiúscula"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Senha deve conter pelo menos um número"
    }
    return undefined
  }

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword.trim()) {
      return "Confirmação de senha é obrigatória"
    }
    if (confirmPassword !== password) {
      return "Senhas não coincidem"
    }
    return undefined
  }

  const validateForm = () => {
    const nameError = validateName(formData.name)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
    
    const newErrors = {
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    }
    
    setErrors(newErrors)
    
    return !Object.values(newErrors).some(error => error !== undefined)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const response = await apiService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      if (response.error) {
        // Use message if available, otherwise use error
        const errorMessage = response.message || response.error || 'Erro ao criar conta'
        setError(errorMessage)
        console.error('Registration error:', response)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error('Registration exception:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro interno do sistema'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <RouteGuard requireAuth={false}>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">Cadastro Realizado!</CardTitle>
              <CardDescription>Sua conta foi criada com sucesso</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">Você já pode fazer login com suas credenciais.</p>
              <Button asChild className="w-full">
                <Link href="/login">Fazer Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Criar Conta no MeuFuturo</CardTitle>
            <CardDescription>Cadastre-se para começar a gerenciar suas finanças</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <MaterialIcon name="user" size={16} className="absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    required
                    aria-describedby="name-help"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
                <p id="name-help" className="text-sm text-muted-foreground sr-only">
                  Digite seu nome completo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <MaterialIcon name="mail" size={16} className="absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    required
                    minLength={8}
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
                <p id="password-help" className="text-sm text-muted-foreground">
                  A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <MaterialIcon name="lock" size={16} className="absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    required
                    aria-describedby="confirm-password-help"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                  >
                    {showConfirmPassword ? (
                      <MaterialIcon name="eye-off" size={16} aria-hidden="true" />
                    ) : (
                      <MaterialIcon name="eye" size={16} aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
                <p id="confirm-password-help" className="text-sm text-muted-foreground">
                  Repita a senha para confirmação
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando Conta..." : "Criar Conta"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Faça login
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
