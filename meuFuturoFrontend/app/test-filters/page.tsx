"use client"

import { useState } from 'react'
import { TransactionsFilters } from '@/components/transactions/transactions-filters'
import { SimpleFiltersTest } from '@/components/test-simple-filters'
import type { FilterState } from '@/hooks/use-transactions'

// Mock categories for testing
const mockCategories = [
  { id: '1', name: 'Alimentação', color: '#FF6B6B', type: 'expense' as const },
  { id: '2', name: 'Transporte', color: '#3b82f6', type: 'expense' as const },
  { id: '3', name: 'Salário', color: '#10b981', type: 'income' as const },
  { id: '4', name: 'Bônus', color: '#a855f7', type: 'income' as const },
]

export default function TestFiltersPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
    dateRange: {
      start: null,
      end: null
    },
    amountRange: {
      min: null,
      max: null
    },
    sortBy: 'transaction_date',
    sortOrder: 'desc'
  })

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    console.log('🔍 DEBUG: Filters changed:', newFilters)
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleClearFilters = () => {
    console.log('🔍 DEBUG: Clearing filters')
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      dateRange: {
        start: null,
        end: null
      },
      amountRange: {
        min: null,
        max: null
      },
      sortBy: 'transaction_date',
      sortOrder: 'desc'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Teste de Filtros</h1>
          <p className="text-muted-foreground mb-6">
            Esta página testa os filtros sem necessidade de autenticação
          </p>
        </div>

        {/* Simple test component */}
        <SimpleFiltersTest />

        {/* Filters */}
        <TransactionsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          loading={false}
          categories={mockCategories}
        />

        {/* Debug Info */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Estado dos Filtros:</h3>
          <pre className="text-sm bg-background p-4 rounded border overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Instruções de Teste:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Digite algo no campo de busca</li>
            <li>2. Mude o tipo de transação (Receitas/Despesas)</li>
            <li>3. Selecione uma categoria (expandir "Filtros avançados")</li>
            <li>4. Configure um período de data</li>
            <li>5. Configure um valor</li>
            <li>6. Verifique se as mudanças aparecem no "Estado dos Filtros"</li>
            <li>7. Verifique o console do navegador para logs de debug</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
