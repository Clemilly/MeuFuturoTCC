/**
 * Hook responsável APENAS por gerenciar paginação
 * NÃO faz: requisições, filtros
 */

import { useState, useCallback } from 'react'
import type { PaginationInfo } from '@/lib/types'

const initialState: PaginationInfo = {
  current_page: 1,
  page_size: 20,
  total_items: 0,
  total_pages: 0,
  has_next: false,
  has_previous: false
}

export function useTransactionsPagination() {
  const [pagination, setPagination] = useState<PaginationInfo>(initialState)

  const updatePagination = useCallback((newPagination: Partial<PaginationInfo>) => {
    console.log('📄 Updating pagination:', newPagination)
    setPagination(prev => ({ ...prev, ...newPagination }))
  }, [])

  const goToPage = useCallback((page: number) => {
    console.log('📄 Going to page:', page)
    setPagination(prev => ({ ...prev, current_page: page }))
    return page
  }, [])

  const nextPage = useCallback(() => {
    if (pagination.has_next) {
      const nextPageNum = pagination.current_page + 1
      goToPage(nextPageNum)
      return nextPageNum
    }
    return pagination.current_page
  }, [pagination.has_next, pagination.current_page, goToPage])

  const previousPage = useCallback(() => {
    if (pagination.has_previous) {
      const prevPageNum = pagination.current_page - 1
      goToPage(prevPageNum)
      return prevPageNum
    }
    return pagination.current_page
  }, [pagination.has_previous, pagination.current_page, goToPage])

  const resetPagination = useCallback(() => {
    console.log('🔄 Resetting pagination')
    setPagination(initialState)
  }, [])

  return {
    pagination,
    updatePagination,
    goToPage,
    nextPage,
    previousPage,
    resetPagination
  }
}


