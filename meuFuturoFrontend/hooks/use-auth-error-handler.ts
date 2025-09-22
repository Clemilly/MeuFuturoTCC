"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

interface AuthErrorHandler {
  handleAuthError: (error: any) => boolean
  isAuthError: (error: any) => boolean
}

export function useAuthErrorHandler(): AuthErrorHandler {
  const router = useRouter()
  const { logout } = useAuth()
  const { toast } = useToast()

  const isAuthError = useCallback((error: any): boolean => {
    if (!error) return false
    
    // Check for common authentication error patterns
    const authErrorPatterns = [
      'Token inválido',
      'Token expirado',
      'Token expired',
      'Invalid token',
      'Unauthorized',
      'unauthorized',
      '401',
      'Authentication failed',
      'Credenciais inválidas',
      'Sessão expirada',
      'Token not found',
      'Invalid credentials'
    ]

    const errorMessage = error.message || error.error || error.toString()
    const errorString = errorMessage.toLowerCase()

    return authErrorPatterns.some(pattern => 
      errorString.includes(pattern.toLowerCase())
    )
  }, [])

  const handleAuthError = useCallback((error: any): boolean => {
    if (!isAuthError(error)) {
      return false
    }

    console.warn('Authentication error detected:', error)

    // Show user-friendly error message
    toast({
      title: "Sessão Expirada",
      description: "Sua sessão expirou. Faça login novamente para continuar.",
      variant: "destructive",
      duration: 5000
    })

    // Logout user and clear stored data
    logout()

    // Redirect to login page
    router.push('/login')

    return true
  }, [isAuthError, logout, router, toast])

  return {
    handleAuthError,
    isAuthError
  }
}

