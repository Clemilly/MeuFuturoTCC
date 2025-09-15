"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Search, Filter, Edit, Trash2, Loader2, AlertCircle } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useGlobalDataContext } from "@/contexts/transaction-context"
import { TransactionListSkeleton } from "./transaction-list-skeleton"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  transaction_date: string
  category?: {
    id: string
    name: string
    color: string
  }
  notes?: string
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  color: string
  type?: "income" | "expense"
}

interface PaginationInfo {
  current_page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  next_page?: number
  previous_page?: number
}

interface BackendResponse {
  success: boolean
  data: {
    transactions: Transaction[]
    pagination: PaginationInfo
    totals: {
      income: number
      expenses: number
      net_amount: number
    }
    statistics: {
      total_transactions: number
      filtered_transactions: number
      total_income: number
      total_expenses: number
      net_amount: number
      average_transaction: number
    }
    filters_applied: {
      transaction_type?: string
      category_id?: string
      search?: string
      start_date?: string
      end_date?: string
      min_amount?: number
      max_amount?: number
    }
    available_categories: Category[]
    sorting: {
      sort_by: string
      sort_order: string
    }
    metadata: {
      generated_at: string
      api_version: string
      user_id: string
    }
  }
}

export function TransactionList() {
  // Filter states - these are sent to backend
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState("all")
  
  // Data states - these come from backend
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false
  })
  const [totals, setTotals] = useState({
    income: 0,
    expenses: 0,
    net_amount: 0
  })
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(true)
  
  const { toast } = useToast()
  const { refreshTrigger } = useGlobalDataContext()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false)
    }
  }, [])

  // Load transactions from backend with current filters
  const loadTransactions = useCallback(async () => {
    if (!isMounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Prepare filters for backend
      const filters: any = {
        page: pagination.current_page,
        size: pagination.page_size,
        sort_by: "transaction_date",
        sort_order: "desc"
      }
      
      // Add filters only if they have meaningful values
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim()
      }
      if (filterType !== "all") {
        filters.transaction_type = filterType
      }
      if (filterCategory !== "all") {
        filters.category_id = filterCategory
      }
      
      console.log('Sending filters to backend:', filters)
      
      const response = await apiService.getTransactions(filters)
      
      if (!isMounted) return
      
      if (response.error) {
        console.error('Backend error:', response.error)
        setError(response.error)
        setLoading(false)
        return
      }
      
      if (response.data && typeof response.data === 'object') {
        // Adapt the original endpoint response to our expected format
        const data = response.data as any
        
        if (data.items) {
          // Original endpoint format
          const transactions = data.items || []
          const total = data.total || 0
          const page = data.page || 1
          const size = data.size || 10
          const pages = data.pages || 0
          const has_next = data.has_next || false
          const has_previous = data.has_previous || false
          
          // Calculate totals from transactions
          const totalIncome = transactions
            .filter((t: Transaction) => t.type === 'income')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
          
          const totalExpenses = transactions
            .filter((t: Transaction) => t.type === 'expense')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
          
          // Set data
          setTransactions(transactions)
          setPagination({
            current_page: page,
            page_size: size,
            total_items: total,
            total_pages: pages,
            has_next: has_next,
            has_previous: has_previous,
            next_page: has_next ? page + 1 : undefined,
            previous_page: has_previous ? page - 1 : undefined
          })
          setTotals({
            income: totalIncome,
            expenses: totalExpenses,
            net_amount: totalIncome - totalExpenses
          })
          
          console.log('Data loaded from backend:', {
            transactions: transactions.length,
            pagination: { page, size, total, pages, has_next, has_previous },
            totals: { income: totalIncome, expenses: totalExpenses, net_amount: totalIncome - totalExpenses }
          })
        } else {
          console.error('Invalid response format:', data)
          setError('Formato de resposta inválido')
        }
      } else {
        console.error('Invalid response format:', response)
        setError('Formato de resposta inválido')
      }
    } catch (err) {
      console.error("Error loading transactions:", err)
      setError('Erro ao conectar com o servidor')
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [isMounted, pagination.current_page, pagination.page_size, searchTerm, filterType, filterCategory])

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!isMounted) return
    
    try {
      const response = await apiService.getCategories()
      
      if (!isMounted) return
      
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        // Set default categories if no data
        setCategories([
          // Expense categories
          { id: "1", name: "Alimentação", color: "#ef4444", type: "expense" },
          { id: "2", name: "Transporte", color: "#3b82f6", type: "expense" },
          { id: "3", name: "Moradia", color: "#6b7280", type: "expense" },
          { id: "4", name: "Saúde", color: "#ec4899", type: "expense" },
          { id: "5", name: "Educação", color: "#a855f7", type: "expense" },
          { id: "6", name: "Lazer", color: "#eab308", type: "expense" },
          { id: "7", name: "Utilidades", color: "#f59e0b", type: "expense" },
          { id: "8", name: "Roupas", color: "#8b5cf6", type: "expense" },
          // Income categories
          { id: "9", name: "Salário", color: "#22c55e", type: "income" },
          { id: "10", name: "Freelance", color: "#f97316", type: "income" },
          { id: "11", name: "Investimento", color: "#8b5cf6", type: "income" },
          { id: "12", name: "Venda", color: "#10b981", type: "income" },
          { id: "13", name: "Bônus", color: "#06b6d4", type: "income" },
          { id: "14", name: "Comissão", color: "#84cc16", type: "income" },
          // General categories
          { id: "15", name: "Outros", color: "#6b7280" }
        ])
      }
    } catch (err) {
      console.error("Error loading categories:", err)
      // Set default categories on error
      setCategories([
        { id: "1", name: "Alimentação", color: "#ef4444", type: "expense" },
        { id: "2", name: "Transporte", color: "#3b82f6", type: "expense" },
        { id: "3", name: "Moradia", color: "#6b7280", type: "expense" },
        { id: "4", name: "Saúde", color: "#ec4899", type: "expense" },
        { id: "5", name: "Educação", color: "#a855f7", type: "expense" },
        { id: "6", name: "Lazer", color: "#eab308", type: "expense" },
        { id: "7", name: "Utilidades", color: "#f59e0b", type: "expense" },
        { id: "8", name: "Roupas", color: "#8b5cf6", type: "expense" },
        { id: "9", name: "Salário", color: "#22c55e", type: "income" },
        { id: "10", name: "Freelance", color: "#f97316", type: "income" },
        { id: "11", name: "Investimento", color: "#8b5cf6", type: "income" },
        { id: "12", name: "Venda", color: "#10b981", type: "income" },
        { id: "13", name: "Bônus", color: "#06b6d4", type: "income" },
        { id: "14", name: "Comissão", color: "#84cc16", type: "income" },
        { id: "15", name: "Outros", color: "#6b7280" }
      ])
    }
  }, [isMounted])

  // Load data when component mounts or filters change
  useEffect(() => {
    if (isMounted) {
      loadTransactions()
      loadCategories()
    }
  }, [loadTransactions, loadCategories])

  // Listen for global data changes (when transactions are added/updated/deleted)
  useEffect(() => {
    if (isMounted) {
      loadTransactions()
    }
  }, [refreshTrigger, loadTransactions])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setPagination(prev => ({ ...prev, current_page: 1 })) // Reset to first page when searching
        // loadTransactions will be called by useEffect
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    setPagination(prev => ({ ...prev, current_page: 1 })) // Reset to first page when filters change
    // loadTransactions will be called by useEffect
  }, [])

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, current_page: newPage }))
    // loadTransactions will be called by useEffect
  }

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) {
      return
    }
    
    try {
      setDeletingId(id)
      const response = await apiService.deleteTransaction(id)
      
      if (response.error) {
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive"
        })
        return
      }
      
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso"
      })
      
      // Force refresh by resetting pagination and reloading
      setPagination(prev => ({ ...prev, current_page: 1 }))
      await loadTransactions()
      
      // Global refresh will be triggered by useEffect watching refreshTrigger
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação",
        variant: "destructive"
      })
      console.error("Error deleting transaction:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return <TransactionListSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar transações</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadTransactions} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Buscar transações por descrição ou observações"
              />
            </div>

            <Select value={filterType} onValueChange={(value: any) => {
              setFilterType(value)
              handleFilterChange()
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as transações</SelectItem>
                <SelectItem value="income">Apenas receitas</SelectItem>
                <SelectItem value="expense">Apenas despesas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={(value) => {
              setFilterCategory(value)
              handleFilterChange()
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Total Receitas:</span>
              <span className="font-semibold text-green-600">{formatCurrency(totals.income)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Total Despesas:</span>
              <span className="font-semibold text-red-600">{formatCurrency(totals.expenses)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">
                {searchTerm || filterType !== "all" || filterCategory !== "all" 
                  ? "Tente ajustar os filtros ou limpar a busca" 
                  : "Adicione sua primeira transação usando o formulário ao lado"}
              </p>
            </div>
          ) : (
            <>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-medium">{transaction.description}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ backgroundColor: transaction.category?.color + '20' }}
                        >
                          {transaction.category?.name || "Sem categoria"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatDate(transaction.transaction_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>

                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        aria-label={`Editar transação ${transaction.description}`}
                        disabled
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        aria-label={`Excluir transação ${transaction.description}`}
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        disabled={deletingId === transaction.id}
                      >
                        {deletingId === transaction.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((pagination.current_page - 1) * pagination.page_size) + 1} a {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} de {pagination.total_items} transações
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.previous_page || 1)}
                      disabled={!pagination.has_previous}
                    >
                      Anterior
                    </Button>
                    
                    <span className="flex items-center px-3 py-1 text-sm">
                      Página {pagination.current_page} de {pagination.total_pages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.next_page || pagination.total_pages)}
                      disabled={!pagination.has_next}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}