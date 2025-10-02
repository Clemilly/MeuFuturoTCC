/**
 * Hook responsável APENAS por operações CRUD
 * NÃO faz: listagem, filtros, paginação
 */

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { TransactionCreate, TransactionUpdate } from '@/lib/types'

export function useTransactionsCrud() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const createTransaction = useCallback(async (data: TransactionCreate) => {
    console.log('➕ Creating transaction:', data)
    setLoading(true)

    try {
      const response = await apiService.createTransaction(data)
      
      if (response.error) {
        throw new Error(response.error)
      }

      console.log('✅ Transaction created')
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso"
      })

      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar'
      console.error('❌ Error creating transaction:', errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateTransaction = useCallback(async (id: string, data: TransactionUpdate) => {
    console.log('✏️ Updating transaction:', id, data)
    setLoading(true)

    try {
      const response = await apiService.updateTransaction(id, data)
      
      if (response.error) {
        throw new Error(response.error)
      }

      console.log('✅ Transaction updated')
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso"
      })

      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar'
      console.error('❌ Error updating transaction:', errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [toast])

  const deleteTransaction = useCallback(async (id: string) => {
    console.log('🗑️ Deleting transaction:', id)
    setLoading(true)

    try {
      const response = await apiService.deleteTransaction(id)
      
      if (response.error) {
        throw new Error(response.error)
      }

      console.log('✅ Transaction deleted')
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso"
      })

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir'
      console.error('❌ Error deleting transaction:', errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction
  }
}


