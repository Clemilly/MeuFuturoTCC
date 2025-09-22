/**
 * Modal de detalhes da transação
 * Exibe todas as informações relevantes de uma transação
 */

"use client"

import { X, Calendar, Tag, DollarSign, FileText, User, Clock, Edit, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

interface TransactionDetailsModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  onDuplicate?: (transaction: Transaction) => void
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate
}: TransactionDetailsModalProps) {
  if (!transaction) return null

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
      return 'R$ 0,00'
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericAmount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
  }

  const getTypeBadgeVariant = (type: string) => {
    return type === 'income' ? 'default' : 'secondary'
  }

  const getTypeLabel = (type: string) => {
    return type === 'income' ? 'Receita' : 'Despesa'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Transação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com valor e tipo */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{transaction.description}</h3>
                    <Badge 
                      variant={getTypeBadgeVariant(transaction.type)}
                      className="mt-1"
                    >
                      {getTypeLabel(transaction.type)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-2xl font-bold",
                    getTypeColor(transaction.type)
                  )}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data da transação */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data da Transação
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-lg font-semibold">
                  {formatDate(transaction.transaction_date)}
                </p>
              </CardContent>
            </Card>

            {/* Categoria */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  {transaction.category && (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: transaction.category.color }}
                    />
                  )}
                  <span className="font-semibold">
                    {transaction.category?.name || transaction.category_name || 'Sem categoria'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notas */}
          {transaction.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm whitespace-pre-wrap">
                  {transaction.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Informações técnicas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Criado em:</p>
                  <p className="font-medium">{formatDateTime(transaction.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Atualizado em:</p>
                  <p className="font-medium">{formatDateTime(transaction.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 justify-end">
            {onDuplicate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDuplicate(transaction)
                  onClose()
                }}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Duplicar
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(transaction)
                  onClose()
                }}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(transaction)
                  onClose()
                }}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
