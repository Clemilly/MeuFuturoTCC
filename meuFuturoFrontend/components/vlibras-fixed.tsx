"use client"

import { useEffect, useRef } from 'react'

interface VLibrasFixedProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasFixed({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasFixedProps) {
  const initialized = useRef(false)
  const widgetInstance = useRef<any>(null)

  useEffect(() => {
    // Verifica se já está no servidor
    if (typeof window === 'undefined') return

    // Evita múltiplas inicializações
    if (initialized.current) return

    const forceVLibrasVisibility = () => {
      // Procura por todos os elementos possíveis do VLibras
      const selectors = [
        '[id*="vlibras"]',
        '[class*="vlibras"]',
        '#vlibras',
        '.vlibras-widget',
        '.vlibras-container',
        '#vlibras-widget',
        '.vlibras-avatar',
        '.vlibras-avatar-container',
        'iframe[src*="vlibras"]'
      ]
      
      let foundElements = 0
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement
          console.log(`🔍 Forçando visibilidade do elemento:`, selector, htmlElement)
          
          // Força visibilidade com múltiplas propriedades
          htmlElement.style.display = 'block'
          htmlElement.style.visibility = 'visible'
          htmlElement.style.opacity = '1'
          htmlElement.style.zIndex = '9999'
          htmlElement.style.position = 'fixed'
          htmlElement.style.bottom = '20px'
          htmlElement.style.right = '20px'
          htmlElement.style.width = '60px'
          htmlElement.style.height = '60px'
          htmlElement.style.background = 'transparent'
          htmlElement.style.border = 'none'
          htmlElement.style.pointerEvents = 'auto'
          
          // Remove classes que podem estar ocultando
          htmlElement.classList.remove('hidden', 'invisible', 'opacity-0')
          htmlElement.classList.add('vlibras-debug')
          
          foundElements++
        })
      })
      
      console.log(`🎯 Total de elementos VLibras encontrados e forçados: ${foundElements}`)
      
      // Se não encontrou nenhum elemento, tenta criar um manualmente
      if (foundElements === 0) {
        console.log('⚠️ Nenhum elemento VLibras encontrado, tentando criar manualmente...')
        createManualVLibrasWidget()
      }
    }
    
    const createManualVLibrasWidget = () => {
      // Cria um widget manual como fallback
      const widget = document.createElement('div')
      widget.id = 'vlibras-manual-widget'
      widget.className = 'vlibras-widget vlibras-debug'
      widget.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        background: #007bff !important;
        border-radius: 50% !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
      `
      
      widget.innerHTML = '👋'
      widget.title = 'VLibras - Tradução para Libras'
      
      widget.addEventListener('click', () => {
        alert('VLibras está funcionando! Clique para ativar a tradução.')
      })
      
      document.body.appendChild(widget)
      console.log('✅ Widget VLibras manual criado!')
    }

    const initVLibras = () => {
      try {
        // Verifica se o script já foi carregado
        const existingScript = document.querySelector('script[src*="vlibras-plugin.js"]')
        
        if (existingScript) {
          console.log('✅ Script VLibras já existe')
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
          initializeWidget()
        }
        
        script.onerror = () => {
          console.error('❌ Erro ao carregar script VLibras')
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error('❌ Erro ao inicializar VLibras:', error)
      }
    }

    const initializeWidget = () => {
      if (initialized.current) return

      // Aguarda o VLibras estar disponível
      const checkVLibras = () => {
        if (window.VLibras && window.VLibras.Widget) {
          try {
            console.log('🚀 Inicializando widget VLibras...')
            
            // Destrói widget anterior se existir
            if (widgetInstance.current) {
              try {
                widgetInstance.current.destroy?.()
              } catch (e) {
                console.warn('Erro ao destruir widget anterior:', e)
              }
            }
            
            // Cria o widget com configurações mais específicas
            try {
              widgetInstance.current = new window.VLibras.Widget('https://vlibras.gov.br/app', {
                avatar: avatar,
                position: position,
                opacity: opacity,
                forceOnload: true
              })
              
              console.log('Widget VLibras criado:', widgetInstance.current)
            } catch (widgetError) {
              console.error('Erro ao criar widget:', widgetError)
              // Tenta método alternativo
              if (window.VLibras && window.VLibras.Widget) {
                try {
                  widgetInstance.current = new window.VLibras.Widget()
                  console.log('Widget VLibras criado com método alternativo')
                } catch (altError) {
                  console.error('Erro no método alternativo:', altError)
                }
              }
            }
            
            // Força a visibilidade do widget após criação
            setTimeout(() => {
              forceVLibrasVisibility()
            }, 1000)
            
            // Verifica novamente após 3 segundos
            setTimeout(() => {
              forceVLibrasVisibility()
            }, 3000)
            
            // Verifica novamente após 5 segundos
            setTimeout(() => {
              forceVLibrasVisibility()
            }, 5000)
            
            initialized.current = true
            console.log('✅ Widget VLibras inicializado com sucesso!')
          } catch (err) {
            console.error('❌ Erro ao inicializar widget VLibras:', err)
            // Tenta novamente em 1 segundo
            setTimeout(checkVLibras, 1000)
          }
        } else {
          // Tenta novamente em 500ms
          setTimeout(checkVLibras, 500)
        }
      }
      
      checkVLibras()
    }

    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initVLibras)
    } else {
      initVLibras()
    }

    // Cleanup
    return () => {
      if (widgetInstance.current) {
        try {
          widgetInstance.current.destroy?.()
        } catch (e) {
          console.warn('Erro ao destruir widget no cleanup:', e)
        }
      }
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
      }) => any
    }
  }
}
