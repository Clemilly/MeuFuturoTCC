"use client"

import { useEffect } from 'react'

interface VLibrasDirectProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasDirect({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasDirectProps) {
  
  useEffect(() => {
    // Verifica se já está no servidor
    if (typeof window === 'undefined') return

    const initializeVLibras = () => {
      try {
        // Verifica se o script já foi carregado
        if (document.querySelector('script[src*="vlibras-plugin.js"]')) {
          console.log('✅ Script VLibras já existe, reinicializando...')
          // Remove elementos existentes
          const existingElements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
          existingElements.forEach(el => el.remove())
        }

        // Carrega o script do VLibras
        const script = document.createElement('script')
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log('✅ Script VLibras carregado com sucesso')
          
          // Aguarda um pouco para o script ser executado
          setTimeout(() => {
            if (window.VLibras && window.VLibras.Widget) {
              try {
                console.log('🚀 Criando widget VLibras...')
                
                // Cria o widget usando a API oficial
                const widget = new window.VLibras.Widget('https://vlibras.gov.br/app', {
                  avatar: avatar,
                  position: position,
                  opacity: opacity
                })
                
                console.log('✅ Widget VLibras criado:', widget)
                
                // Aguarda e verifica se os elementos foram criados
                setTimeout(() => {
                  checkAndForceVisibility()
                }, 2000)
                
              } catch (error) {
                console.error('❌ Erro ao criar widget VLibras:', error)
                createFallbackWidget()
              }
            } else {
              console.error('❌ VLibras.Widget não está disponível')
              createFallbackWidget()
            }
          }, 1000)
        }
        
        script.onerror = () => {
          console.error('❌ Erro ao carregar script VLibras')
          createFallbackWidget()
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error('❌ Erro ao inicializar VLibras:', error)
        createFallbackWidget()
      }
    }

    const checkAndForceVisibility = () => {
      const vlibrasElements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
      console.log(`🔍 Encontrados ${vlibrasElements.length} elementos VLibras após criação`)
      
      if (vlibrasElements.length === 0) {
        console.log('⚠️ Nenhum elemento criado pelo VLibras, criando fallback...')
        createFallbackWidget()
        return
      }
      
      // Força visibilidade dos elementos encontrados
      vlibrasElements.forEach((element, index) => {
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
        `
        
        htmlElement.classList.add('vlibras-debug')
      })
      
      console.log('✅ Visibilidade forçada para todos os elementos VLibras')
    }

    const createFallbackWidget = () => {
      // Remove widgets anteriores
      const existingFallback = document.getElementById('vlibras-fallback-widget')
      if (existingFallback) {
        existingFallback.remove()
      }
      
      // Cria um widget funcional como fallback
      const widget = document.createElement('div')
      widget.id = 'vlibras-fallback-widget'
      widget.className = 'vlibras-fallback-widget'
      widget.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        background: linear-gradient(135deg, #007bff, #0056b3) !important;
        border-radius: 50% !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 4px 15px rgba(0,123,255,0.3) !important;
        transition: all 0.3s ease !important;
        font-size: 24px !important;
        color: white !important;
        border: 2px solid white !important;
      `
      
      widget.innerHTML = '👋'
      widget.title = 'VLibras - Tradução para Libras'
      
      // Adiciona efeito hover
      widget.addEventListener('mouseenter', () => {
        widget.style.transform = 'scale(1.1)'
        widget.style.boxShadow = '0 6px 20px rgba(0,123,255,0.5)'
      })
      
      widget.addEventListener('mouseleave', () => {
        widget.style.transform = 'scale(1)'
        widget.style.boxShadow = '0 4px 15px rgba(0,123,255,0.3)'
      })
      
      // Funcionalidade de clique
      widget.addEventListener('click', () => {
        alert('VLibras - Tradução para Libras\n\nEste é um widget de fallback.\nO VLibras original pode não estar funcionando corretamente neste momento.')
      })
      
      document.body.appendChild(widget)
      console.log('✅ Widget VLibras de fallback criado!')
    }

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeVLibras)
    } else {
      initializeVLibras()
    }

    // Cleanup
    return () => {
      const fallbackWidget = document.getElementById('vlibras-fallback-widget')
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
      Widget: new (url?: string, config?: {
        avatar?: string
        position?: string
        opacity?: number
      }) => any
    }
  }
}
