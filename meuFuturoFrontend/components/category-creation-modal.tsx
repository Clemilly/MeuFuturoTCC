"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MaterialIcon } from "@/lib/material-icons"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useOperationToast } from "@/hooks/use-operation-toast"
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
  })
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { toast } = useToast()
  const { showToastFromResponse } = useOperationToast()
  const { triggerRefresh } = useGlobalDataContext()

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {}

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
        // Mostrar toast de erro usando useOperationToast
        showToastFromResponse(response, {
          message: response.error,
        })
        return
      }

      // Success
      setSuccess(true)
      
      // Mostrar toast de sucesso usando useOperationToast
      showToastFromResponse(response, {
        message: "Categoria criada com sucesso! Os dados foram atualizados automaticamente.",
      })

      // Trigger global refresh
      triggerRefresh()


      // Reset form
      setFormData({
        name: "",
        description: "",
        color: "#3b82f6",
        icon: "home",
      })
      setErrors({})

      // Close modal and refresh categories
      // Chamar callback para atualizar categorias no componente pai
      setTimeout(() => {
        setIsOpen(false)
        onCategoryCreated()
        setSuccess(false)
      }, 1500)

    } catch (err) {
      console.error("Error creating category:", err)
      showToastFromResponse(
        { error: "Erro ao criar categoria. Tente novamente." },
        {
          message: "Erro ao criar categoria. Tente novamente.",
        }
      )
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
    // Mostrar sugestões gerais de categorias
    return [
      { name: "Alimentação", color: "#ef4444", icon: "utensils" },
      { name: "Transporte", color: "#3b82f6", icon: "car" },
      { name: "Moradia", color: "#6b7280", icon: "home" },
      { name: "Saúde", color: "#ec4899", icon: "heart" },
      { name: "Educação", color: "#a855f7", icon: "book" },
      { name: "Lazer", color: "#eab308", icon: "gamepad2" },
      { name: "Salário", color: "#22c55e", icon: "dollar-sign" },
      { name: "Freelance", color: "#3b82f6", icon: "user" },
    ]
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2 text-xs"
        >
          <MaterialIcon name="plus-circle" size={12} tooltip="Criar nova categoria" />
          <span>+ Categoria</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MaterialIcon name="plus-circle" size={20} tooltip="Nova categoria" />
            <span>Criar Nova Categoria</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Suggested categories */}
          {getSuggestedCategories().length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Sugestões de categorias:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {getSuggestedCategories().map((suggestion, index) => (
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
          )}

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
                  <MaterialIcon name="loading" size={16} className="mr-2 animate-spin" tooltip="Processando..." aria-hidden={true} />
                  Criando...
                </>
              ) : success ? (
                <>
                  <MaterialIcon name="check-circle" size={16} className="mr-2" tooltip="Categoria criada" aria-hidden={true} />
                  Criada!
                </>
              ) : (
                <>
                  <MaterialIcon name="plus-circle" size={16} className="mr-2" tooltip="Criar categoria" aria-hidden={true} />
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
