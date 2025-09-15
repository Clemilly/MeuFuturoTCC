"use client"

import { useEffect, useRef, useState } from 'react'

interface VLibrasNativeProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
  showDebugInfo?: boolean
}

export function VLibrasNative({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0,
  showDebugInfo = false
}: VLibrasNativeProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialized = useRef(false)
  const widgetInstance = useRef<any>(null)
  const isMounted = useRef(true)
  const observerRef = useRef<MutationObserver | null>(null)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      isMounted.current = false
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    // Evita inicialização dupla
    if (initialized.current || !isMounted.current) return

    const loadVLibras = async () => {
      if (!isMounted.current) return
      
      try {
        console.log('🔄 Carregando VLibras...')
        
        // Verifica se o script já foi carregado
        if (document.querySelector('script[src*="vlibras-plugin.js"]')) {
          console.log('✅ Script VLibras já carregado')
          if (isMounted.current) {
            setIsLoaded(true)
            initializeWidget()
          }
          return
        }

        // Carrega o script do VLibras
        const script = document.createElement('script')
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
        script.async = true
        script.defer = true
        
        script.onload = () => {
          if (!isMounted.current) return
          console.log('✅ Script VLibras carregado com sucesso')
          setIsLoaded(true)
          initializeWidget()
        }
        
        script.onerror = () => {
          if (!isMounted.current) return
          console.error('❌ Erro ao carregar script VLibras')
          setHasError(true)
          setError('Falha ao carregar script do VLibras')
        }

        if (isMounted.current) {
          document.head.appendChild(script)
        }
        
      } catch (err) {
        if (!isMounted.current) return
        console.error('❌ Erro ao inicializar VLibras:', err)
        setHasError(true)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      }
    }

    const initializeWidget = () => {
      if (!isMounted.current) return
      
      if (!window.VLibras || !window.VLibras.Widget) {
        console.warn('⚠️ VLibras não disponível, tentando novamente em 1s...')
        setTimeout(() => {
          if (isMounted.current) {
            initializeWidget()
          }
        }, 1000)
        return
      }

      try {
        console.log('🚀 Inicializando widget VLibras...')
        console.log('Configurações:', { avatar, position, opacity })
        
        // Limpa qualquer widget existente de forma segura
        if (isMounted.current) {
          const existingWidget = document.querySelector('div[vw="true"]')
          if (existingWidget && existingWidget.parentNode) {
            try {
              existingWidget.parentNode.removeChild(existingWidget)
            } catch (e) {
              console.warn('Erro ao remover widget existente:', e)
            }
          }
        }
        
        if (!isMounted.current) return
        
        widgetInstance.current = new window.VLibras.Widget('https://vlibras.gov.br/app', {
          avatar,
          position,
          opacity
        })
        
        if (!isMounted.current) return
        
        initialized.current = true
        setIsActive(true)
        setHasError(false)
        setError(null)
        
        console.log('✅ Widget VLibras inicializado com sucesso!')
        
        // Função para forçar a exibição do widget
        const forceWidgetVisibility = (widget: Element) => {
          if (!isMounted.current) return
          
          console.log('🎉 Widget VLibras renderizado e visível!')
          try {
            // Força a exibição do widget
            widget.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; position: fixed !important; z-index: 9999 !important;')
            
            // Força também os elementos filhos
            const accessButton = widget.querySelector('div[vw-access-button="true"]')
            if (accessButton) {
              accessButton.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important;')
            }
            
            const pluginWrapper = widget.querySelector('div[vw-plugin-wrapper="true"]')
            if (pluginWrapper) {
              pluginWrapper.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important;')
            }
          } catch (e) {
            console.warn('Erro ao forçar visibilidade do widget:', e)
          }
        }

        // Usa MutationObserver para detectar quando o widget é adicionado
        if (isMounted.current) {
          const observer = new MutationObserver((mutations) => {
            if (!isMounted.current) return
            
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList') {
                const widget = document.querySelector('div[vw="true"]')
                if (widget) {
                  forceWidgetVisibility(widget)
                  if (observerRef.current) {
                    observerRef.current.disconnect()
                    observerRef.current = null
                  }
                }
              }
            })
          })

          observerRef.current = observer

          // Observa mudanças no body
          observer.observe(document.body, {
            childList: true,
            subtree: true
          })

          // Fallback com timeout
          setTimeout(() => {
            if (!isMounted.current) return
            
            const widget = document.querySelector('div[vw="true"]')
            if (widget) {
              forceWidgetVisibility(widget)
              if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
              }
            } else {
              console.warn('⚠️ Widget não encontrado no DOM após inicialização')
              // Tenta novamente após mais tempo
              setTimeout(() => {
                if (!isMounted.current) return
                
                const retryWidget = document.querySelector('div[vw="true"]')
                if (retryWidget) {
                  forceWidgetVisibility(retryWidget)
                  if (observerRef.current) {
                    observerRef.current.disconnect()
                    observerRef.current = null
                  }
                }
              }, 3000)
            }
          }, 2000)
        }

      } catch (err) {
        if (!isMounted.current) return
        console.error('❌ Erro ao inicializar widget VLibras:', err)
        setHasError(true)
        setError(err instanceof Error ? err.message : 'Erro ao inicializar widget')
      }
    }

    loadVLibras()
  }, [avatar, position, opacity])

  return (
    <>
      {/* Widget container */}
      <div 
        vw="true" 
        className="enabled"
        style={{
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          position: 'fixed',
          zIndex: 9999
        }}
      >
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>

      {/* Debug info */}
      {showDebugInfo && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 10, 
            right: 10, 
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4ade80' }}>
            🔧 VLibras Debug Info
          </div>
          <div>Status: {isLoaded ? '✅ Carregado' : '⏳ Carregando...'}</div>
          <div>Ativo: {isActive ? '✅ Sim' : '❌ Não'}</div>
          <div>Avatar: {avatar}</div>
          <div>Posição: {position}</div>
          <div>Opacidade: {opacity}</div>
          {hasError && (
            <div style={{ color: '#f87171', marginTop: '5px' }}>
              ❌ Erro: {error}
            </div>
          )}
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#94a3b8' }}>
            Verifique o console para mais detalhes
          </div>
        </div>
      )}
    </>
  )
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
