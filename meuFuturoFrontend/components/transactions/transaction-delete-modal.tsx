/**
 * Transaction delete confirmation modal
 * Modern design with clear warning and confirmation
 */

"use client"

import { useState } from 'react'
import { Trash2, AlertTriangle, X, Calendar, DollarSign, Tag } from 'lucide-react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useTransactions } from '@/hooks/use-transactions'
import { useToast } from '@/hooks/use-toast'
import type { Transaction } from '@/lib/types'

interface TransactionDeleteModalProps {
  isOpen: boolean
  transaction: Transaction | null
  onClose: () => void
  onSuccess: () => void
}

export function TransactionDeleteModal({
  isOpen,
  transaction,
  onClose,
  onSuccess
}: TransactionDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const { deleteTransaction } = useTransactions()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!transaction) return

    try {
      setLoading(true)
      const result = await deleteTransaction(transaction.id)

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Transação excluída com sucesso"
        })
        onSuccess()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast({
        title: "Erro",
        description: "Erro ao excluir transação",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!transaction) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Transaction Details */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground">Transação</h4>
                <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                  {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </Badge>
              </div>
              
              <div>
                <p className="font-semibold text-lg">{transaction.description}</p>
                <div className={`text-lg font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">{formatDate(transaction.transaction_date)}</span>
                </div>
                
                {transaction.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Categoria:</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: transaction.category.color + '20',
                        color: transaction.category.color
                      }}
                    >
                      {transaction.category.name}
                    </Badge>
                  </div>
                )}
              </div>

              {transaction.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Observações:</strong> {transaction.notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warning Message */}
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-destructive mb-1">Atenção!</p>
            <p className="text-muted-foreground">
              Esta transação será permanentemente removida do seu histórico financeiro. 
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {loading ? 'Excluindo...' : 'Excluir Transação'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

