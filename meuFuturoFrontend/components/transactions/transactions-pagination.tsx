/**
 * Advanced pagination component with page size selector and smart navigation
 * Optimized for performance and user experience
 */

"use client"

import { useState, useMemo, useCallback } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal,
  Settings,
  List,
  Grid
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { PaginationInfo } from '@/lib/types'

interface TransactionsPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  loading?: boolean
}

// Page size options
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 por página' },
  { value: 20, label: '20 por página' },
  { value: 50, label: '50 por página' },
  { value: 100, label: '100 por página' }
]

// View mode options
const VIEW_MODE_OPTIONS = [
  { value: 'list', label: 'Lista', icon: List },
  { value: 'grid', label: 'Grid', icon: Grid }
]

export function TransactionsPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false
}: TransactionsPaginationProps) {
  const [showPageSizeSelector, setShowPageSizeSelector] = useState(false)
  const [showViewModeSelector, setShowViewModeSelector] = useState(false)
  
  // Calculate page range for display
  const pageRange = useMemo(() => {
    const { current_page, total_pages } = pagination
    const delta = 2 // Number of pages to show on each side of current page
    const range = []
    const rangeWithDots = []
    
    // Calculate range
    for (let i = Math.max(2, current_page - delta); i <= Math.min(total_pages - 1, current_page + delta); i++) {
      range.push(i)
    }
    
    // Add first page
    if (current_page - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }
    
    // Add middle range
    rangeWithDots.push(...range)
    
    // Add last page
    if (current_page + delta < total_pages - 1) {
      rangeWithDots.push('...', total_pages)
    } else if (total_pages > 1) {
      rangeWithDots.push(total_pages)
    }
    
    return rangeWithDots
  }, [pagination.current_page, pagination.total_pages])
  
  // Handle page navigation
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.total_pages && page !== pagination.current_page) {
      onPageChange(page)
    }
  }, [pagination.current_page, pagination.total_pages, onPageChange])
  
  // Handle page size change
  const handlePageSizeChange = useCallback((size: string) => {
    const newSize = parseInt(size)
    onPageSizeChange(newSize)
    setShowPageSizeSelector(false)
  }, [onPageSizeChange])
  
  // Calculate display info
  const displayInfo = useMemo(() => {
    const { current_page, page_size, total_items } = pagination
    const startItem = (current_page - 1) * page_size + 1
    const endItem = Math.min(current_page * page_size, total_items)
    
    return {
      startItem,
      endItem,
      totalItems: total_items,
      hasItems: total_items > 0
    }
  }, [pagination])
  
  // Don't render if there's only one page or no items
  if (pagination.total_pages <= 1 || !displayInfo.hasItems) {
    return null
  }
  
  return (
    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Info and page size */}
          <div className="flex items-center gap-4">
            {/* Items info */}
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{displayInfo.startItem}</span> a{' '}
              <span className="font-medium text-foreground">{displayInfo.endItem}</span> de{' '}
              <span className="font-medium text-foreground">{displayInfo.totalItems}</span> transações
            </div>
            
            {/* Page size selector */}
            <Popover open={showPageSizeSelector} onOpenChange={setShowPageSizeSelector}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <Settings className="h-4 w-4 mr-1" />
                  {pagination.page_size} por página
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Itens por página</Label>
                  <div className="space-y-1">
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={pagination.page_size === option.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageSizeChange(option.value.toString())}
                        className="w-full justify-start h-8 text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Right side - Pagination controls */}
          <div className="flex items-center gap-2">
            {/* First page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={!pagination.has_previous || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            {/* Previous page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_previous || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {pageRange.map((page, index) => {
                if (page === '...') {
                  return (
                    <div key={`dots-${index}`} className="flex items-center justify-center w-8 h-8">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )
                }
                
                const pageNumber = page as number
                const isCurrentPage = pageNumber === pagination.current_page
                
                return (
                  <Button
                    key={pageNumber}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className={cn(
                      "h-8 w-8 p-0",
                      isCurrentPage && "bg-primary text-primary-foreground"
                    )}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            
            {/* Next page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Last page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.total_pages)}
              disabled={!pagination.has_next || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile pagination info */}
        <div className="sm:hidden mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Página {pagination.current_page} de {pagination.total_pages}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_previous || loading}
                className="h-7 px-3 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Anterior
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next || loading}
                className="h-7 px-3 text-xs"
              >
                Próxima
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              Carregando...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}