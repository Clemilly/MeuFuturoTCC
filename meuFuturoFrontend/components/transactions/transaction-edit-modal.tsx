/**
 * Transaction edit modal component
 * Modern design with comprehensive form validation
 */

"use client"

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Tag, FileText, Save, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTransactions } from '@/hooks/use-transactions'
import { useToast } from '@/hooks/use-toast'
import type { Transaction, TransactionUpdate, Category } from '@/lib/types'

interface TransactionEditModalProps {
  isOpen: boolean
  transaction: Transaction | null
  onClose: () => void
  onSuccess: () => void
}

export function TransactionEditModal({
  isOpen,
  transaction,
  onClose,
  onSuccess
}: TransactionEditModalProps) {
  const [formData, setFormData] = useState<TransactionUpdate>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { updateTransaction } = useTransactions()
  const { toast } = useToast()

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: transaction.transaction_date,
        notes: transaction.notes || '',
        category_id: transaction.category?.id || ''
      })
      setErrors({})
    }
  }, [transaction])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // TODO: Load from API
        const mockCategories: Category[] = [
          { id: '1', name: 'Alimentação', color: '#ef4444', type: 'expense' },
          { id: '2', name: 'Transporte', color: '#3b82f6', type: 'expense' },
          { id: '3', name: 'Moradia', color: '#6b7280', type: 'expense' },
          { id: '4', name: 'Saúde', color: '#ec4899', type: 'expense' },
          { id: '5', name: 'Educação', color: '#a855f7', type: 'expense' },
          { id: '6', name: 'Lazer', color: '#eab308', type: 'expense' },
          { id: '7', name: 'Utilidades', color: '#f59e0b', type: 'expense' },
          { id: '8', name: 'Roupas', color: '#8b5cf6', type: 'expense' },
          { id: '9', name: 'Salário', color: '#22c55e', type: 'income' },
          { id: '10', name: 'Freelance', color: '#f97316', type: 'income' },
          { id: '11', name: 'Investimento', color: '#8b5cf6', type: 'income' },
          { id: '12', name: 'Venda', color: '#10b981', type: 'income' },
          { id: '13', name: 'Bônus', color: '#06b6d4', type: 'income' },
          { id: '14', name: 'Comissão', color: '#84cc16', type: 'income' },
          { id: '15', name: 'Outros', color: '#6b7280' }
        ]
        setCategories(mockCategories)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Data é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transaction || !validateForm()) {
      return
    }

    try {
      setLoading(true)
      const result = await updateTransaction(transaction.id, formData)

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso"
        })
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TransactionUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editar Transação
          </DialogTitle>
          <DialogDescription>
            Atualize os dados da transação abaixo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') => handleInputChange('type', value)}
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

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">Data *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date || ''}
                  onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.transaction_date && (
                <p className="text-sm text-destructive">{errors.transaction_date}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Salário, Almoço, Uber..."
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category_id || ''}
              onValueChange={(value) => handleInputChange('category_id', value)}
            >
              <SelectTrigger>
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories
                  .filter(cat => !formData.type || cat.type === formData.type || !cat.type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais (opcional)"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Current Values Summary */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Valores Atuais</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <p className="font-medium">{formatDate(transaction.transaction_date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Categoria:</span>
                  <p className="font-medium">
                    {transaction.category ? (
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          backgroundColor: transaction.category.color + '20',
                          color: transaction.category.color
                        }}
                      >
                        {transaction.category.name}
                      </Badge>
                    ) : (
                      'Sem categoria'
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium">
                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

