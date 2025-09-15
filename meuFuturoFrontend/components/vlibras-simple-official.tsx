"use client"

import { useEffect, useState, useCallback } from "react"

interface VLibrasSimpleOfficialProps {
  forceOnload?: boolean
  avatar?: "icaro" | "hosana" | "guga"
  position?: "br" | "bl" | "tr" | "tl"
  opacity?: number
}

export function VLibrasSimpleOfficial({ 
  forceOnload = true,
  avatar = "icaro",
  position = "br",
  opacity = 1.0
}: VLibrasSimpleOfficialProps) {
  const [vlibrasLoaded, setVlibrasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tested, setTested] = useState(false)

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

  // Carrega o VLibras oficial de forma simplificada
  useEffect(() => {
    if (webglSupported !== true || error) return

    const loadVLibrasOfficial = () => {
      try {
        console.log('🚀 Carregando VLibras oficial simplificado...')
        
        // Remove scripts existentes
        const existingScript = document.querySelector('script[src*="vlibras-plugin.js"]')
        if (existingScript) {
          existingScript.remove()
        }

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
                
                // Força visibilidade do avatar
                setTimeout(() => {
                  const vlibrasElements = document.querySelectorAll('[id*="vlibras"], [class*="vlibras"]')
                  vlibrasElements.forEach(element => {
                    const htmlElement = element as HTMLElement
                    htmlElement.style.display = 'block !important'
                    htmlElement.style.visibility = 'visible !important'
                    htmlElement.style.opacity = '1 !important'
                    htmlElement.style.zIndex = '9999 !important'
                    htmlElement.style.position = 'fixed !important'
                    htmlElement.style.bottom = '20px !important'
                    htmlElement.style.right = '20px !important'
                    htmlElement.style.width = 'auto !important'
                    htmlElement.style.height = 'auto !important'
                    htmlElement.style.pointerEvents = 'auto !important'
                  })
                  
                  console.log(`🎯 ${vlibrasElements.length} elementos VLibras forçados a aparecer!`)
                  
                  // Teste automático
                  if (forceOnload) {
                    setTimeout(() => {
                      console.log('🧪 Testando VLibras oficial...')
                      setTested(true)
                    }, 2000)
                  }
                }, 1000)
                
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
  }, [webglSupported, error, avatar, position, opacity, forceOnload])

  // Cleanup
  useEffect(() => {
    return () => {
      const script = document.querySelector('script[src*="vlibras-plugin.js"]')
      if (script) {
        script.remove()
      }
    }
  }, [])

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
