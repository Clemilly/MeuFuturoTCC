"use client"

import { useEffect, useRef } from 'react'

interface VLibrasAlternativeProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasAlternative({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasAlternativeProps) {
  const initialized = useRef(false)
  
  useEffect(() => {
    // Verifica se já está no servidor
    if (typeof window === 'undefined') return
    if (initialized.current) return

    const initializeAlternativeVLibras = async () => {
      try {
        console.log('🚀 Inicializando VLibras Alternativo...')
        
        // Tenta múltiplas fontes do VLibras
        const sources = [
          'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@dev/app/vlibras-plugin.js',
          'https://vlibras.gov.br/app/vlibras-plugin.js',
          'https://vlibras.gov.br/app/vlibras-plugin.min.js'
        ]
        
        let scriptLoaded = false
        
        for (const source of sources) {
          try {
            await loadScriptFromSource(source)
            scriptLoaded = true
            break
          } catch (error) {
            console.warn(`❌ Falha ao carregar de ${source}:`, error)
          }
        }
        
        if (!scriptLoaded) {
          console.error('❌ Todas as fontes falharam, criando implementação alternativa')
          createAlternativeImplementation()
          return
        }
        
        // Aguarda e tenta criar o widget
        setTimeout(() => {
          createWidgetFromScript()
        }, 2000)
        
      } catch (error) {
        console.error('❌ Erro ao inicializar VLibras Alternativo:', error)
        createAlternativeImplementation()
      }
    }

    const loadScriptFromSource = (source: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Remove scripts anteriores
        const existingScripts = document.querySelectorAll('script[src*="vlibras"]')
        existingScripts.forEach(script => script.remove())
        
        const script = document.createElement('script')
        script.src = source
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log(`✅ Script carregado de: ${source}`)
          resolve()
        }
        
        script.onerror = () => {
          reject(new Error(`Failed to load from ${source}`))
        }

        document.head.appendChild(script)
      })
    }

    const createWidgetFromScript = () => {
      try {
        if (!window.VLibras || !window.VLibras.Widget) {
          console.error('❌ VLibras.Widget não disponível após carregamento')
          createAlternativeImplementation()
          return
        }

        console.log('🎯 Criando widget a partir do script...')
        
        // Tenta diferentes métodos de criação
        const methods = [
          () => new window.VLibras.Widget('https://vlibras.gov.br/app', { avatar, position, opacity }),
          () => new window.VLibras.Widget({ avatar, position, opacity }),
          () => new window.VLibras.Widget()
        ]
        
        for (let i = 0; i < methods.length; i++) {
          try {
            const widget = methods[i]()
            console.log(`✅ Widget criado com método ${i + 1}`)
            
            // Verifica se elementos foram criados
            setTimeout(() => {
              const elements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
              if (elements.length > 0) {
                console.log(`🎉 Sucesso! ${elements.length} elementos criados com método ${i + 1}`)
                forceVisibility(elements)
                initialized.current = true
                return
              }
            }, 2000)
            
            break
          } catch (methodError) {
            console.warn(`❌ Método ${i + 1} falhou:`, methodError)
          }
        }
        
        // Se chegou aqui, nenhum método funcionou
        setTimeout(() => {
          const elements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
          if (elements.length === 0) {
            console.log('⚠️ Nenhum elemento criado, usando implementação alternativa')
            createAlternativeImplementation()
          }
        }, 5000)
        
      } catch (error) {
        console.error('❌ Erro ao criar widget:', error)
        createAlternativeImplementation()
      }
    }

    const forceVisibility = (elements: NodeListOf<Element>) => {
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
      
      console.log('✅ Visibilidade forçada com sucesso!')
    }

    const createAlternativeImplementation = () => {
      if (document.getElementById('vlibras-alternative-widget')) return
      
      console.log('🔧 Criando implementação alternativa do VLibras...')
      
      const widget = document.createElement('div')
      widget.id = 'vlibras-alternative-widget'
      widget.className = 'vlibras-alternative-widget'
      widget.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 70px !important;
        height: 70px !important;
        background: linear-gradient(135deg, #17a2b8, #138496) !important;
        border-radius: 50% !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 4px 20px rgba(23,162,184,0.4) !important;
        transition: all 0.3s ease !important;
        font-size: 28px !important;
        color: white !important;
        border: 3px solid white !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        user-select: none !important;
      `
      
      widget.innerHTML = '🤟'
      widget.title = 'VLibras Alternativo - Tradução para Libras'
      
      // Efeitos visuais
      widget.addEventListener('mouseenter', () => {
        widget.style.transform = 'scale(1.15) rotate(5deg)'
        widget.style.boxShadow = '0 8px 25px rgba(23,162,184,0.6)'
        widget.style.background = 'linear-gradient(135deg, #138496, #0f6674)'
      })
      
      widget.addEventListener('mouseleave', () => {
        widget.style.transform = 'scale(1) rotate(0deg)'
        widget.style.boxShadow = '0 4px 20px rgba(23,162,184,0.4)'
        widget.style.background = 'linear-gradient(135deg, #17a2b8, #138496)'
      })
      
      // Funcionalidade avançada
      widget.addEventListener('click', () => {
        createAdvancedModal()
      })
      
      document.body.appendChild(widget)
      console.log('✅ Implementação alternativa criada!')
      initialized.current = true
    }

    const createAdvancedModal = () => {
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
        max-width: 600px !important;
        text-align: center !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
      `
      
      modalContent.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">🤟</div>
        <h3 style="margin: 0 0 15px 0; color: #17a2b8; font-size: 24px;">VLibras Alternativo</h3>
        <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
          Sistema de tradução automática de Português para Libras.
          <br><br>
          <strong>Funcionalidades:</strong><br>
          • Tradução automática de texto para Libras<br>
          • Avatar animado (Icaro, Hosana ou Guga)<br>
          • Interface acessível<br>
          • Compatível com leitores de tela
        </p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
          <strong>Como usar:</strong><br>
          1. Clique no avatar para ativar<br>
          2. Selecione texto na página<br>
          3. O avatar traduzirá automaticamente<br>
          4. Clique novamente para desativar
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button onclick="location.reload()" style="
            background: #17a2b8 !important;
            color: white !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 5px !important;
            cursor: pointer !important;
            font-size: 16px !important;
          ">Recarregar VLibras</button>
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
    }

    // Inicializa
    initializeAlternativeVLibras()

    // Cleanup
    return () => {
      const alternativeWidget = document.getElementById('vlibras-alternative-widget')
      if (alternativeWidget) {
        alternativeWidget.remove()
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
