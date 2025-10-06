/**
 * Validadores para filtros e transações
 */

import type { FilterState } from '@/hooks/transactions/use-transactions-filters'
import type { TransactionCreate, TransactionUpdate } from '@/lib/types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Valida filtros antes de enviar para API
 */
export function validateFilters(filters: FilterState): ValidationResult {
  const errors: string[] = []

  // Validar range de valores
  if (filters.amountRange.min !== null && filters.amountRange.max !== null) {
    if (filters.amountRange.min > filters.amountRange.max) {
      errors.push('Valor mínimo não pode ser maior que o máximo')
    }
    if (filters.amountRange.min < 0) {
      errors.push('Valor mínimo não pode ser negativo')
    }
  }

  // Validar range de datas
  if (filters.dateRange.start && filters.dateRange.end) {
    if (filters.dateRange.start > filters.dateRange.end) {
      errors.push('Data inicial não pode ser posterior à data final')
    }
  }

  // Validar busca
  if (filters.search && filters.search.trim().length > 0 && filters.search.trim().length < 2) {
    errors.push('Busca deve ter no mínimo 2 caracteres')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida dados de criação de transação
 */
export function validateTransactionCreate(data: TransactionCreate): ValidationResult {
  const errors: string[] = []

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Descrição é obrigatória')
  }

  if (data.amount <= 0) {
    errors.push('Valor deve ser maior que zero')
  }

  if (!data.transaction_date) {
    errors.push('Data é obrigatória')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida dados de atualização de transação
 */
export function validateTransactionUpdate(data: TransactionUpdate): ValidationResult {
  const errors: string[] = []

  if (data.description !== undefined && data.description.trim().length === 0) {
    errors.push('Descrição não pode ser vazia')
  }

  if (data.amount !== undefined && data.amount <= 0) {
    errors.push('Valor deve ser maior que zero')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}





