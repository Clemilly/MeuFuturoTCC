/**
 * EXEMPLO DE USO DO HOOK useOperationToast
 * 
 * Este arquivo demonstra como usar o hook useOperationToast
 * em diferentes cenários de requisições à API.
 */

import { useOperationToast } from "@/hooks/use-operation-toast"
import { apiService } from "@/lib/api"

// Exemplo 1: Uso básico com status HTTP
export function ExampleBasicUsage() {
  const { showToastFromStatus } = useOperationToast()

  const handleCreateTransaction = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, description: 'Test' })
      })

      // Mostra toast baseado no status
      showToastFromStatus(response.status)
    } catch (error) {
      showToastFromStatus(500)
    }
  }

  return <button onClick={handleCreateTransaction}>Criar Transação</button>
}

// Exemplo 2: Uso com resposta da API (recomendado)
export function ExampleWithApiResponse() {
  const { showToastFromResponse } = useOperationToast()

  const handleCreateCategory = async () => {
    const response = await apiService.createCategory({
      name: "Nova Categoria",
      color: "#3b82f6",
      icon: "home",
      type: "expense"
    })

    // Mostra toast baseado na resposta
    // Se response.error existe, mostra erro
    // Se response.data existe, mostra sucesso
    showToastFromResponse(response)
  }

  return <button onClick={handleCreateCategory}>Criar Categoria</button>
}

// Exemplo 3: Uso com mensagem customizada
export function ExampleWithCustomMessage() {
  const { showOperationToast } = useOperationToast()

  const handleCustomOperation = async () => {
    try {
      const response = await apiService.createTransaction({
        type: "income",
        amount: 1000,
        description: "Salário",
        transaction_date: new Date().toISOString().split("T")[0]
      })

      if (response.error) {
        showOperationToast("error", {
          message: "Não foi possível criar a transação. Tente novamente."
        })
      } else {
        showOperationToast("success", {
          message: "Transação criada com sucesso! Você pode verificar na lista."
        })
      }
    } catch (error) {
      showOperationToast("error")
    }
  }

  return <button onClick={handleCustomOperation}>Criar com Mensagem Customizada</button>
}

// Exemplo 4: Uso com duração customizada
export function ExampleWithCustomDuration() {
  const { showOperationToast } = useOperationToast()

  const handleQuickOperation = async () => {
    // Toast desaparece em 3 segundos ao invés dos 6 padrão
    showOperationToast("success", {
      message: "Operação rápida concluída!",
      duration: 3000
    })
  }

  return <button onClick={handleQuickOperation}>Operação Rápida</button>
}

// Exemplo 5: Integração completa em um componente de formulário
export function ExampleCompleteIntegration() {
  const { showToastFromResponse } = useOperationToast()

  const handleSubmit = async (formData: any) => {
    // Enviar requisição
    const response = await apiService.createTransaction(formData)

    // Mostrar toast baseado na resposta
    showToastFromResponse(response)

    // Se sucesso, pode fazer outras ações (fechar modal, resetar form, etc.)
    if (!response.error && response.data) {
      // Fechar modal, resetar formulário, etc.
      console.log("Transação criada com sucesso!")
    }
  }

  return null
}

