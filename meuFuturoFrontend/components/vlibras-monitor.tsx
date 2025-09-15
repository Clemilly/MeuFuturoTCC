"use client"

import { useEffect, useRef } from 'react'

interface VLibrasMonitorProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasMonitor({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasMonitorProps) {
  const initialized = useRef(false)
  const observerRef = useRef<MutationObserver | null>(null)
  
  useEffect(() => {
    // Verifica se já está no servidor
    if (typeof window === 'undefined') return
    if (initialized.current) return

    const initializeVLibrasWithMonitor = async () => {
      try {
        console.log('🚀 Inicializando VLibras com Monitor DOM...')
        
        // Remove elementos anteriores
        cleanupPreviousVLibras()
        
        // Carrega o script oficial
        await loadOfficialScript()
        
        // Inicia o monitoramento do DOM
        startDOMObserver()
        
        // Aguarda e tenta criar o widget
        setTimeout(() => {
          createOfficialWidget()
        }, 2000)
        
        // Timeout de segurança
        setTimeout(() => {
          if (!initialized.current) {
            console.log('⏰ Timeout atingido, criando fallback...')
            createFallbackWidget()
          }
        }, 10000)
        
      } catch (error) {
        console.error('❌ Erro ao inicializar VLibras Monitor:', error)
        createFallbackWidget()
      }
    }

    const cleanupPreviousVLibras = () => {
      // Remove scripts anteriores
      const scripts = document.querySelectorAll('script[src*="vlibras"]')
      scripts.forEach(script => script.remove())
      
      // Remove elementos VLibras existentes
      const elements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
      elements.forEach(el => el.remove())
      
      // Para o observer anterior se existir
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      
      console.log('🧹 Elementos anteriores removidos')
    }

    const loadOfficialScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@dev/app/vlibras-plugin.js'
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log('✅ Script oficial VLibras carregado')
          resolve()
        }
        
        script.onerror = () => {
          console.error('❌ Erro ao carregar script oficial')
          reject(new Error('Script load failed'))
        }

        document.head.appendChild(script)
      })
    }

    const startDOMObserver = () => {
      console.log('👀 Iniciando monitoramento do DOM...')
      
      observerRef.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              
              // Verifica se é um elemento VLibras
              if (isVLibrasElement(element)) {
                console.log('🎯 Elemento VLibras detectado no DOM:', element)
                handleVLibrasElement(element)
              }
              
              // Verifica elementos filhos também
              const vlibrasChildren = element.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
              vlibrasChildren.forEach(child => {
                console.log('🎯 Elemento VLibras filho detectado:', child)
                handleVLibrasElement(child)
              })
            }
          })
        })
      })
      
      // Observa mudanças no document.body
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id', 'class']
      })
      
      console.log('✅ Monitor DOM ativo')
    }

    const isVLibrasElement = (element: Element): boolean => {
      const id = element.id?.toLowerCase() || ''
      const className = element.className?.toString().toLowerCase() || ''
      const tagName = element.tagName?.toLowerCase() || ''
      
      return (
        id.includes('vlibras') ||
        className.includes('vlibras') ||
        (tagName === 'iframe' && element.getAttribute('src')?.includes('vlibras'))
      )
    }

    const handleVLibrasElement = (element: Element) => {
      if (initialized.current) return
      
      console.log('🎉 VLibras detectado! Aplicando estilos...')
      
      const htmlElement = element as HTMLElement
      
      // Aplica estilos para garantir visibilidade
      htmlElement.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 9999 !important;
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        pointer-events: auto !important;
        background: transparent !important;
        border: none !important;
      `
      
      // Se for iframe, ajusta propriedades específicas
      if (htmlElement.tagName === 'IFRAME') {
        htmlElement.style.cssText += `
          border: none !important;
          background: transparent !important;
        `
      }
      
      htmlElement.classList.add('vlibras-debug')
      
      console.log('✅ VLibras oficial funcionando!')
      initialized.current = true
      
      // Para o observer
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }

    const createOfficialWidget = () => {
      try {
        if (!window.VLibras || !window.VLibras.Widget) {
          console.error('❌ VLibras.Widget não disponível')
          return
        }

        console.log('🎯 Criando widget oficial VLibras...')
        
        // Cria o widget oficial
        const widget = new window.VLibras.Widget('https://vlibras.gov.br/app', {
          avatar: avatar,
          position: position,
          opacity: opacity
        })
        
        console.log('✅ Widget oficial criado:', widget)
        
      } catch (error) {
        console.error('❌ Erro ao criar widget oficial:', error)
      }
    }

    const createFallbackWidget = () => {
      if (document.getElementById('vlibras-monitor-widget')) return
      
      console.log('🔧 Criando widget de fallback monitorado...')
      
      const widget = document.createElement('div')
      widget.id = 'vlibras-monitor-widget'
      widget.className = 'vlibras-monitor-widget'
      widget.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 70px !important;
        height: 70px !important;
        background: linear-gradient(135deg, #6f42c1, #5a32a3) !important;
        border-radius: 50% !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 4px 20px rgba(111,66,193,0.4) !important;
        transition: all 0.3s ease !important;
        font-size: 28px !important;
        color: white !important;
        border: 3px solid white !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        user-select: none !important;
      `
      
      widget.innerHTML = '🔍'
      widget.title = 'VLibras Monitor - Aguardando Detecção'
      
      // Efeitos visuais
      widget.addEventListener('mouseenter', () => {
        widget.style.transform = 'scale(1.15)'
        widget.style.boxShadow = '0 8px 25px rgba(111,66,193,0.6)'
      })
      
      widget.addEventListener('mouseleave', () => {
        widget.style.transform = 'scale(1)'
        widget.style.boxShadow = '0 4px 20px rgba(111,66,193,0.4)'
      })
      
      // Funcionalidade
      widget.addEventListener('click', () => {
        const modal = document.createElement('div')
        modal.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0,0,0,0.8) !important;
          z-index: 10000 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        `
        
        const modalContent = document.createElement('div')
        modalContent.style.cssText = `
          background: white !important;
          padding: 30px !important;
          border-radius: 15px !important;
          max-width: 500px !important;
          text-align: center !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
        `
        
        modalContent.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
          <h3 style="margin: 0 0 15px 0; color: #6f42c1; font-size: 24px;">VLibras Monitor</h3>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
            Sistema de monitoramento do VLibras ativo.
            <br><br>
            <strong>Status:</strong><br>
            • Script carregado: ✅<br>
            • Widget criado: ✅<br>
            • Monitor DOM: ✅<br>
            • Elementos detectados: ${document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]').length}
          </p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
            <strong>Diagnóstico:</strong><br>
            O VLibras pode estar funcionando, mas os elementos não estão sendo criados no DOM.
            Isso pode ser devido a problemas de CORS, CSP ou outras restrições de segurança.
          </div>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="location.reload()" style="
              background: #6f42c1 !important;
              color: white !important;
              border: none !important;
              padding: 10px 20px !important;
              border-radius: 5px !important;
              cursor: pointer !important;
              font-size: 16px !important;
            ">Recarregar</button>
            <button onclick="this.parentElement.parentElement.remove()" style="
              background: #6c757d !important;
              color: white !important;
              border: none !important;
              padding: 10px 20px !important;
              border-radius: 5px !important;
              cursor: pointer !important;
              font-size: 16px !important;
            ">Fechar</button>
          </div>
        `
        
        modal.appendChild(modalContent)
        document.body.appendChild(modal)
        
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove()
          }
        })
      })
      
      document.body.appendChild(widget)
      console.log('✅ Widget de monitor criado!')
      initialized.current = true
    }

    // Inicializa
    initializeVLibrasWithMonitor()

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      const monitorWidget = document.getElementById('vlibras-monitor-widget')
      if (monitorWidget) {
        monitorWidget.remove()
      }
    }
  }, [avatar, position, opacity])

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
