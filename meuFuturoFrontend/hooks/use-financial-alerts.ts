import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { useAuthErrorHandler } from './use-auth-error-handler'
import { useToast } from './use-toast'
import { FinancialAlert, AlertCreate, AlertUpdate } from '@/lib/types'

export function useFinancialAlerts() {
  const [alerts, setAlerts] = useState<FinancialAlert[]>([])
  const [loading, setLoading] = useState(false)
  const { handleAuthError } = useAuthErrorHandler()
  const { toast } = useToast()

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getFinancialAlerts()
      
      if (response.error) {
        if (handleAuthError(response)) {
          return
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao carregar alertas",
          variant: "destructive"
        })
        return
      }
      
      setAlerts(response.data || [])
    } catch (err) {
      console.error('Error loading alerts:', err)
      if (handleAuthError(err)) {
        return
      }
      toast({
        title: "Erro",
        description: "Erro ao carregar alertas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [handleAuthError, toast])

  const createAlert = useCallback(async (alertData: AlertCreate) => {
    try {
      const response = await apiService.createFinancialAlert(alertData)
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao criar alerta",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao criar alerta' }
      }
      
      setAlerts(prev => [response.data!, ...prev])
      toast({
        title: "Sucesso",
        description: "Alerta criado com sucesso"
      })
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error creating alert:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao criar alerta",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao criar alerta' }
    }
  }, [handleAuthError, toast])

  const updateAlert = useCallback(async (alertId: string, alertData: AlertUpdate) => {
    try {
      const response = await apiService.updateFinancialAlert(alertId, alertData)
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao atualizar alerta",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao atualizar alerta' }
      }
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? response.data! : alert
      ))
      toast({
        title: "Sucesso",
        description: "Alerta atualizado com sucesso"
      })
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error updating alert:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao atualizar alerta",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao atualizar alerta' }
    }
  }, [handleAuthError, toast])

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      const response = await apiService.deleteFinancialAlert(alertId)
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao excluir alerta",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao excluir alerta' }
      }
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      toast({
        title: "Sucesso",
        description: "Alerta excluído com sucesso"
      })
      return { success: true }
    } catch (err) {
      console.error('Error deleting alert:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao excluir alerta",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao excluir alerta' }
    }
  }, [handleAuthError, toast])

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      const response = await apiService.dismissFinancialAlert(alertId)
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao dispensar alerta",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao dispensar alerta' }
      }
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? response.data! : alert
      ))
      toast({
        title: "Sucesso",
        description: "Alerta dispensado com sucesso"
      })
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error dismissing alert:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao dispensar alerta",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao dispensar alerta' }
    }
  }, [handleAuthError, toast])

  const generateSmartAlerts = useCallback(async () => {
    try {
      const response = await apiService.generateSmartAlerts()
      
      if (response.error) {
        if (handleAuthError(response)) {
          return { success: false, error: 'Authentication error' }
        }
        toast({
          title: "Erro",
          description: response.message || "Erro ao gerar alertas inteligentes",
          variant: "destructive"
        })
        return { success: false, error: response.message || 'Erro ao gerar alertas inteligentes' }
      }
      
      setAlerts(prev => [...response.data!, ...prev])
      toast({
        title: "Sucesso",
        description: `${response.data?.length || 0} alertas inteligentes gerados`
      })
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error generating smart alerts:', err)
      if (handleAuthError(err)) {
        return { success: false, error: 'Authentication error' }
      }
      toast({
        title: "Erro",
        description: "Erro ao gerar alertas inteligentes",
        variant: "destructive"
      })
      return { success: false, error: 'Erro ao gerar alertas inteligentes' }
    }
  }, [handleAuthError, toast])

  return {
    alerts,
    loading,
    loadAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    dismissAlert,
    generateSmartAlerts
  }
}


