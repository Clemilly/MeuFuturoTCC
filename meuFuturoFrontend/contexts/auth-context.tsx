"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface User {
  id: string
  email: string
  name: string
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string }>
  verifyTwoFactor: (code: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>
  confirmTwoFactor: (code: string) => Promise<{ success: boolean; message?: string }>
  disableTwoFactor: (code: string) => Promise<{ success: boolean; message?: string }>
  pendingUser: User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [pendingUser, setPendingUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use custom hook for localStorage
  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<User | null>("meufuturo_user", null)
  const [storedToken, setStoredToken, removeStoredToken] = useLocalStorage<string | null>("meufuturo_token", null)

  useEffect(() => {
    // Check for stored authentication only once
    if (!isInitialized) {
      if (storedUser) {
        setUser(storedUser)
        setIsAuthenticated(true)
      }
      setIsInitialized(true)
    }
  }, [storedUser, isInitialized])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password)
      
      if (response.error) {
        return { success: false, message: response.error }
      }

      const { data } = response
      
      if (data.requiresTwoFactor) {
        setPendingUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          twoFactorEnabled: data.user.two_factor_enabled,
          twoFactorSecret: data.user.two_factor_secret
        })
        return { success: false, requiresTwoFactor: true, message: "Código de verificação necessário" }
      }

      // Store token and user data
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        twoFactorEnabled: data.user.two_factor_enabled,
        twoFactorSecret: data.user.two_factor_secret
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

  const verifyTwoFactor = async (code: string) => {
    if (!pendingUser) {
      return { success: false, message: "Sessão expirada" }
    }

    try {
      const response = await apiService.verifyTwoFactor(code)
      
      if (response.error) {
        return { success: false, message: response.error }
      }

      const { data } = response
      
      // Store token and user data
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        twoFactorEnabled: data.user.two_factor_enabled,
        twoFactorSecret: data.user.two_factor_secret
      }
      
      setStoredToken(data.access_token)
      setStoredUser(userData)
      
      setUser(userData)
      setIsAuthenticated(true)
      setPendingUser(null)
      
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
    }
    
    setUser(null)
    setIsAuthenticated(false)
    setPendingUser(null)
    removeStoredUser()
    removeStoredToken()
  }

  const enableTwoFactor = async () => {
    try {
      const response = await apiService.enableTwoFactor()
      
      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (error) {
      throw new Error("Erro ao habilitar autenticação de duas etapas")
    }
  }

  const confirmTwoFactor = async (code: string) => {
    if (!user) return { success: false, message: "Usuário não encontrado" }

    try {
      const response = await apiService.confirmTwoFactor(code)
      
      if (response.error) {
        return { success: false, message: response.error }
      }

      const updatedUser = { ...user, twoFactorEnabled: true, twoFactorSecret: response.data.secret }
      setUser(updatedUser)
      setStoredUser(updatedUser)
      
      return { success: true }
    } catch (error) {
      return { success: false, message: "Erro de conexão com o servidor" }
    }
  }

  const disableTwoFactor = async (code: string) => {
    if (!user) return { success: false, message: "Usuário não encontrado" }

    try {
      const response = await apiService.disableTwoFactor(code)
      
      if (response.error) {
        return { success: false, message: response.error }
      }

      const updatedUser = { ...user, twoFactorEnabled: false, twoFactorSecret: null }
      setUser(updatedUser)
      setStoredUser(updatedUser)
      
      return { success: true }
    } catch (error) {
      return { success: false, message: "Erro de conexão com o servidor" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        verifyTwoFactor,
        logout,
        enableTwoFactor,
        confirmTwoFactor,
        disableTwoFactor,
        pendingUser,
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
