"use client"

import { useEffect } from 'react'

interface VLibrasFinalProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasFinal({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasFinalProps) {
  
  useEffect(() => {
    // Verifica se já está no servidor
    if (typeof window === 'undefined') return

    const initializeFinalVLibras = () => {
      try {
        console.log('🚀 Inicializando VLibras Final...')
        
        // Remove elementos anteriores
        cleanupPreviousVLibras()
        
        // Implementa o VLibras de forma mais direta
        implementDirectVLibras()
        
      } catch (error) {
        console.error('❌ Erro ao inicializar VLibras Final:', error)
        createFinalFallback()
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

    const implementDirectVLibras = () => {
      // Cria um script inline que implementa o VLibras de forma mais direta
      const inlineScript = document.createElement('script')
      inlineScript.innerHTML = `
        (function() {
          console.log('🔧 Executando implementação direta do VLibras...');
          
          // Cria o container do VLibras
          const vlibrasContainer = document.createElement('div');
          vlibrasContainer.id = 'vlibras-direct-widget';
          vlibrasContainer.style.cssText = \`
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 60px !important;
            height: 60px !important;
            z-index: 9999 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          \`;
          
          // Cria o iframe do VLibras
          const vlibrasIframe = document.createElement('iframe');
          vlibrasIframe.src = 'https://vlibras.gov.br/app';
          vlibrasIframe.style.cssText = \`
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            background: transparent !important;
            pointer-events: auto !important;
          \`;
          vlibrasIframe.title = 'VLibras - Tradução para Libras';
          
          vlibrasContainer.appendChild(vlibrasIframe);
          document.body.appendChild(vlibrasContainer);
          
          console.log('✅ VLibras direto implementado!');
          
          // Tenta carregar o script oficial também
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@dev/app/vlibras-plugin.js';
          script.async = true;
          script.defer = true;
          
          script.onload = function() {
            console.log('✅ Script oficial carregado após implementação direta');
            
            // Aguarda e tenta usar o widget oficial
            setTimeout(function() {
              if (window.VLibras && window.VLibras.Widget) {
                try {
                  console.log('🎯 Tentando widget oficial após implementação direta...');
                  const widget = new window.VLibras.Widget('https://vlibras.gov.br/app', {
                    avatar: '${avatar}',
                    position: '${position}',
                    opacity: ${opacity}
                  });
                  console.log('✅ Widget oficial criado após implementação direta:', widget);
                  
                  // Se o widget oficial funcionou, remove o direto
                  setTimeout(function() {
                    const officialElements = document.querySelectorAll('[id*="vlibras"]:not(#vlibras-direct-widget), [class*="vlibras"]');
                    if (officialElements.length > 0) {
                      console.log('🎉 Widget oficial funcionando! Removendo implementação direta...');
                      const directWidget = document.getElementById('vlibras-direct-widget');
                      if (directWidget) {
                        directWidget.remove();
                      }
                    }
                  }, 3000);
                  
                } catch (error) {
                  console.warn('⚠️ Widget oficial falhou após implementação direta:', error);
                }
              }
            }, 2000);
          };
          
          script.onerror = function() {
            console.warn('⚠️ Script oficial falhou, mantendo implementação direta');
          };
          
          document.head.appendChild(script);
          
        })();
      `
      
      document.head.appendChild(inlineScript)
      console.log('✅ Script inline VLibras adicionado')
    }

    const createFinalFallback = () => {
      if (document.getElementById('vlibras-final-fallback')) return
      
      console.log('🔧 Criando fallback final do VLibras...')
      
      const widget = document.createElement('div')
      widget.id = 'vlibras-final-fallback'
      widget.className = 'vlibras-final-fallback'
      widget.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 70px !important;
        height: 70px !important;
        background: linear-gradient(135deg, #fd7e14, #e55a00) !important;
        border-radius: 50% !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 4px 20px rgba(253,126,20,0.4) !important;
        transition: all 0.3s ease !important;
        font-size: 28px !important;
        color: white !important;
        border: 3px solid white !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        user-select: none !important;
      `
      
      widget.innerHTML = '🚀'
      widget.title = 'VLibras Final - Implementação Completa'
      
      // Efeitos visuais
      widget.addEventListener('mouseenter', () => {
        widget.style.transform = 'scale(1.15)'
        widget.style.boxShadow = '0 8px 25px rgba(253,126,20,0.6)'
      })
      
      widget.addEventListener('mouseleave', () => {
        widget.style.transform = 'scale(1)'
        widget.style.boxShadow = '0 4px 20px rgba(253,126,20,0.4)'
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
          max-width: 600px !important;
          text-align: center !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
        `
        
        modalContent.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
          <h3 style="margin: 0 0 15px 0; color: #fd7e14; font-size: 24px;">VLibras Final</h3>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
            Implementação completa do VLibras com múltiplas estratégias.
            <br><br>
            <strong>Estratégias implementadas:</strong><br>
            • Implementação direta com iframe<br>
            • Script oficial do CDN<br>
            • Widget oficial como fallback<br>
            • Fallback visual final
          </p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
            <strong>Status atual:</strong><br>
            • Elementos VLibras no DOM: ${document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]').length}<br>
            • Script carregado: ${document.querySelector('script[src*="vlibras"]') ? '✅' : '❌'}<br>
            • VLibras disponível: ${typeof window !== 'undefined' && window.VLibras ? '✅' : '❌'}
          </div>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="location.reload()" style="
              background: #fd7e14 !important;
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
      console.log('✅ Fallback final criado!')
    }

    // Inicializa
    initializeFinalVLibras()

    // Cleanup
    return () => {
      const directWidget = document.getElementById('vlibras-direct-widget')
      if (directWidget) {
        directWidget.remove()
      }
      const finalFallback = document.getElementById('vlibras-final-fallback')
      if (finalFallback) {
        finalFallback.remove()
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
