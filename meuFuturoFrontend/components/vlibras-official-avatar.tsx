"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface VLibrasOfficialAvatarProps {
  forceOnload?: boolean
  avatar?: "icaro" | "hosana" | "guga"
  position?: "br" | "bl" | "tr" | "tl"
  opacity?: number
}

export function VLibrasOfficialAvatar({ 
  forceOnload = true,
  avatar = "icaro",
  position = "br",
  opacity = 1.0
}: VLibrasOfficialAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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

  // Carrega o VLibras oficial
  useEffect(() => {
    if (webglSupported !== true || error) return

    const loadVLibras = () => {
      try {
        console.log('🚀 Carregando VLibras oficial com avatar:', avatar)
        
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
          
          // Configura o VLibras oficial
          if (window.VLibras) {
            // Configurações para avatar oficial
            window.VLibras.config = {
              avatar: avatar,
              position: position,
              opacity: opacity,
              // Configurações Unity WebGL
              targetPath: 'https://vlibras.gov.br/app/vlibras/target/',
              unityConfig: {
                dataUrl: 'https://vlibras.gov.br/app/vlibras/target/vlibras.data',
                frameworkUrl: 'https://vlibras.gov.br/app/vlibras/target/vlibras.framework.js',
                codeUrl: 'https://vlibras.gov.br/app/vlibras/target/vlibras.wasm',
                streamingAssetsUrl: 'https://vlibras.gov.br/app/vlibras/target/StreamingAssets',
                companyName: 'VLibras',
                productName: 'VLibras',
                productVersion: '1.0.0',
                // Configurações para arquivos grandes
                memorySize: 512 * 1024 * 1024, // 512MB
                stackSize: 32 * 1024 * 1024,   // 32MB
                forceDownload: true,
                maxFileSize: 500 * 1024 * 1024, // 500MB
                skipSizeCheck: true,
                wasmMemory: { initial: 256, maximum: 512 },
                streaming: true,
                compressed: false
              }
            }
            
            // Inicializa o VLibras oficial
            setTimeout(() => {
              try {
                if (window.VLibras.Widget) {
                  const widget = new window.VLibras.Widget('https://vlibras.gov.br/app', {
                    avatar: avatar,
                    position: position,
                    opacity: opacity
                  })
                  console.log('✅ Widget VLibras oficial criado:', widget)
                }
                
                if (window.VLibras.init) {
                  window.VLibras.init({
                    avatar: avatar,
                    position: position,
                    opacity: opacity
                  })
                  console.log('✅ VLibras oficial inicializado!')
                }
                
                setVlibrasLoaded(true)
                
                // Teste automático
                if (forceOnload) {
                  setTimeout(() => {
                    console.log('🧪 Testando VLibras oficial...')
                    setTested(true)
                  }, 3000)
                }
              } catch (e) {
                console.error('❌ Erro ao inicializar VLibras oficial:', e)
                setError('Erro ao inicializar VLibras oficial')
              }
            }, 1000)
          }
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

    loadVLibras()
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
      config: any
      Widget: any
      init: any
    }
  }
}
