/**
 * Hook responsável APENAS por exportação de relatórios
 */

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { ReportFilters } from './use-reports-filters'

export type ExportFormat = 'pdf' | 'xlsx' | 'csv'

export function useReportsExport() {
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const exportReport = useCallback(async (
    filters: ReportFilters, 
    format: ExportFormat
  ) => {
    console.log(`📤 Exporting report as ${format}:`, filters)
    setExporting(true)

    try {
      // Preparar parâmetros
      const params: any = {
        format,
        include_charts: format === 'pdf'
      }

      if (filters.dateRange.start) {
        params.start_date = filters.dateRange.start.toISOString().split('T')[0]
      }
      if (filters.dateRange.end) {
        params.end_date = filters.dateRange.end.toISOString().split('T')[0]
      }
      if (filters.transactionTypes.length === 1) {
        params.transaction_type = filters.transactionTypes[0]
      }
      if (filters.categories.length > 0) {
        params.category_id = filters.categories[0] // Usar primeira categoria
      }

      const response = await apiService.exportFinancialReport(params)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Download do arquivo
      if (response.data instanceof Blob) {
        const url = window.URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        
        // Gerar nome do arquivo
        const startDate = filters.dateRange.start 
          ? filters.dateRange.start.toISOString().split('T')[0].replace(/-/g, '') 
          : 'inicio'
        const endDate = filters.dateRange.end 
          ? filters.dateRange.end.toISOString().split('T')[0].replace(/-/g, '') 
          : 'atual'
        const filename = `relatorio_financeiro_${startDate}_${endDate}.${format}`
        
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log('✅ Report exported successfully:', filename)
        toast({
          title: "Sucesso",
          description: `Relatório exportado como ${format.toUpperCase()}`
        })

        return { success: true, filename }
      } else {
        throw new Error('Formato de resposta inválido para exportação')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar'
      console.error('❌ Error exporting report:', errorMessage)
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })

      return { success: false, error: errorMessage }
    } finally {
      setExporting(false)
    }
  }, [toast])

  return {
    exporting,
    exportReport
  }
}




