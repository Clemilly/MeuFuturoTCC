"use client"

import { useEffect, useRef } from 'react'

interface VLibrasUltimateProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasUltimate({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasUltimateProps) {
  const initialized = useRef(false)
  
  useEffect(() => {
    // Verifica se já está no servidor
    if (typeof window === 'undefined') return
    if (initialized.current) return

    const createUltimateVLibras = () => {
      try {
        console.log('🚀 Iniciando VLibras Ultimate...')
        
        // Método 1: Tenta carregar o script oficial
        loadOfficialVLibras()
        
        // Método 2: Cria widget funcional como backup
        setTimeout(() => {
          createFunctionalWidget()
        }, 3000)
        
      } catch (error) {
        console.error('❌ Erro ao inicializar VLibras Ultimate:', error)
        createFunctionalWidget()
      }
    }

    const loadOfficialVLibras = () => {
      // Remove scripts anteriores
      const existingScripts = document.querySelectorAll('script[src*="vlibras"]')
      existingScripts.forEach(script => script.remove())
      
      // Remove elementos VLibras existentes
      const existingElements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
      existingElements.forEach(el => el.remove())

      const script = document.createElement('script')
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('✅ Script oficial VLibras carregado')
        
        // Aguarda o script ser executado
        setTimeout(() => {
          if (window.VLibras && window.VLibras.Widget) {
            try {
              console.log('🎯 Tentando criar widget oficial...')
              
              // Tenta diferentes métodos de criação
              const methods = [
                () => new window.VLibras.Widget('https://vlibras.gov.br/app', { avatar, position, opacity }),
                () => new window.VLibras.Widget({ avatar, position, opacity }),
                () => new window.VLibras.Widget()
              ]
              
              for (let i = 0; i < methods.length; i++) {
                try {
                  const widget = methods[i]()
                  console.log(`✅ Widget criado com método ${i + 1}:`, widget)
                  
                  // Verifica se elementos foram criados
                  setTimeout(() => {
                    const elements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
                    console.log(`🔍 Método ${i + 1} criou ${elements.length} elementos`)
                    
                    if (elements.length > 0) {
                      forceElementVisibility(elements)
                      initialized.current = true
                      return
                    }
                  }, 2000)
                  
                  break
                } catch (methodError) {
                  console.warn(`❌ Método ${i + 1} falhou:`, methodError)
                }
              }
              
            } catch (error) {
              console.error('❌ Erro ao criar widget oficial:', error)
            }
          } else {
            console.error('❌ VLibras.Widget não disponível')
          }
        }, 1500)
      }
      
      script.onerror = () => {
        console.error('❌ Erro ao carregar script oficial')
      }

      document.head.appendChild(script)
    }

    const forceElementVisibility = (elements: NodeListOf<Element>) => {
      elements.forEach((element, index) => {
        const htmlElement = element as HTMLElement
        console.log(`🎯 Forçando visibilidade do elemento ${index}:`, htmlElement)
        
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
        
        htmlElement.classList.add('vlibras-debug')
      })
      
      console.log('✅ Visibilidade forçada para elementos VLibras')
    }

    const createFunctionalWidget = () => {
      // Remove widget anterior se existir
      const existingWidget = document.getElementById('vlibras-ultimate-widget')
      if (existingWidget) {
        existingWidget.remove()
      }
      
      // Cria widget funcional e bonito
      const widget = document.createElement('div')
      widget.id = 'vlibras-ultimate-widget'
      widget.className = 'vlibras-ultimate-widget'
      widget.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 70px !important;
        height: 70px !important;
        background: linear-gradient(135deg, #28a745, #20c997) !important;
        border-radius: 50% !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 4px 20px rgba(40,167,69,0.4) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        font-size: 28px !important;
        color: white !important;
        border: 3px solid white !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        user-select: none !important;
      `
      
      widget.innerHTML = '🤟'
      widget.title = 'VLibras - Tradução para Libras'
      
      // Efeitos visuais
      widget.addEventListener('mouseenter', () => {
        widget.style.transform = 'scale(1.15) rotate(5deg)'
        widget.style.boxShadow = '0 8px 25px rgba(40,167,69,0.6)'
        widget.style.background = 'linear-gradient(135deg, #20c997, #17a2b8)'
      })
      
      widget.addEventListener('mouseleave', () => {
        widget.style.transform = 'scale(1) rotate(0deg)'
        widget.style.boxShadow = '0 4px 20px rgba(40,167,69,0.4)'
        widget.style.background = 'linear-gradient(135deg, #28a745, #20c997)'
      })
      
      // Funcionalidade
      widget.addEventListener('click', () => {
        // Cria modal informativo
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
          max-width: 400px !important;
          text-align: center !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
        `
        
        modalContent.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 20px;">🤟</div>
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 24px;">VLibras</h3>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
            Sistema de tradução automática de Português para Libras.
            <br><br>
            Este widget está funcionando como fallback.
            O VLibras oficial pode estar temporariamente indisponível.
          </p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #28a745 !important;
            color: white !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 5px !important;
            cursor: pointer !important;
            font-size: 16px !important;
          ">Entendi</button>
        `
        
        modal.appendChild(modalContent)
        document.body.appendChild(modal)
        
        // Remove modal ao clicar fora
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove()
          }
        })
      })
      
      document.body.appendChild(widget)
      console.log('✅ Widget VLibras Ultimate criado!')
      initialized.current = true
    }

    // Inicializa
    createUltimateVLibras()

    // Cleanup
    return () => {
      const widget = document.getElementById('vlibras-ultimate-widget')
      if (widget) {
        widget.remove()
      }
    }
  }, [avatar, position, opacity])

  return null
}

// Declaração de tipos para o VLibras
declare global {
  interface Window {
    VLibras: {
      Widget: new (url?: string, config?: {
        avatar?: string
        position?: string
        opacity?: number
      }) => any
    }
  }
}
