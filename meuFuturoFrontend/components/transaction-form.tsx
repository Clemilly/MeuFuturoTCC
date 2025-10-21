"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MaterialIcon } from "@/lib/material-icons"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CategoryCreationModal } from "@/components/category-creation-modal"
import { useGlobalDataContext } from "@/contexts/transaction-context"
import { useAuth } from "@/contexts/auth-context"

interface TransactionFormData {
  type: "income" | "expense" | ""
  amount: string
  description: string
  category_id: string
  transaction_date: string
  notes: string
}

interface Category {
  id: string
  name: string
  color?: string
  icon?: string
  type?: "income" | "expense"
  is_system?: boolean
  is_active?: boolean
}

export function TransactionForm() {
  const { isAuthenticated, user } = useAuth()
  
  const [formData, setFormData] = useState<TransactionFormData>({
    type: "",
    amount: "",
    description: "",
    category_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [errors, setErrors] = useState<Partial<TransactionFormData>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { toast } = useToast()
  const { triggerRefresh } = useGlobalDataContext()

  // Load categories on component mount
  const loadCategories = useCallback(async () => {
    try {
      console.log("Loading categories...")
      const response = await apiService.getCategories()
      console.log("Categories response:", response)
      
      if (response.error) {
        console.error("Error loading categories:", response.error)
        // Set some default categories if API fails
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
        return
      }
      
      if (response.data) {
        console.log("Categories loaded:", response.data.length, "categories")
        setCategories(response.data)
      } else {
        console.log("No categories data received")
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
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Filter categories by transaction type
  const filteredCategories = categories.filter(category => {
    // If no type is selected, show all categories
    if (!formData.type) {
      return true
    }
    
    // Filter by category type if available
    if (category.type) {
      return category.type === formData.type
    }
    
    // For user-created categories, check stored type context
    if (!category.is_system) {
      const categoryTypeMap = JSON.parse(localStorage.getItem('categoryTypeMap') || '{}')
      const storedType = categoryTypeMap[category.id]
      
      if (storedType) {
        return storedType === formData.type
      }
      
      // Fallback: infer type from name patterns for user-created categories
      if (formData.type === "income") {
        return category.name.toLowerCase().includes("salário") || 
               category.name.toLowerCase().includes("freelance") ||
               category.name.toLowerCase().includes("investimento") ||
               category.name.toLowerCase().includes("venda") ||
               category.name.toLowerCase().includes("receita") ||
               category.name.toLowerCase().includes("renda") ||
               category.name.toLowerCase().includes("bonus") ||
               category.name.toLowerCase().includes("comissão") ||
               category.name.toLowerCase().includes("bônus") ||
               category.name.toLowerCase().includes("dividendos") ||
               category.name.toLowerCase().includes("aluguel") ||
               category.name.toLowerCase().includes("vendas") ||
               category.name.toLowerCase().includes("trabalho") ||
               category.name.toLowerCase().includes("emprego")
      } else if (formData.type === "expense") {
        return category.name.toLowerCase().includes("alimentação") ||
               category.name.toLowerCase().includes("transporte") ||
               category.name.toLowerCase().includes("moradia") ||
               category.name.toLowerCase().includes("saúde") ||
               category.name.toLowerCase().includes("educação") ||
               category.name.toLowerCase().includes("lazer") ||
               category.name.toLowerCase().includes("utilidade") ||
               category.name.toLowerCase().includes("despesa") ||
               category.name.toLowerCase().includes("gasto") ||
               category.name.toLowerCase().includes("conta") ||
               category.name.toLowerCase().includes("roupas") ||
               category.name.toLowerCase().includes("compras") ||
               category.name.toLowerCase().includes("serviços") ||
               category.name.toLowerCase().includes("manutenção")
      }
    }
    
    // Fallback: filter by category name patterns for system categories
    if (formData.type === "income") {
      return category.name.toLowerCase().includes("salário") || 
             category.name.toLowerCase().includes("freelance") ||
             category.name.toLowerCase().includes("investimento") ||
             category.name.toLowerCase().includes("venda") ||
             category.name.toLowerCase().includes("receita") ||
             category.name.toLowerCase().includes("renda") ||
             category.name.toLowerCase().includes("bonus") ||
             category.name.toLowerCase().includes("comissão")
    } else if (formData.type === "expense") {
      return category.name.toLowerCase().includes("alimentação") ||
             category.name.toLowerCase().includes("transporte") ||
             category.name.toLowerCase().includes("moradia") ||
             category.name.toLowerCase().includes("saúde") ||
             category.name.toLowerCase().includes("educação") ||
             category.name.toLowerCase().includes("lazer") ||
             category.name.toLowerCase().includes("utilidade") ||
             category.name.toLowerCase().includes("despesa") ||
             category.name.toLowerCase().includes("gasto") ||
             category.name.toLowerCase().includes("conta")
    }
    
    return true
  })

  const validateForm = (): boolean => {
    const newErrors: Partial<TransactionFormData> = {}

    if (!formData.type) {
      newErrors.type = "Selecione o tipo de transação"
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Insira um valor válido maior que zero"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }

    if (!formData.category_id) {
      newErrors.category_id = "Selecione uma categoria"
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = "Data é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para criar transações.",
        variant: "destructive"
      })
      return
    }


    try {
      setLoading(true)
      setSuccess(false)
      
      const transactionData = {
        type: formData.type as "income" | "expense",
        amount: Number.parseFloat(formData.amount),
        description: formData.description.trim(),
        transaction_date: formData.transaction_date,
        notes: formData.notes.trim() || null,
        category_id: formData.category_id || null
      }

      const response = await apiService.createTransaction(transactionData)

      if (response.error) {
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive"
        })
        return
      }

      // Success
      setSuccess(true)
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!"
      })

      // Trigger refresh of transaction list
      triggerRefresh()

      // Reset form
      setFormData({
        type: "",
        amount: "",
        description: "",
        category_id: "",
        transaction_date: new Date().toISOString().split("T")[0],
        notes: "",
      })
      setErrors({})

      // Reset success state after 2 seconds
      setTimeout(() => setSuccess(false), 2000)

    } catch (err) {
      console.error("❌ Error creating transaction:", err)
      
      let errorMessage = "Erro ao adicionar transação"
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = "Erro de conexão com o servidor. Verifique se o backend está rodando."
        } else if (err.message.includes('NetworkError')) {
          errorMessage = "Erro de rede. Verifique sua conexão."
        } else {
          errorMessage = err.message
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Reset category when type changes
    if (field === "type") {
      setFormData((prev) => ({ ...prev, category_id: "" }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MaterialIcon name="plus-circle" size={20} aria-hidden="true" />
          <span>Nova Transação</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="transaction-type">
              Tipo de Transação{" "}
              <span className="text-red-500" aria-label="campo obrigatório">
                *
              </span>
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger
                id="transaction-type"
                className={errors.type ? "border-red-500" : ""}
                aria-describedby={errors.type ? "type-error" : undefined}
              >
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p id="type-error" className="text-sm text-red-500" role="alert">
                {errors.type}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Valor{" "}
              <span className="text-red-500" aria-label="campo obrigatório">
                *
              </span>
            </Label>
            <div className="relative">
              <MaterialIcon name="dollar-sign" size={16} className="absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className={`pl-10 ${errors.amount ? "border-red-500" : ""}`}
                aria-describedby={errors.amount ? "amount-error" : undefined}
              />
            </div>
            {errors.amount && (
              <p id="amount-error" className="text-sm text-red-500" role="alert">
                {errors.amount}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição{" "}
              <span className="text-red-500" aria-label="campo obrigatório">
                *
              </span>
            </Label>
            <Input
              id="description"
              placeholder="Ex: Compra no supermercado"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-500" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">
                Categoria{" "}
                <span className="text-red-500" aria-label="campo obrigatório">
                  *
                </span>
              </Label>
            </div>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleInputChange("category_id", value)}
              disabled={!formData.type}
            >
              <SelectTrigger
                id="category"
                className={errors.category_id ? "border-red-500" : ""}
                aria-describedby={errors.category_id ? "category-error" : undefined}
              >
                <SelectValue placeholder={!formData.type ? "Selecione primeiro o tipo" : "Selecione a categoria"} />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      {category.color && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span>{category.name}</span>
                      {category.type && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          category.type === "income" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {category.type === "income" ? "Receita" : "Despesa"}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p id="category-error" className="text-sm text-red-500" role="alert">
                {errors.category_id}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">
              Data{" "}
              <span className="text-red-500" aria-label="campo obrigatório">
                *
              </span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => handleInputChange("transaction_date", e.target.value)}
              className={errors.transaction_date ? "border-red-500" : ""}
              aria-describedby={errors.transaction_date ? "date-error" : undefined}
            />
            {errors.transaction_date && (
              <p id="date-error" className="text-sm text-red-500" role="alert">
                {errors.transaction_date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre a transação"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <MaterialIcon name="loading" size={16} className="mr-2 animate-spin" aria-hidden="true" />
                Adicionando...
              </>
            ) : success ? (
              <>
                <MaterialIcon name="check-circle" size={16} className="mr-2" aria-hidden="true" />
                Adicionado!
              </>
            ) : (
              <>
                <MaterialIcon name="plus-circle" size={16} className="mr-2" aria-hidden="true" />
                Adicionar Transação
              </>
            )}
          </Button>
        </form>
        
        {/* Category Creation Modal - Outside the form to prevent form submission */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Não encontrou a categoria que precisa?
            </span>
            <CategoryCreationModal 
              onCategoryCreated={loadCategories}
              transactionType={formData.type}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
