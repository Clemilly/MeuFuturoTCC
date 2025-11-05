/**
 * Hook para exibir toast de sucesso ou erro baseado no status da requisição
 * 
 * @example
 * const { showOperationToast } = useOperationToast()
 * 
 * // Após uma requisição
 * if (response.status === 200) {
 *   showOperationToast('success')
 * } else {
 *   showOperationToast('error')
 * }
 */

import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle } from "lucide-react"

const DEFAULT_MESSAGE = "A operação foi concluída. Atualize a página para ver as alterações."

interface ShowOperationToastOptions {
  message?: string
  duration?: number
}

export function useOperationToast() {
  const { toast } = useToast()

  const showOperationToast = (
    type: "success" | "error",
    options?: ShowOperationToastOptions
  ) => {
    const message = options?.message ?? DEFAULT_MESSAGE
    const duration = options?.duration ?? 6000 // 6 segundos por padrão

    if (type === "success") {
      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Sucesso</span>
          </div>
        ),
        description: message,
        duration,
      })
    } else {
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Erro</span>
          </div>
        ),
        description: message,
        duration,
      })
    }
  }

  /**
   * Exibe toast baseado no status HTTP da requisição
   * @param status - Status HTTP da resposta (200, 201, 400, 500, etc.)
   * @param options - Opções customizadas
   */
  const showToastFromStatus = (
    status: number,
    options?: ShowOperationToastOptions
  ) => {
    // Status 2xx são considerados sucesso
    const isSuccess = status >= 200 && status < 300
    showOperationToast(isSuccess ? "success" : "error", options)
  }

  /**
   * Exibe toast baseado na resposta da API
   * @param response - Resposta da API com propriedade error, data ou status
   * @param options - Opções customizadas
   */
  const showToastFromResponse = (
    response: { error?: string | null; data?: any; status?: number } | null,
    options?: ShowOperationToastOptions
  ) => {
    if (!response) {
      showOperationToast("error", options)
      return
    }

    // Se tem erro, é erro
    if (response.error) {
      showOperationToast("error", {
        ...options,
        message: options?.message ?? response.error,
      })
      return
    }

    // Se tem status, usa o status
    if (response.status !== undefined) {
      showToastFromStatus(response.status, options)
      return
    }

    // Se tem data e não tem erro, assume sucesso
    if (response.data) {
      showOperationToast("success", options)
      return
    }

    // Caso padrão: assume erro
    showOperationToast("error", options)
  }

  return {
    showOperationToast,
    showToastFromStatus,
    showToastFromResponse,
  }
}

