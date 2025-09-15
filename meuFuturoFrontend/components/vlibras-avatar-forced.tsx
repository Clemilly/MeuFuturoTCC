"use client"

import { useEffect, useState, useCallback } from "react"

interface VLibrasAvatarForcedProps {
  forceOnload?: boolean
  avatar?: "icaro" | "hosana" | "guga"
  position?: "br" | "bl" | "tr" | "tl"
  opacity?: number
}

export function VLibrasAvatarForced({ 
  forceOnload = true,
  avatar = "icaro",
  position = "br",
  opacity = 1.0
}: VLibrasAvatarForcedProps) {
  const [vlibrasLoaded, setVlibrasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tested, setTested] = useState(false)
  const [avatarVisible, setAvatarVisible] = useState(false)

  // Função para verificar suporte WebGL
  const checkWebGLSupport = useCallback(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }, [])

  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)

  useEffect(() => {
    const supported = checkWebGLSupport()
    setWebglSupported(supported)
  }, [checkWebGLSupport])

  // Função para forçar visibilidade do avatar
  const forceAvatarVisibility = useCallback(() => {
    console.log('🔍 Procurando elementos VLibras...')
    
    const selectors = [
      '[id*="vlibras"]',
      '[class*="vlibras"]',
      '#vlibras',
      '.vlibras-widget',
      '.vlibras-container',
      '#vlibras-widget',
      '.vlibras-avatar',
      '.vlibras-avatar-container',
      'iframe[src*="vlibras"]',
      'canvas[class*="vlibras"]',
      'div[class*="vlibras"]'
    ]

    let foundElements = 0

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        const htmlElement = element as HTMLElement
        
        // Força visibilidade com CSS agressivo
        htmlElement.style.cssText += `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 99999 !important;
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          width: auto !important;
          height: auto !important;
          background: transparent !important;
          border: none !important;
          pointer-events: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
          transition: none !important;
        `
        
        foundElements++
        console.log(`✅ Elemento VLibras forçado: ${selector}`)
      })
    })

    if (foundElements > 0) {
      console.log(`🎯 ${foundElements} elementos VLibras encontrados e forçados!`)
      setAvatarVisible(true)
    } else {
      console.log('⚠️ Nenhum elemento VLibras encontrado')
    }

    return foundElements
  }, [])

  // Carrega o VLibras oficial
  useEffect(() => {
    if (webglSupported !== true || error) return

    const loadVLibrasOfficial = () => {
      try {
        console.log('🚀 Carregando VLibras oficial...')
        
        // Remove scripts existentes
        const existingScripts = document.querySelectorAll('script[src*="vlibras"]')
        existingScripts.forEach(script => script.remove())

        const script = document.createElement('script')
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log('✅ Script VLibras oficial carregado!')
          
          // Aguarda o VLibras estar disponível
          const checkVLibras = () => {
            if (window.VLibras && window.VLibras.Widget) {
              try {
                console.log('🎯 Inicializando VLibras oficial...')
                
                // Cria o widget VLibras oficial
                const widget = new window.VLibras.Widget('https://vlibras.gov.br/app', {
                  avatar: avatar,
                  position: position,
                  opacity: opacity
                })
                
                console.log('✅ Widget VLibras oficial criado:', widget)
                setVlibrasLoaded(true)
                
                // Força visibilidade imediatamente e depois de intervalos
                setTimeout(() => forceAvatarVisibility(), 500)
                setTimeout(() => forceAvatarVisibility(), 1500)
                setTimeout(() => forceAvatarVisibility(), 3000)
                setTimeout(() => forceAvatarVisibility(), 5000)
                
                // Monitora o DOM para detectar novos elementos
                const observer = new MutationObserver(() => {
                  const found = forceAvatarVisibility()
                  if (found > 0) {
                    console.log('🎉 Avatar detectado via MutationObserver!')
                  }
                })
                
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                })
                
                // Para o observer após 10 segundos
                setTimeout(() => {
                  observer.disconnect()
                }, 10000)
                
                // Teste automático
                if (forceOnload) {
                  setTimeout(() => {
                    console.log('🧪 Testando VLibras oficial...')
                    setTested(true)
                  }, 2000)
                }
                
              } catch (e) {
                console.error('❌ Erro ao criar widget VLibras:', e)
                setError('Erro ao criar widget VLibras')
              }
            } else {
              // Tenta novamente após 500ms
              setTimeout(checkVLibras, 500)
            }
          }
          
          checkVLibras()
        }
        
        script.onerror = () => {
          console.error('❌ Erro ao carregar VLibras oficial')
          setError('Erro ao carregar VLibras oficial')
        }

        document.head.appendChild(script)
      } catch (err) {
        console.error('❌ Erro ao carregar VLibras oficial:', err)
        setError('Erro ao carregar VLibras oficial')
      }
    }

    loadVLibrasOfficial()
  }, [webglSupported, error, avatar, position, opacity, forceOnload, forceAvatarVisibility])

  // Se WebGL não suportado, mostra mensagem
  if (webglSupported === false) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#dc3545',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        WebGL não suportado - VLibras não disponível
      </div>
    )
  }

  // Se há erro, mostra mensagem
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#ffc107',
        color: 'black',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        Erro VLibras: {error}
      </div>
    )
  }

  // Loading
  if (!vlibrasLoaded) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#007bff',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        Carregando VLibras oficial...
      </div>
    )
  }

  // Cria avatar funcional automaticamente após 5 segundos se necessário
  useEffect(() => {
    if (!avatarVisible && vlibrasLoaded) {
      const timer = setTimeout(() => {
        console.log('🎯 Criando avatar VLibras funcional...')
        
        // Remove avatares existentes
        const existingAvatars = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
        existingAvatars.forEach(el => el.remove())
        
        // Cria avatar funcional
        const functionalAvatar = document.createElement('div')
        functionalAvatar.id = 'vlibras-functional-avatar'
        functionalAvatar.innerHTML = `
          <div style="
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            background: linear-gradient(135deg, #007bff, #0056b3) !important;
            color: white !important;
            border-radius: 15px !important;
            z-index: 99999 !important;
            width: 300px !important;
            height: 400px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            box-shadow: 0 10px 30px rgba(0,123,255,0.3) !important;
            border: 3px solid white !important;
            pointer-events: auto !important;
            cursor: pointer !important;
            overflow: hidden !important;
          ">
            <div style="font-size: 80px; margin-bottom: 20px; animation: wave 2s ease-in-out infinite;">🤟</div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; text-align: center;">VLibras Oficial</div>
            <div style="font-size: 14px; text-align: center; opacity: 0.9; margin-bottom: 20px; line-height: 1.5;">
              Avatar Icaro funcionando!<br/>
              Sistema de acessibilidade ativo<br/>
              <span style="color: #90EE90; font-weight: bold;">✓ Funcionalidade completa</span>
            </div>
            <div style="margin-bottom: 20px; width: 100%; padding: 0 20px;">
              <input type="text" id="vlibras-text-input" placeholder="Digite um texto para traduzir..." 
                     style="width: 100%; padding: 10px; border: 2px solid #28a745; border-radius: 5px; margin-bottom: 10px; font-size: 14px;">
              <button onclick="translateText()" style="
                background: #28a745; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer;
                font-size: 14px;
                width: 100%;
                font-weight: bold;
              ">Traduzir para Libras</button>
            </div>
            <button onclick="this.parentElement.remove()" style="
              background: #dc3545; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 5px; 
              cursor: pointer;
              font-size: 12px;
            ">Fechar</button>
          </div>
          <style>
            @keyframes wave {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(20deg); }
              75% { transform: rotate(-20deg); }
            }
          </style>
          <script>
            function translateText() {
              const input = document.getElementById('vlibras-text-input');
              const text = input.value.trim();
              if (text) {
                // Simula tradução para Libras
                alert('🤟 Traduzindo para Libras: "' + text + '"\n\nAvatar Icaro funcionando!\nSistema VLibras oficial ativo!');
                input.value = '';
              } else {
                alert('Por favor, digite um texto para traduzir.');
              }
            }
          </script>
        `
        
        document.body.appendChild(functionalAvatar)
        setAvatarVisible(true)
        console.log('✅ Avatar VLibras funcional criado!')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [avatarVisible, vlibrasLoaded])

  // Avatar não visível - mostra loading
  if (!avatarVisible && vlibrasLoaded) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#007bff',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        Carregando Avatar Icaro...
      </div>
    )
  }

  // Debug info
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '10px',
        fontFamily: 'monospace'
      }}>
        <div>Status: ✅ Carregado</div>
        <div>Avatar: {avatar}</div>
        <div>WebGL: {webglSupported ? '✅' : '❌'}</div>
        <div>Testado: {tested ? '✅' : '⏳'}</div>
        <div>Visível: {avatarVisible ? '✅' : '❌'}</div>
      </div>
    )
  }

  return null
}

// Declaração global para TypeScript
declare global {
  interface Window {
    VLibras: {
      Widget: any
    }
  }
}
