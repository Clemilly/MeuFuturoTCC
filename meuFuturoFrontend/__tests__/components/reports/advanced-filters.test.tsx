import { render, screen, fireEvent } from '@testing-library/react'
import { AdvancedFilters } from '@/components/reports/advanced-filters'
import type { ReportFilters } from '@/lib/types'

const mockCategories = [
  { id: '1', name: 'Alimentação', type: 'expense' },
  { id: '2', name: 'Transporte', type: 'expense' },
  { id: '3', name: 'Salário', type: 'income' }
]

const mockFilters: ReportFilters = {
  granularity: 'monthly'
}

const mockOnFiltersChange = jest.fn()

describe('AdvancedFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders collapsed by default', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        loadingCategories={false}
      />
    )

    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
    expect(screen.getByText('Expandir')).toBeInTheDocument()
    expect(screen.queryByLabelText('Data de Início')).not.toBeInTheDocument()
  })

  it('expands when expand button is clicked', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        loadingCategories={false}
      />
    )

    fireEvent.click(screen.getByText('Expandir'))

    expect(screen.getByText('Recolher')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de Início')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de Fim')).toBeInTheDocument()
    expect(screen.getByLabelText('Granularidade')).toBeInTheDocument()
  })

  it('calls onFiltersChange when date inputs change', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        loadingCategories={false}
      />
    )

    fireEvent.click(screen.getByText('Expandir'))

    const startDateInput = screen.getByLabelText('Data de Início')
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      start_date: '2024-01-01'
    })
  })

  it('calls onFiltersChange when granularity changes', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        loadingCategories={false}
      />
    )

    fireEvent.click(screen.getByText('Expandir'))

    const granularitySelect = screen.getByLabelText('Granularidade')
    fireEvent.click(granularitySelect)
    fireEvent.click(screen.getByText('Semanal'))

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      granularity: 'weekly'
    })
  })

  it('shows clear button when filters are active', () => {
    const filtersWithData: ReportFilters = {
      ...mockFilters,
      start_date: '2024-01-01',
      transaction_type: 'income'
    }

    render(
      <AdvancedFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        loadingCategories={false}
      />
    )

    expect(screen.getByText('Limpar')).toBeInTheDocument()
  })

  it('clears filters when clear button is clicked', () => {
    const filtersWithData: ReportFilters = {
      ...mockFilters,
      start_date: '2024-01-01',
      transaction_type: 'income'
    }

    render(
      <AdvancedFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        loadingCategories={false}
      />
    )

    fireEvent.click(screen.getByText('Limpar'))

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      granularity: 'monthly'
    })
  })

  it('shows active filters summary when expanded', () => {
    const filtersWithData: ReportFilters = {
      ...mockFilters,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      transaction_type: 'income',
      min_amount: 100
    }

    render(
      <AdvancedFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        loadingCategories={false}
      />
    )

    fireEvent.click(screen.getByText('Expandir'))

    expect(screen.getByText('Filtros Ativos:')).toBeInTheDocument()
    expect(screen.getByText(/Desde:/)).toBeInTheDocument()
    expect(screen.getByText(/Até:/)).toBeInTheDocument()
    expect(screen.getByText(/Tipo: Receitas/)).toBeInTheDocument()
    expect(screen.getByText(/Min: R\$ 100,00/)).toBeInTheDocument()
  })

  it('disables category select when loading', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        loadingCategories={true}
      />
    )

    fireEvent.click(screen.getByText('Expandir'))

    const categorySelect = screen.getByLabelText('Categorias')
    expect(categorySelect).toBeDisabled()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })
})

