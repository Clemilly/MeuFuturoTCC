/**
 * Custom hook for managing categories
 */

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler'
import type { Category, CategoryCreate } from '@/lib/types'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  loadCategories: () => Promise<void>
  refresh: () => Promise<void>
  createCategory: (categoryData: CategoryCreate) => Promise<Category | null>
  refreshCategories: () => Promise<void>
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(true)

  const { toast } = useToast()
  const { handleAuthError } = useAuthErrorHandler()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false)
    }
  }, [])

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!isMounted) return

    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getCategories(true, true)

      if (!isMounted) return

      if (response.error) {
        setError(response.error)
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive"
        })
        return
      }

      setCategories(response.data || [])
    } catch (err) {
      console.error('Error loading categories:', err)
      
      if (!isMounted) return
      
      // Check if it's an authentication error
      if (handleAuthError(err)) {
        return
      }
      
      const errorMessage = 'Erro ao carregar categorias'
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [isMounted, toast, handleAuthError])

  // Refresh categories
  const refresh = useCallback(async () => {
    await loadCategories()
  }, [loadCategories])

  // Refresh categories (public function for external use)
  const refreshCategories = useCallback(async () => {
    await loadCategories()
  }, [loadCategories])

  // Create category
  const createCategory = useCallback(async (categoryData: CategoryCreate): Promise<Category | null> => {
    try {
      const response = await apiService.createCategory(categoryData)

      if (response.error) {
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive"
        })
        return null
      }

      // Add the new category to the list
      if (response.data) {
        setCategories(prev => [...prev, response.data])
      }

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      })

      return response.data
    } catch (err) {
      console.error('Error creating category:', err)
      
      // Check if it's an authentication error
      if (handleAuthError(err)) {
        return null
      }
      
      const errorMessage = 'Erro ao criar categoria'
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    }
  }, [toast, handleAuthError])

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    loading,
    error,
    loadCategories,
    refresh,
    createCategory,
    refreshCategories
  }
}
