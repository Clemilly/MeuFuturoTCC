/**
 * Basic integration tests for the new transactions page
 * Tests the main functionality and component integration
 */

import { render, screen, waitFor } from '@testing-library/react'
import { TransactionsPage } from '@/components/transactions/transactions-page'
import { useTransactions } from '@/hooks/use-transactions'

// Mock the hook
jest.mock('@/hooks/use-transactions')
const mockUseTransactions = useTransactions as jest.MockedFunction<typeof useTransactions>

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    getTransactions: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    getCategories: jest.fn()
  }
}))

describe('TransactionsPage', () => {
  const mockTransactions = [
    {
      id: '1',
      type: 'income' as const,
      amount: 1000,
      description: 'Salário',
      transaction_date: '2024-01-15',
      notes: 'Salário mensal',
      category: {
        id: '1',
        name: 'Salário',
        color: '#10b981',
        type: 'income' as const
      },
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      type: 'expense' as const,
      amount: 50,
      description: 'Almoço',
      transaction_date: '2024-01-15',
      notes: 'Almoço no restaurante',
      category: {
        id: '2',
        name: 'Alimentação',
        color: '#ef4444',
        type: 'expense' as const
      },
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T12:00:00Z'
    }
  ]

  const mockCategories = [
    {
      id: '1',
      name: 'Salário',
      color: '#10b981',
      type: 'income' as const,
      is_system: false,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Alimentação',
      color: '#ef4444',
      type: 'expense' as const,
      is_system: false,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  const mockPagination = {
    current_page: 1,
    page_size: 20,
    total_items: 2,
    total_pages: 1,
    has_next: false,
    has_previous: false
  }

  const mockStats = {
    total_income: 1000,
    total_expenses: 50,
    net_amount: 950,
    transaction_count: 2,
    average_transaction: 525
  }

  const mockFilters = {
    search: '',
    type: 'all' as const,
    category: 'all',
    dateRange: {
      start: null,
      end: null
    },
    amountRange: {
      min: null,
      max: null
    },
    sortBy: 'transaction_date' as const,
    sortOrder: 'desc' as const
  }

  const mockModals = {
    isCreateOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    isDetailsOpen: false,
    selectedTransaction: null
  }

  const mockLoading = {
    transactions: false,
    categories: false,
    saving: false,
    deleting: false,
    stats: false
  }

  const mockError = {
    message: null,
    type: 'unknown' as const,
    retryable: false
  }

  const defaultMockReturn = {
    transactions: mockTransactions,
    categories: mockCategories,
    pagination: mockPagination,
    stats: mockStats,
    filters: mockFilters,
    modals: mockModals,
    loading: mockLoading,
    error: mockError,
    isOnline: true,
    hasActiveFilters: false,
    activeFiltersCount: 0,
    updateFilters: jest.fn(),
    clearFilters: jest.fn(),
    resetFilters: jest.fn(),
    openCreateModal: jest.fn(),
    openEditModal: jest.fn(),
    openDeleteModal: jest.fn(),
    openDetailsModal: jest.fn(),
    closeAllModals: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    duplicateTransaction: jest.fn(),
    refresh: jest.fn()
  }

  beforeEach(() => {
    mockUseTransactions.mockReturnValue(defaultMockReturn)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the transactions page with header, filters, and list', async () => {
    render(<TransactionsPage />)

    // Check if main elements are rendered
    expect(screen.getByText('Transações')).toBeInTheDocument()
    expect(screen.getByText('Nova Transação')).toBeInTheDocument()
    expect(screen.getByText('Buscar transações...')).toBeInTheDocument()
    expect(screen.getByText('Salário')).toBeInTheDocument()
    expect(screen.getByText('Almoço')).toBeInTheDocument()
  })

  it('displays transaction statistics correctly', async () => {
    render(<TransactionsPage />)

    // Check if stats are displayed
    expect(screen.getByText('Total Receitas')).toBeInTheDocument()
    expect(screen.getByText('Total Despesas')).toBeInTheDocument()
    expect(screen.getByText('Saldo Líquido')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 950,00')).toBeInTheDocument()
  })

  it('shows loading state when transactions are loading', async () => {
    mockUseTransactions.mockReturnValue({
      ...defaultMockReturn,
      loading: {
        ...mockLoading,
        transactions: true
      }
    })

    render(<TransactionsPage />)

    // Check if loading state is shown
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows error state when there is an error', async () => {
    mockUseTransactions.mockReturnValue({
      ...defaultMockReturn,
      error: {
        message: 'Erro ao carregar transações',
        type: 'network',
        retryable: true
      }
    })

    render(<TransactionsPage />)

    // Check if error state is shown
    expect(screen.getByText('Erro ao carregar transações')).toBeInTheDocument()
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('shows empty state when no transactions are found', async () => {
    mockUseTransactions.mockReturnValue({
      ...defaultMockReturn,
      transactions: []
    })

    render(<TransactionsPage />)

    // Check if empty state is shown
    expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument()
  })

  it('displays pagination when there are multiple pages', async () => {
    mockUseTransactions.mockReturnValue({
      ...defaultMockReturn,
      pagination: {
        ...mockPagination,
        total_pages: 3,
        has_next: true
      }
    })

    render(<TransactionsPage />)

    // Check if pagination is shown
    expect(screen.getByText('Mostrando 1 a 2 de 2 transações')).toBeInTheDocument()
  })

  it('handles filter changes correctly', async () => {
    const mockUpdateFilters = jest.fn()
    mockUseTransactions.mockReturnValue({
      ...defaultMockReturn,
      updateFilters: mockUpdateFilters
    })

    render(<TransactionsPage />)

    // Check if filters are rendered
    expect(screen.getByText('Buscar transações...')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
  })

  it('handles modal operations correctly', async () => {
    const mockOpenCreateModal = jest.fn()
    mockUseTransactions.mockReturnValue({
      ...defaultMockReturn,
      openCreateModal: mockOpenCreateModal
    })

    render(<TransactionsPage />)

    // Click on create button
    const createButton = screen.getByText('Nova Transação')
    createButton.click()

    expect(mockOpenCreateModal).toHaveBeenCalled()
  })
})

