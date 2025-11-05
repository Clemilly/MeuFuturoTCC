"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<{ success: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state synchronously from localStorage if available
  const getInitialAuthState = () => {
    if (typeof window === 'undefined') {
      return { user: null, isAuthenticated: false }
    }
    
    try {
      const storedUserStr = localStorage.getItem("meufuturo_user")
      const storedToken = localStorage.getItem("meufuturo_token")
      
      if (storedUserStr && storedToken) {
        const storedUser = JSON.parse(storedUserStr)
        if (storedUser && storedUser.id) {
          return { user: storedUser, isAuthenticated: true }
        }
      }
    } catch (error) {
      console.warn('Error reading auth state from localStorage:', error)
    }
    
    return { user: null, isAuthenticated: false }
  }

  const initialState = getInitialAuthState()
  const [user, setUser] = useState<User | null>(initialState.user)
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use custom hook for localStorage
  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<User | null>("meufuturo_user", null)
  const [storedToken, setStoredToken, removeStoredToken] = useLocalStorage<string | null>("meufuturo_token", null)

  // Initialize on mount - validate token and mark as initialized
  useEffect(() => {
    let isCancelled = false
    
    const initializeAuth = async () => {
      // Check if we have a token
      const token = storedToken
      
      if (token && typeof window !== 'undefined') {
        try {
          // Validate token by making a lightweight request to get profile
          const response = await apiService.getProfile()
          
          if (isCancelled) return
          
          if (response.error || !response.data) {
            // Token is invalid, clear auth state
            console.warn('Token validation failed, clearing auth state')
            removeStoredToken()
            removeStoredUser()
            if (!isCancelled) {
              setUser(null)
              setIsAuthenticated(false)
            }
          } else if (response.data) {
            // Token is valid, update user data
            const userData = {
              id: response.data.id,
              email: response.data.email,
              name: response.data.name
            }
            setStoredUser(userData)
            if (!isCancelled) {
              setUser(userData)
              setIsAuthenticated(true)
            }
          }
        } catch (error) {
          // If validation fails, clear auth state
          if (isCancelled) return
          console.warn('Token validation error, clearing auth state:', error)
          removeStoredToken()
          removeStoredUser()
          if (!isCancelled) {
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      }
      
      if (!isCancelled) {
        setIsInitialized(true)
      }
    }
    
    initializeAuth()
    
    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Sync state with localStorage changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      if (storedUser && storedUser !== null && storedUser.id) {
        setUser(storedUser)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    }
  }, [storedUser, isInitialized])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password)
      
      if (response.error) {
        return { success: false, message: response.error }
      }

      const { data } = response
      
      // Store token and user data
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name
      }
      
      setStoredToken(data.access_token)
      setStoredUser(userData)
      
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      return { success: false, message: "Erro de conexão com o servidor" }
    }
  }

  const logout = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      // Try to call logout API
      await apiService.logout()
      
      // Clear all state
      setUser(null)
      setIsAuthenticated(false)
      
      // Clear localStorage
      removeStoredUser()
      removeStoredToken()
      
      // Clear any other auth-related data
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('meufuturo_')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // DO NOT reset isInitialized to false here
      // Keeping isInitialized as true allows RouteGuard to immediately
      // detect that user is not authenticated and redirect properly
      // If we set it to false, RouteGuard will show loading screen indefinitely
      
      return { success: true }
    } catch (error) {
      // Even if API call fails, clear local state to ensure logout
      // This prevents access issues if the API is down
      console.warn('Logout API call failed:', error)
      
      // Clear all state anyway
      setUser(null)
      setIsAuthenticated(false)
      
      // Clear localStorage
      removeStoredUser()
      removeStoredToken()
      
      // Clear any other auth-related data
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('meufuturo_')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // DO NOT reset isInitialized to false here (same reason as above)
      
      // Return error but still consider logout successful from security perspective
      return { 
        success: true, 
        message: "Logout realizado. Alguns dados podem não ter sido sincronizados com o servidor." 
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitialized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
