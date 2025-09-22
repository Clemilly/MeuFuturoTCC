/**
 * Centralized transaction modals for all CRUD operations
 * Clean, accessible design with proper focus management
 */

"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  X, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TransactionForm } from './transaction-form'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionCreate, TransactionUpdate, Category, ModalState } from '@/lib/types'

interface TransactionModalsProps {
  modals: ModalState
  onClose: () => void
  onCreateTransaction: (data: TransactionCreate) => Promise<{ success: boolean; error?: string }>
  onUpdateTransaction: (id: string, data: TransactionUpdate) => Promise<{ success: boolean; error?: string }>
  onDeleteTransaction: (id: string) => Promise<{ success: boolean; error?: string }>
  categories: Category[]
  loading: boolean
}

// Transaction details modal
function TransactionDetailsModal({ 
  transaction, 
  onClose, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: {
  transaction: Transaction
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
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
  
  const getTransactionIcon = () => {
    return transaction.type === 'income' ? (
      <TrendingUp className="h-6 w-6 text-green-600" />
    ) : (
      <TrendingDown className="h-6 w-6 text-red-600" />
    )
  }
  
  const getAmountColor = () => {
    return transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
  }
  
  const getAmountBgColor = () => {
    return transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
  }
  
  const getAmountBorderColor = () => {
    return transaction.type === 'income' ? 'border-green-200' : 'border-red-200'
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes da Transação
          </DialogTitle>
          <DialogDescription>
            Visualize todos os detalhes desta transação
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Transaction header */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <div className={cn(
              'p-3 rounded-full border',
              getAmountBgColor(),
              getAmountBorderColor()
            )}>
              {getTransactionIcon}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{transaction.description}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(transaction.transaction_date)}
              </p>
            </div>
            
            <div className="text-right">
              <p className={cn('text-2xl font-bold', getAmountColor)}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              <Badge variant="secondary" className="mt-1">
                {transaction.type === 'income' ? 'Receita' : 'Despesa'}
              </Badge>
            </div>
          </div>
          
          {/* Transaction details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data da Transação</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.transaction_date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data de Criação</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>
              </div>
              
              {transaction.category && (
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Categoria</p>
                    <Badge 
                      variant="secondary" 
                      className="mt-1"
                      style={{ 
                        backgroundColor: transaction.category.color + '20',
                        color: transaction.category.color,
                        borderColor: transaction.category.color + '40'
                      }}
                    >
                      {transaction.category.name}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Valor</p>
                  <p className={cn('text-lg font-semibold', getAmountColor)}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Descrição</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.description}
                  </p>
                </div>
              </div>
              
              {transaction.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Observações</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onEdit} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button onClick={onDuplicate} variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
            <Button onClick={onDelete} variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Delete confirmation modal
function DeleteConfirmationModal({ 
  transaction, 
  onClose, 
  onConfirm, 
  loading 
}: {
  transaction: Transaction
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. A transação será permanentemente removida.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tem certeza que deseja excluir esta transação?
            </AlertDescription>
          </Alert>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(transaction.transaction_date)}
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-bold',
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={onConfirm} 
              variant="destructive" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline" 
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main modals component
export function TransactionModals({
  modals,
  onClose,
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  categories,
  loading
}: TransactionModalsProps) {
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!modals.selectedTransaction) return
    
    try {
      setDeleteLoading(true)
      const result = await onDeleteTransaction(modals.selectedTransaction.id)
      
      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    } finally {
      setDeleteLoading(false)
    }
  }
  
  // Handle form submission for create
  const handleCreateSubmit = async (data: TransactionCreate) => {
    const result = await onCreateTransaction(data)
    if (result.success) {
      onClose()
    }
    return result
  }
  
  // Handle form submission for edit
  const handleEditSubmit = async (data: TransactionUpdate) => {
    if (!modals.selectedTransaction) return { success: false, error: 'Transação não encontrada' }
    
    const result = await onUpdateTransaction(modals.selectedTransaction.id, data)
    if (result.success) {
      onClose()
    }
    return result
  }
  
  // Handle duplicate
  const handleDuplicate = () => {
    if (!modals.selectedTransaction) return
    
    const duplicateData: TransactionCreate = {
      type: modals.selectedTransaction.type,
      amount: modals.selectedTransaction.amount,
      description: `${modals.selectedTransaction.description} (cópia)`,
      transaction_date: new Date().toISOString().split('T')[0],
      notes: modals.selectedTransaction.notes,
      category_id: modals.selectedTransaction.category?.id
    }
    
    onCreateTransaction(duplicateData)
    onClose()
  }
  
  // Render create modal
  if (modals.isCreateOpen) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova transação
            </DialogDescription>
          </DialogHeader>
          
          <TransactionForm
            mode="create"
            categories={categories}
            loading={loading}
            onSubmit={handleCreateSubmit}
            onCancel={onClose}
          />
        </DialogContent>
      </Dialog>
    )
  }
  
  // Render edit modal
  if (modals.isEditOpen && modals.selectedTransaction) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias na transação
            </DialogDescription>
          </DialogHeader>
          
          <TransactionForm
            mode="edit"
            transaction={modals.selectedTransaction}
            categories={categories}
            loading={loading}
            onSubmit={handleEditSubmit}
            onCancel={onClose}
          />
        </DialogContent>
      </Dialog>
    )
  }
  
  // Render delete confirmation modal
  if (modals.isDeleteOpen && modals.selectedTransaction) {
    return (
      <DeleteConfirmationModal
        transaction={modals.selectedTransaction}
        onClose={onClose}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    )
  }
  
  // Render details modal
  if (modals.isDetailsOpen && modals.selectedTransaction) {
    return (
      <TransactionDetailsModal
        transaction={modals.selectedTransaction}
        onClose={onClose}
        onEdit={() => {
          onClose()
          // This would trigger the edit modal
        }}
        onDelete={() => {
          onClose()
          // This would trigger the delete modal
        }}
        onDuplicate={handleDuplicate}
      />
    )
  }
  
  return null
}

