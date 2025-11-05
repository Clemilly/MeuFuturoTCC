"use client"

import { useEffect } from 'react'
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler'
import { useAuth } from '@/contexts/auth-context'
import { authEvents } from '@/lib/auth-events'

interface AuthErrorInterceptorProps {
  children: React.ReactNode
}

export function AuthErrorInterceptor({ children }: AuthErrorInterceptorProps) {
  const { handleAuthError } = useAuthErrorHandler()
  const { isAuthenticated, isInitialized } = useAuth()

  // Register handler for global auth errors
  useEffect(() => {
    const unsubscribe = authEvents.onAuthError(() => {
      handleAuthError({ error: 'Sessão expirada ou inválida' })
    })

    return unsubscribe
  }, [handleAuthError])

  useEffect(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Check if it's an authentication error
      if (event.reason && typeof event.reason === 'object') {
        const error = event.reason
        if (error.error || error.message) {
          await handleAuthError(error)
        }
      }
    }

    // Global error handler for uncaught errors
    const handleError = async (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error)
      
      // Check if it's an authentication error
      if (event.error && typeof event.error === 'object') {
        const error = event.error
        if (error.error || error.message) {
          await handleAuthError(error)
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

  // Monitor authentication state changes - but only after initialization
  // This prevents redirects during page refresh before auth state is loaded
  useEffect(() => {
    // Wait for initialization to complete before checking auth state
    if (!isInitialized) {
      return
    }

    // Only redirect if user is truly not authenticated (after initialization)
    // AND we're not on a public page
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        const publicPaths = ['/login', '/register']
        
        // Only redirect if we're not already on a public page
        if (!publicPaths.includes(currentPath)) {
          // Use Next.js router instead of window.location to preserve navigation state
          // But we'll let RouteGuard handle the redirect to avoid conflicts
          return
        }
      }
    }
  }, [isAuthenticated, isInitialized])

  return <>{children}</>
}

