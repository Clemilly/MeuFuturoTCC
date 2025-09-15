"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Loader2, CheckCircle, Palette } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useGlobalDataContext } from "@/contexts/transaction-context"

interface CategoryCreationModalProps {
  onCategoryCreated: () => void
  transactionType?: "income" | "expense" | ""
}

interface CategoryFormData {
  name: string
  description: string
  color: string
  icon: string
  type: "income" | "expense" | ""
  parent_id?: string
}

const predefinedColors = [
  { name: "Vermelho", value: "#ef4444" },
  { name: "Laranja", value: "#f97316" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Verde", value: "#22c55e" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Cinza", value: "#6b7280" },
]

const predefinedIcons = [
  { name: "Casa", value: "home" },
  { name: "Comida", value: "utensils" },
  { name: "Transporte", value: "car" },
  { name: "Saúde", value: "heart" },
  { name: "Educação", value: "book" },
  { name: "Lazer", value: "gamepad2" },
  { name: "Trabalho", value: "briefcase" },
  { name: "Investimento", value: "trending-up" },
  { name: "Salário", value: "dollar-sign" },
  { name: "Freelance", value: "user" },
]

export function CategoryCreationModal({ onCategoryCreated, transactionType }: CategoryCreationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: "#3b82f6",
    icon: "home",
    type: transactionType || "",
  })
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { toast } = useToast()
  const { triggerRefresh } = useGlobalDataContext()

  // Sync form type with transactionType prop
  useEffect(() => {
    if (transactionType && transactionType !== formData.type) {
      setFormData(prev => ({
        ...prev,
        type: transactionType as "income" | "expense"
      }))
    }
  }, [transactionType])

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {}

    if (!formData.type) {
      newErrors.type = "Tipo da categoria é obrigatório"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Nome da categoria é obrigatório"
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setSuccess(false)
      
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon,
        parent_id: formData.parent_id || undefined
      }

      const response = await apiService.createCategory(categoryData)

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
        description: "Categoria criada com sucesso!"
      })

      // Trigger global refresh
      triggerRefresh()

      // Store category type context in localStorage for filtering
      if (formData.type && response.data?.id) {
        const categoryTypeMap = JSON.parse(localStorage.getItem('categoryTypeMap') || '{}')
        categoryTypeMap[response.data.id] = formData.type
        localStorage.setItem('categoryTypeMap', JSON.stringify(categoryTypeMap))
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        color: "#3b82f6",
        icon: "home",
        type: transactionType || "",
      })
      setErrors({})

      // Close modal and refresh categories
      setTimeout(() => {
        setIsOpen(false)
        onCategoryCreated()
        setSuccess(false)
      }, 1500)

    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive"
      })
      console.error("Error creating category:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const getSuggestedCategories = useCallback(() => {
    // Use the form type if available, otherwise use the transactionType prop
    const currentType = formData.type || transactionType
    
    if (currentType === "income") {
      return [
        { name: "Salário", color: "#22c55e", icon: "dollar-sign" },
        { name: "Freelance", color: "#3b82f6", icon: "user" },
        { name: "Investimento", color: "#a855f7", icon: "trending-up" },
        { name: "Venda", color: "#f97316", icon: "shopping-cart" },
        { name: "Bônus", color: "#06b6d4", icon: "gift" },
        { name: "Comissão", color: "#84cc16", icon: "percent" },
        { name: "Dividendos", color: "#10b981", icon: "trending-up" },
        { name: "Aluguel", color: "#8b5cf6", icon: "home" },
      ]
    } else if (currentType === "expense") {
      return [
        { name: "Alimentação", color: "#ef4444", icon: "utensils" },
        { name: "Transporte", color: "#3b82f6", icon: "car" },
        { name: "Moradia", color: "#6b7280", icon: "home" },
        { name: "Saúde", color: "#ec4899", icon: "heart" },
        { name: "Educação", color: "#a855f7", icon: "book" },
        { name: "Lazer", color: "#eab308", icon: "gamepad2" },
        { name: "Utilidades", color: "#f59e0b", icon: "zap" },
        { name: "Roupas", color: "#8b5cf6", icon: "shirt" },
      ]
    }
    return []
  }, [formData.type, transactionType])

  const suggestedCategories = getSuggestedCategories()
  const currentType = formData.type || transactionType

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2 text-xs"
        >
          <PlusCircle className="h-3 w-3" />
          <span>+ Categoria</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5" />
            <span>Criar Nova Categoria</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Suggested categories */}
          {suggestedCategories.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Sugestões para {currentType === "income" ? "receitas" : "despesas"}:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedCategories.map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        name: suggestion.name,
                        color: suggestion.color,
                        icon: suggestion.icon,
                        type: currentType as "income" | "expense"
                      }))
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: suggestion.color }}
                    />
                    {suggestion.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  {!currentType 
                    ? "Selecione primeiro o tipo de transação para ver sugestões de categoria"
                    : "Nenhuma sugestão disponível para este tipo"
                  }
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category-type">
              Tipo da Categoria{" "}
              <span className="text-red-500" aria-label="campo obrigatório">
                *
              </span>
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-name">
              Nome da Categoria{" "}
              <span className="text-red-500" aria-label="campo obrigatório">
                *
              </span>
            </Label>
            <Input
              id="category-name"
              placeholder="Ex: Supermercado, Salário, etc."
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-500" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Descrição (opcional)</Label>
            <Textarea
              id="category-description"
              placeholder="Descrição da categoria..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-color">Cor</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: formData.color }}
                />
                <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-icon">Ícone</Label>
              <Select value={formData.icon} onValueChange={(value) => handleInputChange("icon", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {predefinedIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Criada!
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Categoria
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
