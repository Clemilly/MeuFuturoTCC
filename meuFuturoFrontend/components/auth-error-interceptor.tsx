"use client"

import { useEffect } from 'react'
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler'
import { useAuth } from '@/contexts/auth-context'

interface AuthErrorInterceptorProps {
  children: React.ReactNode
}

export function AuthErrorInterceptor({ children }: AuthErrorInterceptorProps) {
  const { handleAuthError } = useAuthErrorHandler()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Check if it's an authentication error
      if (event.reason && typeof event.reason === 'object') {
        const error = event.reason
        if (error.error || error.message) {
          handleAuthError(error)
        }
      }
    }

    // Global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error)
      
      // Check if it's an authentication error
      if (event.error && typeof event.error === 'object') {
        const error = event.error
        if (error.error || error.message) {
          handleAuthError(error)
        }
      }
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [handleAuthError])

  // Monitor authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      // If user is not authenticated, ensure we're on the login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        // Only redirect if we're not already on the login page
        // This prevents infinite redirects
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login'
        }
      }
    }
  }, [isAuthenticated])

  return <>{children}</>
}

