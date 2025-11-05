"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const LOADING_TIMEOUT = 10000 // 10 seconds

export function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const { isAuthenticated, isInitialized } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const isMounted = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      isMounted.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Set timeout for loading state
  useEffect(() => {
    if (!isInitialized) {
      // Set timeout to check session if loading takes too long
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current && !isInitialized) {
          setLoadingTimeout(true)
          
          // Check if we have a token in localStorage
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('meufuturo_token')
            const user = localStorage.getItem('meufuturo_user')
            
            if (token && user) {
              // We have stored credentials but auth didn't initialize
              // This might mean the token is invalid, redirect to login
              console.warn('Loading timeout with stored credentials, redirecting to login')
              router.replace('/login')
            } else {
              // No stored credentials, redirect to login if auth is required
              if (requireAuth) {
                router.replace('/login')
              } else {
                // Public route, allow access
                setLoadingTimeout(false)
              }
            }
          }
        }
      }, LOADING_TIMEOUT)
    } else {
      // Clear timeout if initialized
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setLoadingTimeout(false)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isInitialized, requireAuth, router])

  // Wait for auth to initialize before making routing decisions
  useEffect(() => {
    if (!isMounted.current || !isInitialized) return

    // Redirect immediately if user is not authenticated and auth is required
    if (requireAuth && !isAuthenticated) {
      setIsRedirecting(true)
      // Only redirect if we're not already on login page
      const currentPath = window.location.pathname
      if (currentPath !== '/login') {
        // Preserve current path in query params for potential redirect after login
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`)
      }
      return
    }

    // Redirect authenticated users away from public pages (like login/register)
    if (!requireAuth && isAuthenticated) {
      setIsRedirecting(true)
      router.replace("/")
      return
    }
  }, [isAuthenticated, isInitialized, requireAuth, router])

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loadingTimeout ? 'Verificando sessão...' : 'Carregando...'}
          </p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated && isInitialized) {
    // Don't show redirect message if we're already redirecting or on login page
    // This prevents flickering during redirect
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    if (currentPath === '/login' || isRedirecting) {
      return null
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecionando...</h2>
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    )
  }

  if (!requireAuth && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecionando...</h2>
          <p className="text-muted-foreground">Você já está logado.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
