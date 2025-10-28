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
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use custom hook for localStorage
  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<User | null>("meufuturo_user", null)
  const [storedToken, setStoredToken, removeStoredToken] = useLocalStorage<string | null>("meufuturo_token", null)

  useEffect(() => {
    // Check for stored authentication only once
    if (!isInitialized) {
      // Only proceed if we have valid stored data
      if (storedUser && storedUser !== null && storedUser.id) {
        setUser(storedUser)
        setIsAuthenticated(true)
      } else {
        // Clear any invalid stored data
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsInitialized(true)
    }
  }, [storedUser, isInitialized])

  // Add effect to sync state with localStorage changes
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

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    }
    
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
    
    // Reset initialization state to allow re-initialization
    setIsInitialized(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
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
