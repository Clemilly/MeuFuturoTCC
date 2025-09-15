"use client"

import { useEffect, useRef } from 'react'

interface VLibrasOfficialProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasOfficial({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasOfficialProps) {
  const initialized = useRef(false)
  const widgetInstance = useRef<any>(null)
  
  useEffect(() => {
    // Verifica se já está no servidor
    if (typeof window === 'undefined') return
    if (initialized.current) return

    const initializeOfficialVLibras = async () => {
      try {
        console.log('🚀 Inicializando VLibras Oficial...')
        
        // Remove elementos anteriores
        cleanupPreviousVLibras()
        
        // Carrega o script oficial do CDN
        await loadOfficialScript()
        
        // Aguarda e inicializa o widget
        setTimeout(() => {
          createOfficialWidget()
        }, 2000)
        
      } catch (error) {
        console.error('❌ Erro ao inicializar VLibras Oficial:', error)
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
      
      console.log('🧹 Elementos anteriores removidos')
    }

    const loadOfficialScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        // Usa o CDN direto que está funcionando
        script.src = 'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@dev/app/vlibras-plugin.js'
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log('✅ Script oficial VLibras carregado do CDN')
          resolve()
        }
        
        script.onerror = () => {
          console.error('❌ Erro ao carregar script oficial')
          reject(new Error('Script load failed'))
        }

        document.head.appendChild(script)
      })
    }

    const createOfficialWidget = () => {
      if (initialized.current) return

      try {
        // Verifica se o VLibras está disponível
        if (!window.VLibras || !window.VLibras.Widget) {
          console.error('❌ VLibras.Widget não está disponível')
          createFallbackWidget()
          return
        }

        console.log('🎯 Criando widget oficial VLibras...')
        
        // Cria o widget oficial
        widgetInstance.current = new window.VLibras.Widget('https://vlibras.gov.br/app', {
          avatar: avatar,
          position: position,
          opacity: opacity
        })
        
        console.log('✅ Widget oficial criado:', widgetInstance.current)
        
        // Aguarda os elementos serem criados e força visibilidade
        setTimeout(() => {
          checkAndForceOfficialVisibility()
        }, 3000)
        
        // Verifica novamente após 5 segundos
        setTimeout(() => {
          checkAndForceOfficialVisibility()
        }, 5000)
        
        initialized.current = true
        
      } catch (error) {
        console.error('❌ Erro ao criar widget oficial:', error)
        createFallbackWidget()
      }
    }

    const checkAndForceOfficialVisibility = () => {
      const vlibrasElements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
      console.log(`🔍 Verificando elementos oficiais: ${vlibrasElements.length} encontrados`)
      
      if (vlibrasElements.length === 0) {
        console.log('⚠️ Nenhum elemento oficial encontrado, criando fallback...')
        createFallbackWidget()
        return
      }
      
      // Força visibilidade dos elementos oficiais
      vlibrasElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement
        console.log(`🎯 Forçando visibilidade do elemento oficial ${index}:`, htmlElement)
        
        // Aplica estilos para garantir visibilidade
        htmlElement.style.cssText += `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 9999 !important;
          position: fixed !important;
          pointer-events: auto !important;
        `
        
        // Se for iframe, ajusta posição
        if (htmlElement.tagName === 'IFRAME') {
          htmlElement.style.cssText += `
            bottom: 20px !important;
            right: 20px !important;
            width: 60px !important;
            height: 60px !important;
            border: none !important;
          `
        }
        
        htmlElement.classList.add('vlibras-debug')
      })
      
      console.log('✅ Visibilidade forçada para elementos oficiais')
    }

    const createFallbackWidget = () => {
      if (document.getElementById('vlibras-fallback-official')) return
      
      console.log('🔧 Criando widget de fallback oficial...')
      
      const widget = document.createElement('div')
      widget.id = 'vlibras-fallback-official'
      widget.className = 'vlibras-fallback-official'
      widget.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 70px !important;
        height: 70px !important;
        background: linear-gradient(135deg, #dc3545, #c82333) !important;
        border-radius: 50% !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 4px 20px rgba(220,53,69,0.4) !important;
        transition: all 0.3s ease !important;
        font-size: 28px !important;
        color: white !important;
        border: 3px solid white !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        user-select: none !important;
      `
      
      widget.innerHTML = '⚠️'
      widget.title = 'VLibras Oficial - Problema de Conectividade'
      
      // Efeitos visuais
      widget.addEventListener('mouseenter', () => {
        widget.style.transform = 'scale(1.15)'
        widget.style.boxShadow = '0 8px 25px rgba(220,53,69,0.6)'
      })
      
      widget.addEventListener('mouseleave', () => {
        widget.style.transform = 'scale(1)'
        widget.style.boxShadow = '0 4px 20px rgba(220,53,69,0.4)'
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
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h3 style="margin: 0 0 15px 0; color: #dc3545; font-size: 24px;">VLibras Oficial</h3>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
            O VLibras oficial está com problemas de conectividade ou inicialização.
            <br><br>
            <strong>Possíveis causas:</strong><br>
            • Bloqueio de rede/firewall<br>
            • Problemas no servidor oficial<br>
            • Conflitos com outros scripts<br>
            • Problemas de CORS
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="location.reload()" style="
              background: #007bff !important;
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
      console.log('✅ Widget de fallback oficial criado!')
    }

    // Inicializa
    initializeOfficialVLibras()

    // Cleanup
    return () => {
      const fallbackWidget = document.getElementById('vlibras-fallback-official')
      if (fallbackWidget) {
        fallbackWidget.remove()
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
