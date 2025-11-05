/**
 * Hook para detectar refresh da página e recarregar dados
 * Também suporta salvar/restaurar estado (filtros, seleções, etc.)
 */

import { useEffect, useRef, useCallback } from 'react'

interface UsePageRefreshOptions {
  /**
   * Callback para recarregar dados após refresh
   */
  onRefresh?: () => void | Promise<void>
  
  /**
   * Chave para salvar/restaurar estado no sessionStorage
   */
  stateKey?: string
  
  /**
   * Callback para salvar estado antes do refresh
   */
  onSaveState?: () => Record<string, any>
  
  /**
   * Callback para restaurar estado após refresh
   */
  onRestoreState?: (savedState: Record<string, any>) => void
}

/**
 * Hook para gerenciar refresh da página e recarregamento de dados
 */
export function usePageRefresh(options: UsePageRefreshOptions = {}) {
  const { onRefresh, stateKey, onSaveState, onRestoreState } = options
  const hasRefreshed = useRef(false)

  // Detectar se é um refresh da página e recarregar dados
  useEffect(() => {
    // Verificar se é um refresh usando Performance API
    let isRefresh = false
    
    try {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navigationEntries.length > 0) {
        isRefresh = navigationEntries[0].type === 'reload'
      } else if (typeof window !== 'undefined' && (window.performance as any).navigation) {
        // Fallback para navegadores mais antigos
        const navType = (window.performance as any).navigation.type
        isRefresh = navType === 1 // TYPE_RELOAD
      }
    } catch (error) {
      // Se não conseguir detectar, assume que não é refresh (primeira carga)
      console.warn('Could not detect page refresh type:', error)
    }

    // Se for refresh, restaurar estado e recarregar dados
    if (isRefresh && !hasRefreshed.current) {
      hasRefreshed.current = true
      
      // Restaurar estado se disponível
      if (stateKey && onRestoreState) {
        try {
          const savedState = sessionStorage.getItem(`page_state_${stateKey}`)
          if (savedState) {
            const parsedState = JSON.parse(savedState)
            onRestoreState(parsedState)
          }
        } catch (error) {
          console.warn('Error restoring page state:', error)
        }
      }

      // Recarregar dados após refresh para garantir dados atualizados
      if (onRefresh) {
        Promise.resolve(onRefresh()).catch(error => {
          console.error('Error refreshing data:', error)
        })
      }
    }
  }, [onRefresh, stateKey, onRestoreState])

  // Salvar estado antes do refresh
  useEffect(() => {
    if (!stateKey || !onSaveState) return

    const handleBeforeUnload = () => {
      try {
        const state = onSaveState()
        sessionStorage.setItem(`page_state_${stateKey}`, JSON.stringify(state))
      } catch (error) {
        console.warn('Error saving page state:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [stateKey, onSaveState])

  /**
   * Função para forçar refresh manual dos dados
   */
  const forceRefresh = useCallback(async () => {
    if (onRefresh) {
      await Promise.resolve(onRefresh())
    }
  }, [onRefresh])

  /**
   * Função para limpar estado salvo
   */
  const clearSavedState = useCallback(() => {
    if (stateKey) {
      sessionStorage.removeItem(`page_state_${stateKey}`)
    }
  }, [stateKey])

  return {
    forceRefresh,
    clearSavedState,
  }
}

