"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react'
import type { ExportOptionsProps, ExportFormat } from '@/lib/types'

export function ExportOptions({ onExport, loading = false }: ExportOptionsProps) {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format)
    try {
      await onExport(format)
    } finally {
      setExportingFormat(null)
    }
  }

  const exportOptions = [
    {
      format: 'csv' as ExportFormat,
      label: 'CSV',
      description: 'Dados tabulares para análise',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      format: 'xlsx' as ExportFormat,
      label: 'Excel',
      description: 'Planilha formatada com gráficos',
      icon: FileSpreadsheet,
      color: 'text-blue-600'
    },
    {
      format: 'pdf' as ExportFormat,
      label: 'PDF',
      description: 'Relatório completo com visualizações',
      icon: File,
      color: 'text-red-600'
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={loading || exportingFormat !== null}
          className="flex items-center gap-2"
        >
          {(loading || exportingFormat !== null) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>
            {exportingFormat ? `Exportando ${exportingFormat.toUpperCase()}...` : 'Exportar'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {exportOptions.map((option) => {
          const IconComponent = option.icon
          const isExporting = exportingFormat === option.format
          
          return (
            <DropdownMenuItem
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={loading || isExporting}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <div className={`flex-shrink-0 ${option.color}`}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconComponent className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {option.label}
                  {isExporting && ' (Exportando...)'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {option.description}
                </div>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

