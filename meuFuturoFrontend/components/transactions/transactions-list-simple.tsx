/**
 * Simple transactions list without virtualization
 * Fallback version for compatibility
 */

"use client"

import { useState, useMemo, useCallback, useEffect } from 'react'
import { MaterialIcon } from '@/lib/material-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TransactionCard } from './transaction-card'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

interface TransactionsListSimpleProps {
  transactions: Transaction[]
  loading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onViewDetails: (transaction: Transaction) => void
  onDuplicate: (transaction: Transaction) => void
}

// Selection state interface
interface SelectionState {
  selectedIds: Set<string>
  isAllSelected: boolean
  isPartiallySelected: boolean
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-4 w-[100px]" />
        </div>
      ))}
    </div>
  )
}

// Empty state component
function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MaterialIcon name="inbox" size={48} className="text-muted-foreground mb-4" tooltip="Nenhuma transação" aria-hidden={true} />
        <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Comece adicionando sua primeira transação ou ajuste os filtros para ver mais resultados.
        </p>
      </CardContent>
    </Card>
  )
}

// Error state component
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MaterialIcon name="alert-circle" size={48} className="text-destructive mb-4" tooltip="Erro" aria-hidden={true} />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar transações</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          {error}
        </p>
        <Button onClick={onRetry} variant="outline">
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

export function TransactionsListSimple({ 
  transactions, 
  loading, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onDuplicate 
}: TransactionsListSimpleProps) {
  
  const [selection, setSelection] = useState<SelectionState>({
    selectedIds: new Set(),
    isAllSelected: false,
    isPartiallySelected: false
  })
  
  // Update selection state when transactions change
  useEffect(() => {
    setSelection(prev => ({
      ...prev,
      isAllSelected: transactions.length > 0 && prev.selectedIds.size === transactions.length,
      isPartiallySelected: prev.selectedIds.size > 0 && prev.selectedIds.size < transactions.length
    }))
  }, [transactions, selection.selectedIds.size])
  
  // Handle individual selection
  const handleSelect = useCallback((id: string) => {
    setSelection(prev => {
      const newSelectedIds = new Set(prev.selectedIds)
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id)
      } else {
        newSelectedIds.add(id)
      }
      
      return {
        selectedIds: newSelectedIds,
        isAllSelected: newSelectedIds.size === transactions.length && transactions.length > 0,
        isPartiallySelected: newSelectedIds.size > 0 && newSelectedIds.size < transactions.length
      }
    })
  }, [transactions.length])
  
  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selection.isAllSelected) {
      setSelection({
        selectedIds: new Set(),
        isAllSelected: false,
        isPartiallySelected: false
      })
    } else {
      setSelection({
        selectedIds: new Set(transactions.map(t => t.id)),
        isAllSelected: true,
        isPartiallySelected: false
      })
    }
  }, [selection.isAllSelected, transactions])
  
  // Handle bulk actions
  const handleBulkDelete = useCallback(() => {
    const selectedTransactions = transactions.filter(t => selection.selectedIds.has(t.id))
    // This would trigger a confirmation modal
    console.log('Bulk delete:', selectedTransactions)
  }, [transactions, selection.selectedIds])
  
  const handleBulkExport = useCallback(() => {
    const selectedTransactions = transactions.filter(t => selection.selectedIds.has(t.id))
    // This would trigger export functionality
    console.log('Bulk export:', selectedTransactions)
  }, [transactions, selection.selectedIds])
  
  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelection({
      selectedIds: new Set(),
      isAllSelected: false,
      isPartiallySelected: false
    })
  }, [])
  
  // Empty state - only show when not loading and no transactions
  if (!loading && transactions.length === 0) {
    return <EmptyState />
  }
  
  return (
    <div className="space-y-4">
      {/* Header with selection and actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>
                Transações ({transactions.length})
              </CardTitle>
              {selection.selectedIds.size > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {selection.selectedIds.size} selecionada{selection.selectedIds.size > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {selection.selectedIds.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    Limpar seleção
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MaterialIcon name="more-horizontal" size={16} tooltip="Mais opções" aria-hidden={true} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleBulkExport}>
                        <MaterialIcon name="download" size={16} className="mr-2" tooltip="Exportar selecionadas" aria-hidden={true} />
                        Exportar selecionadas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleBulkDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <MaterialIcon name="trash-2" size={16} className="mr-2" tooltip="Excluir selecionadas" aria-hidden={true} />
                        Excluir selecionadas
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Selection header */}
      {transactions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selection.isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selection.isPartiallySelected
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {selection.isAllSelected 
                    ? 'Todas selecionadas' 
                    : selection.isPartiallySelected 
                    ? `${selection.selectedIds.size} selecionadas`
                    : 'Selecionar todas'
                  }
                </span>
              </div>
              
              {selection.selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkExport}
                  >
                    <MaterialIcon name="download" size={16} className="mr-1" tooltip="Exportar" aria-hidden={true} />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-destructive hover:text-destructive"
                  >
                    <MaterialIcon name="trash-2" size={16} className="mr-1" tooltip="Excluir" aria-hidden={true} />
                    Excluir
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Simple list without virtualization */}
      <Card>
        <CardContent className="p-4">
          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={selection.selectedIds.has(transaction.id)}
                    onCheckedChange={() => handleSelect(transaction.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  
                  <TransactionCard
                    transaction={transaction}
                    viewMode={{ type: 'list', compact: true }}
                    isSelected={selection.selectedIds.has(transaction.id)}
                    onSelect={() => handleSelect(transaction.id)}
                    onEdit={() => onEdit(transaction)}
                    onDelete={() => onDelete(transaction)}
                    onDuplicate={() => onDuplicate(transaction)}
                    onViewDetails={() => onViewDetails(transaction)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MaterialIcon name="inbox" size={32} className="mx-auto mb-2" tooltip="Nenhuma transação encontrada" aria-hidden={true} />
              <p>Nenhuma transação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

