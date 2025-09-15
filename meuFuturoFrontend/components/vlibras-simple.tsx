"use client"

import { useEffect, useState } from 'react'

interface VLibrasSimpleProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasSimple({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasSimpleProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    // Verifica se já está no servidor
    if (typeof window === 'undefined') return

    // Verifica se o script já foi carregado
    if (document.querySelector('script[src*="vlibras-plugin.js"]')) {
      console.log('✅ Script VLibras já carregado')
      setIsLoaded(true)
      initializeWidget()
      return
    }

    // Carrega o script do VLibras
    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('✅ Script VLibras carregado com sucesso')
      setIsLoaded(true)
      initializeWidget()
    }
    
    script.onerror = () => {
      console.error('❌ Erro ao carregar script VLibras')
    }

    document.head.appendChild(script)

    const initializeWidget = () => {
      // Aguarda o VLibras estar disponível
      const checkVLibras = () => {
        if (window.VLibras && window.VLibras.Widget) {
          try {
            console.log('🚀 Inicializando widget VLibras...')
            
            // Cria o widget
            new window.VLibras.Widget('https://vlibras.gov.br/app', {
              avatar,
              position,
              opacity
            })
            
            console.log('✅ Widget VLibras inicializado com sucesso!')
          } catch (err) {
            console.error('❌ Erro ao inicializar widget VLibras:', err)
          }
        } else {
          // Tenta novamente em 500ms
          setTimeout(checkVLibras, 500)
        }
      }
      
      checkVLibras()
    }
  }, [avatar, position, opacity])

  // Não renderiza nada - o VLibras se adiciona ao DOM automaticamente
  return null
}

// Declaração de tipos para o VLibras
declare global {
  interface Window {
    VLibras: {
      Widget: new (url: string, config: {
        avatar: string
        position: string
        opacity: number
      }) => void
    }
  }
}
