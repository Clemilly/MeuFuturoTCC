/**
 * Minimalist transaction card with modern design
 * Optimized for performance and accessibility
 */

"use client"

import { useState, useMemo } from 'react'
import { MaterialIcon } from '@/lib/material-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Transaction, ViewMode } from '@/lib/types'

interface TransactionCardProps {
  transaction: Transaction
  viewMode: ViewMode
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onViewDetails: () => void
}

export function TransactionCard({
  transaction,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails
}: TransactionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Get transaction icon
  const getTransactionIcon = useMemo(() => {
    return transaction.type === 'income' ? (
      <MaterialIcon name="trending-up" size={16} tooltip="Receita" aria-hidden={true} />
    ) : (
      <MaterialIcon name="trending-down" size={16} tooltip="Despesa" aria-hidden={true} />
    )
  }, [transaction.type])
  
  // Get amount color
  const getAmountColor = useMemo(() => {
    return transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
  }, [transaction.type])
  
  // Get amount background color
  const getAmountBgColor = useMemo(() => {
    return transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
  }, [transaction.type])
  
  // Get amount border color
  const getAmountBorderColor = useMemo(() => {
    return transaction.type === 'income' ? 'border-green-200' : 'border-red-200'
  }, [transaction.type])
  
  // Get category color
  const getCategoryColor = useMemo(() => {
    if (!transaction.category) return 'bg-muted text-muted-foreground'
    return `bg-[${transaction.category.color}20] text-[${transaction.category.color}]`
  }, [transaction.category])
  
  // Get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `Há ${diffInHours}h`
    if (diffInHours < 48) return 'Ontem'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} dias atrás`
    return formatDate(dateString)
  }
  
  const isGridMode = viewMode.type === 'grid'
  const isCompact = viewMode.compact
  
  return (
    <div 
      className={cn(
        'group relative transition-all duration-200 cursor-pointer',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isHovered && 'shadow-lg',
        isGridMode ? 'h-fit' : 'h-auto'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewDetails}
    >
      {isGridMode ? (
        /* Grid Mode Layout */
        <div className="p-4 space-y-3 bg-card border rounded-lg hover:shadow-md transition-shadow">
          {/* Header with icon and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-full border',
                getAmountBgColor,
                getAmountBorderColor
              )}>
                {getTransactionIcon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {transaction.description}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {getRelativeTime(transaction.transaction_date)}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MaterialIcon name="more-horizontal" size={16} tooltip="Mais opções" aria-hidden={true} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
                  <MaterialIcon name="eye" size={16} className="mr-2" tooltip="Ver detalhes" aria-hidden={true} />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <MaterialIcon name="edit" size={16} className="mr-2" tooltip="Editar" aria-hidden={true} />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <MaterialIcon name="copy" size={16} className="mr-2" tooltip="Duplicar" aria-hidden={true} />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-destructive focus:text-destructive"
                >
                  <MaterialIcon name="trash-2" size={16} className="mr-2" tooltip="Excluir" aria-hidden={true} />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Amount and category */}
          <div className="flex items-center justify-between">
            <div className={cn('font-bold text-lg', getAmountColor)}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </div>
            
            {transaction.category && (
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: transaction.category.color + '20',
                  color: transaction.category.color,
                  borderColor: transaction.category.color + '40'
                }}
              >
                {transaction.category.name}
              </Badge>
            )}
          </div>
          
          {/* Notes preview */}
          {transaction.notes && !isCompact && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {transaction.notes}
            </p>
          )}
        </div>
      ) : (
        /* List Mode Layout */
        <div className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={cn(
              'p-2 rounded-full border',
              getAmountBgColor,
              getAmountBorderColor
            )}>
              {getTransactionIcon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">
                  {transaction.description}
                </h3>
                {transaction.category && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: transaction.category.color + '20',
                      color: transaction.category.color,
                      borderColor: transaction.category.color + '40'
                    }}
                  >
                    {transaction.category.name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MaterialIcon name="calendar" size={12} tooltip="Data da transação" aria-hidden={true} />
                  <span>{formatDate(transaction.transaction_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MaterialIcon name="clock" size={12} tooltip="Hora de criação" aria-hidden={true} />
                  <span>{formatTime(transaction.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn('font-bold text-lg', getAmountColor)}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MaterialIcon name="more-horizontal" size={16} tooltip="Mais opções" aria-hidden={true} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
                  <MaterialIcon name="eye" size={16} className="mr-2" tooltip="Ver detalhes" aria-hidden={true} />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <MaterialIcon name="edit" size={16} className="mr-2" tooltip="Editar" aria-hidden={true} />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <MaterialIcon name="copy" size={16} className="mr-2" tooltip="Duplicar" aria-hidden={true} />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-destructive focus:text-destructive"
                >
                  <MaterialIcon name="trash-2" size={16} className="mr-2" tooltip="Excluir" aria-hidden={true} />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  )
}