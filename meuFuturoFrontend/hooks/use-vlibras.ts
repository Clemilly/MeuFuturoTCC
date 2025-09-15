"use client"

import { useEffect, useRef, useState } from 'react'

interface VLibrasConfig {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
  forceOnload?: boolean
  autoInit?: boolean
}

interface VLibrasState {
  isLoaded: boolean
  isActive: boolean
  hasError: boolean
  error: string | null
}

export function useVLibras(config: VLibrasConfig = {}) {
  const {
    avatar = 'icaro',
    position = 'br',
    opacity = 1.0,
    forceOnload = true,
    autoInit = true
  } = config

  const [state, setState] = useState<VLibrasState>({
    isLoaded: false,
    isActive: false,
    hasError: false,
    error: null
  })

  const initialized = useRef(false)
  const widgetInstance = useRef<any>(null)

  // Inicializa o VLibras
  const initVLibras = () => {
    if (initialized.current || !window.VLibras) return

    try {
      widgetInstance.current = new window.VLibras.Widget(
        'https://vlibras.gov.br/app',
        {
          avatar,
          position,
          opacity
        }
      )
      
      initialized.current = true
      setState(prev => ({ ...prev, isActive: true, hasError: false, error: null }))
    } catch (error) {
      console.error('Erro ao inicializar VLibras:', error)
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }))
    }
  }

  // Carrega o script do VLibras
  const loadVLibrasScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector('script[src*="vlibras-plugin.js"]')) {
        setState(prev => ({ ...prev, isLoaded: true }))
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
      script.async = true
      
      script.onload = () => {
        setState(prev => ({ ...prev, isLoaded: true }))
        resolve()
      }
      
      script.onerror = () => {
        const error = 'Falha ao carregar script do VLibras'
        setState(prev => ({ ...prev, hasError: true, error }))
        reject(new Error(error))
      }

      document.head.appendChild(script)
    })
  }

  // Toggle do VLibras
  const toggleVLibras = () => {
    if (widgetInstance.current) {
      setState(prev => ({ ...prev, isActive: !prev.isActive }))
    }
  }

  // Reinicializa o VLibras
  const reinitVLibras = () => {
    initialized.current = false
    widgetInstance.current = null
    setState(prev => ({ ...prev, isActive: false, hasError: false, error: null }))
    initVLibras()
  }

  useEffect(() => {
    if (!autoInit) return

    const initializeVLibras = async () => {
      try {
        await loadVLibrasScript()
        
        if (forceOnload) {
          // Aguarda um pouco para garantir que o script foi executado
          setTimeout(initVLibras, 100)
        } else {
          // Inicializa quando a página terminar de carregar
          if (document.readyState === 'complete') {
            initVLibras()
          } else {
            window.addEventListener('load', initVLibras)
            return () => window.removeEventListener('load', initVLibras)
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar VLibras:', error)
      }
    }

    initializeVLibras()
  }, [autoInit, forceOnload])

  return {
    ...state,
    initVLibras,
    toggleVLibras,
    reinitVLibras,
    widgetInstance: widgetInstance.current
  }
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
