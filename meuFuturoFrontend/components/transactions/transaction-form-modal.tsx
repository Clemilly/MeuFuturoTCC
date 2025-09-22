/**
 * Modal wrapper for transaction form
 * Provides focused modal experience with background overlay
 */

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TransactionForm } from './transaction-form'
import type { TransactionFormData } from '@/lib/types'

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialData?: Partial<TransactionFormData>
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData
}: TransactionFormModalProps) {
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <TransactionForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            initialData={initialData}
            compact={false}
            modal={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
