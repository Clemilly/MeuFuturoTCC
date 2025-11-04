/**
 * Hook orquestrador que coordena todos os hooks especializados
 * Este é o ÚNICO hook que componentes devem usar
 */

import { useCallback, useEffect } from 'react'
import { useTransactionsList } from './use-transactions-list'
import { useTransactionsFilters } from './use-transactions-filters'
import { useTransactionsPagination } from './use-transactions-pagination'
import { useTransactionsCrud } from './use-transactions-crud'
import { convertFiltersToApi, createDefaultFilters } from '@/lib/transactions/filter-utils'
import { validateFilters } from '@/lib/transactions/validators'
import { useToast } from '@/hooks/use-toast'
import type { TransactionCreate, TransactionUpdate } from '@/lib/types'

export function useTransactionsOrchestrator() {
  const { toast } = useToast()
  
  // Hooks especializados
  const list = useTransactionsList()
  const filterHook = useTransactionsFilters()
  const paginationHook = useTransactionsPagination()
  const crud = useTransactionsCrud()

  /**
   * Aplica filtros - faz requisição ao backend
   */
  const applyFilters = useCallback(async () => {
    console.log('🎯 Applying filters...')

    // Validar filtros
    const validation = validateFilters(filterHook.filters)
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors)
      toast({
        title: "Erro de validação",
        description: validation.errors[0],
        variant: "destructive"
      })
      return
    }

    // Resetar para página 1
    paginationHook.goToPage(1)

    // Converter e fazer requisição
    const apiFilters = convertFiltersToApi(
      filterHook.filters,
      1,
      paginationHook.pagination.page_size
    )
    
    const result = await list.loadTransactions(apiFilters)

    // Atualizar paginação
    if (result.success && result.data) {
      paginationHook.updatePagination({
        current_page: result.data.page,
        page_size: result.data.size,
        total_items: result.data.total,
        total_pages: result.data.pages,
        has_next: result.data.has_next,
        has_previous: result.data.has_previous
      })
    }
  }, [filterHook.filters, paginationHook, list, toast])

  /**
   * Muda de página mantendo filtros
   */
  const changePage = useCallback(async (page: number) => {
    console.log('📄 Changing page to:', page)

    const apiFilters = convertFiltersToApi(
      filterHook.filters,
      page,
      paginationHook.pagination.page_size
    )
    
    const result = await list.loadTransactions(apiFilters)

    if (result.success && result.data) {
      paginationHook.updatePagination({
        current_page: result.data.page,
        page_size: result.data.size,
        total_items: result.data.total,
        total_pages: result.data.pages,
        has_next: result.data.has_next,
        has_previous: result.data.has_previous
      })
    }
  }, [filterHook.filters, paginationHook.pagination.page_size, list, paginationHook])

  /**
   * Limpa filtros e recarrega
   */
  const clearFilters = useCallback(async () => {
    console.log('🗑️ Clearing filters and reloading...')
    
    filterHook.clearFilters()
    paginationHook.resetPagination()

    const apiFilters = createDefaultFilters()
    const result = await list.loadTransactions(apiFilters)

    if (result.success && result.data) {
      paginationHook.updatePagination({
        current_page: result.data.page,
        page_size: result.data.size,
        total_items: result.data.total,
        total_pages: result.data.pages,
        has_next: result.data.has_next,
        has_previous: result.data.has_previous
      })
    }
  }, [filterHook, paginationHook, list])

  /**
   * Atualiza página atual
   */
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing current page...')
    
    const apiFilters = convertFiltersToApi(
      filterHook.filters,
      paginationHook.pagination.current_page,
      paginationHook.pagination.page_size
    )
    
    const result = await list.loadTransactions(apiFilters)

    if (result.success && result.data) {
      paginationHook.updatePagination({
        current_page: result.data.page,
        page_size: result.data.size,
        total_items: result.data.total,
        total_pages: result.data.pages,
        has_next: result.data.has_next,
        has_previous: result.data.has_previous
      })
    }
  }, [filterHook.filters, paginationHook.pagination, list, paginationHook])

  /**
   * CRUD com refresh automático
   */
  const createTransaction = useCallback(async (data: TransactionCreate) => {
    const result = await crud.createTransaction(data)
    if (result.success) {
      await refresh()
    }
    return result
  }, [crud, refresh])

  const updateTransaction = useCallback(async (id: string, data: TransactionUpdate) => {
    const result = await crud.updateTransaction(id, data)
    if (result.success) {
      await refresh()
    }
    return result
  }, [crud, refresh])

  const deleteTransaction = useCallback(async (id: string) => {
    const result = await crud.deleteTransaction(id)
    if (result.success) {
      await refresh()
    }
    return result
  }, [crud, refresh])

  /**
   * Carregamento inicial
   */
  useEffect(() => {
    console.log('🚀 Initial load')
    const apiFilters = createDefaultFilters()
    list.loadTransactions(apiFilters).then(result => {
      if (result.success && result.data) {
        paginationHook.updatePagination({
          current_page: result.data.page,
          page_size: result.data.size,
          total_items: result.data.total,
          total_pages: result.data.pages,
          has_next: result.data.has_next,
          has_previous: result.data.has_previous
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executar apenas uma vez

  return {
    // Dados
    transactions: list.transactions,
    filters: filterHook.filters,
    pagination: paginationHook.pagination,

    // Loading states
    loading: list.loading || crud.loading,
    error: list.error,

    // Ações de filtros
    updateFilters: filterHook.updateFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters: filterHook.hasActiveFilters,
    activeFiltersCount: filterHook.activeFiltersCount,

    // Ações de paginação
    changePage,
    nextPage: () => changePage(paginationHook.pagination.current_page + 1),
    previousPage: () => changePage(paginationHook.pagination.current_page - 1),

    // CRUD
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Utilidades
    refresh
  }
}









