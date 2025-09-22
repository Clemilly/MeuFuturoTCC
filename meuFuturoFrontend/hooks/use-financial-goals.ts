import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { useAuthErrorHandler } from './use-auth-error-handler'
import { useToast } from './use-toast'
import { FinancialGoal, GoalCreate, GoalUpdate, GoalProgressUpdate } from '@/lib/types'

export function useFinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [loading, setLoading] = useState(false)
  const { handleAuthError } = useAuthErrorHandler()
  const { toast } = useToast()

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getFinancialGoals()
      
      if (response.error) {
        if (handleAuthError(response)) {
          return
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao carregar metas",
          variant: "destructive"
        })
        return
      }
      
      setGoals(response.data || [])
    } catch (err) {
      console.error('Error loading goals:', err)
      if (handleAuthError(err)) {
        return
      }
      toast({
        title: "Erro",
        description: "Erro ao carregar metas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [handleAuthError, toast])

  const createGoal = useCallback(async (goalData: GoalCreate) => {
    try {
      const response = await apiService.createFinancialGoal(goalData)
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao criar meta",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao criar meta' }
      }
      
      setGoals(prev => [response.data!, ...prev])
      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso"
      })
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error creating goal:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao criar meta",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao criar meta' }
    }
  }, [handleAuthError, toast])

  const updateGoal = useCallback(async (goalId: string, goalData: GoalUpdate) => {
    try {
      const response = await apiService.updateFinancialGoal(goalId, goalData)
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao atualizar meta",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao atualizar meta' }
      }
      
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? response.data! : goal
      ))
      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso"
      })
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error updating goal:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao atualizar meta",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao atualizar meta' }
    }
  }, [handleAuthError, toast])

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      const response = await apiService.deleteFinancialGoal(goalId)
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao excluir meta",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao excluir meta' }
      }
      
      setGoals(prev => prev.filter(goal => goal.id !== goalId))
      toast({
        title: "Sucesso",
        description: "Meta excluída com sucesso"
      })
      return { success: true }
    } catch (err) {
      console.error('Error deleting goal:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao excluir meta",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao excluir meta' }
    }
  }, [handleAuthError, toast])

  const updateGoalProgress = useCallback(async (goalId: string, progressData: GoalProgressUpdate) => {
    try {
      const response = await apiService.updateGoalProgress(goalId, progressData)
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao atualizar progresso",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao atualizar progresso' }
      }
      
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? response.data! : goal
      ))
      toast({
        title: "Sucesso",
        description: "Progresso atualizado com sucesso"
      })
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error updating goal progress:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao atualizar progresso",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao atualizar progresso' }
    }
  }, [handleAuthError, toast])

  return {
    goals,
    loading,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress
  }
}


