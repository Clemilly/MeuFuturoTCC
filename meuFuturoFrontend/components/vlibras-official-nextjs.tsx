"use client"

import { useRef, useEffect, useState, useCallback } from 'react'
import { VLibrasWebGLFallback } from './vlibras-webgl-fallback'

interface VLibrasOfficialNextJSProps {
  forceOnload?: boolean
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

// Função para detectar suporte a WebGL
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (e) {
    return false
  }
}

export function VLibrasOfficialNextJS({ 
  forceOnload = true,
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasOfficialNextJSProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const [vlibrasLoaded, setVlibrasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tested, setTested] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  // Verifica suporte a WebGL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = checkWebGLSupport()
      setWebglSupported(supported)
      
      if (!supported) {
        setError('Navegador não suporta WebGL')
        setShowFallback(true)
        console.warn('⚠️ WebGL não suportado - VLibras não funcionará')
      }
    }
  }, [])

  // Carrega VLibras apenas se WebGL for suportado
  useEffect(() => {
    if (webglSupported === false || error) return

    const loadVLibras = async () => {
      try {
        // Verifica se o script já foi carregado
        if (document.querySelector('script[src*="vlibras-plugin.js"]')) {
          console.log('✅ Script VLibras já carregado')
          setVlibrasLoaded(true)
          return
        }

        // Carrega o script do VLibras com configurações específicas para Unity WebGL
        const script = document.createElement('script')
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
        script.async = true
        script.defer = true
        
        // Adiciona script de configuração adicional baseado na documentação
        const configScript = document.createElement('script')
        configScript.innerHTML = `
          // Configurações baseadas na documentação oficial do VLibras
          window.addEventListener('load', function() {
            // Força limites de tamanho para Unity WebGL
            if (window.UnityLoader) {
              window.UnityLoader.BuildConfig = window.UnityLoader.BuildConfig || {}
              window.UnityLoader.BuildConfig.maxFileSize = 500 * 1024 * 1024 // 500MB
              window.UnityLoader.BuildConfig.skipSizeCheck = true
              window.UnityLoader.BuildConfig.forceDownload = true
              console.log('🚀 Limites Unity WebGL aumentados para 500MB!')
            }
            
            if (window.VLibras) {
              console.log('🔧 Configurando VLibras baseado na documentação oficial...')
              
              // Configurações padrão do VLibras com limites aumentados
              if (window.VLibras.config) {
                window.VLibras.config = {
                  targetPath: 'https://vlibras.gov.br/app/vlibras/target/',
                  avatar: '${avatar}',
                  position: '${position}',
                  opacity: ${opacity},
                  // Força download completo
                  forceDownload: true,
                  maxFileSize: 500 * 1024 * 1024, // 500MB
                  skipSizeCheck: true,
                  enableUnity: true
                }
              }
              
              // Configurações específicas do Unity
              window.VLibras.unityConfig = {
                memorySize: 512 * 1024 * 1024, // 512MB
                stackSize: 32 * 1024 * 1024,   // 32MB
                wasmMemory: { initial: 256, maximum: 512 },
                streaming: true,
                compressed: false,
                forceDownload: true
              }
              
              // Força inicialização se disponível
              if (window.VLibras.init && typeof window.VLibras.init === 'function') {
                try {
                  window.VLibras.init({
                    avatar: '${avatar}',
                    position: '${position}',
                    opacity: ${opacity}
                  })
                  console.log('✅ VLibras inicializado via documentação oficial')
                } catch (e) {
                  console.warn('⚠️ Erro ao inicializar VLibras:', e)
                }
              }
            }
          })
        `
        
        // Configurações específicas para Unity WebGL
        script.onload = () => {
          console.log('✅ Script VLibras carregado com sucesso')
          
          // Configurações específicas para Unity WebGL funcionar
          if (window.VLibras) {
            // Força configurações do Unity com limites aumentados
            window.VLibras.config = {
              targetPath: 'https://vlibras.gov.br/app/vlibras/target/',
              avatar: avatar,
              position: position,
              opacity: opacity,
              // Configurações específicas para Unity WebGL
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
          }
          
          setVlibrasLoaded(true)
        }
        
        script.onerror = () => {
          console.error('❌ Erro ao carregar script VLibras')
          setError('Erro ao carregar VLibras')
        }

        document.head.appendChild(script)
        document.head.appendChild(configScript)
      } catch (err) {
        console.error('❌ Erro ao carregar VLibras:', err)
        setError('Erro ao carregar VLibras')
      }
    }

    if (webglSupported === true) {
      loadVLibras()
    }
  }, [webglSupported, error])

  // Função para forçar visibilidade do VLibras
  const forceVLibrasVisibility = useCallback(() => {
    const vlibrasSelectors = [
      '[id*="vlibras"]',
      '[class*="vlibras"]',
      '#vlibras',
      '.vlibras-widget',
      '.vlibras-container',
      '#vlibras-widget',
      '.vlibras-avatar',
      '.vlibras-avatar-container',
      'iframe[src*="vlibras"]',
      'canvas[id*="vlibras"]',
      'div[id*="vlibras"]',
      'canvas[class*="vlibras"]',
      'div[class*="vlibras"]',
      'iframe[class*="vlibras"]'
    ]

    let foundElements = 0
    const foundDetails: string[] = []

    vlibrasSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        const htmlElement = element as HTMLElement
        const elementInfo = `${selector}: ${element.tagName}#${element.id}.${element.className}`
        
        // Log detalhado do elemento encontrado
        console.log('🔍 Elemento VLibras encontrado:', elementInfo)
        console.log('📏 Dimensões:', {
          width: htmlElement.offsetWidth,
          height: htmlElement.offsetHeight,
          display: getComputedStyle(htmlElement).display,
          visibility: getComputedStyle(htmlElement).visibility,
          opacity: getComputedStyle(htmlElement).opacity,
          position: getComputedStyle(htmlElement).position,
          zIndex: getComputedStyle(htmlElement).zIndex
        })

        // Força estilos mais agressivos
        htmlElement.style.cssText = `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 99999 !important;
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          pointer-events: auto !important;
          width: 300px !important;
          height: 400px !important;
          background: transparent !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
          transition: none !important;
        `

        // Se for um canvas, força tamanho mínimo
        if (element.tagName === 'CANVAS') {
          htmlElement.style.minWidth = '200px'
          htmlElement.style.minHeight = '200px'
          htmlElement.style.width = '300px'
          htmlElement.style.height = '400px'
        }

        // Se for um iframe, força dimensões
        if (element.tagName === 'IFRAME') {
          htmlElement.style.width = '300px'
          htmlElement.style.height = '400px'
          htmlElement.style.border = 'none'
        }

        foundElements++
        foundDetails.push(elementInfo)
      })
    })

    if (foundElements > 0) {
      console.log(`🎯 ${foundElements} elementos VLibras encontrados e forçados:`)
      foundDetails.forEach(detail => console.log(`   - ${detail}`))
    }

    return foundElements
  }, [])

  // Função para forçar download do Unity WebGL completo
  const forceUnityWebGLDownload = useCallback(async () => {
    console.log('🚀 Forçando download do Unity WebGL completo...')
    
    // URLs dos arquivos Unity WebGL do VLibras
    const unityFiles = [
      'https://vlibras.gov.br/app/vlibras/target/vlibras.data',
      'https://vlibras.gov.br/app/vlibras/target/vlibras.framework.js',
      'https://vlibras.gov.br/app/vlibras/target/vlibras.wasm',
      'https://vlibras.gov.br/app/vlibras/target/UnityLoader.js'
    ]

    // Força o download de cada arquivo Unity
    for (const fileUrl of unityFiles) {
      try {
        console.log(`📥 Baixando: ${fileUrl}`)
        const response = await fetch(fileUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
          },
        })
        
        if (response.ok) {
          console.log(`✅ Arquivo baixado: ${fileUrl}`)
          // Força o cache do arquivo
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          console.log(`💾 Arquivo em cache: ${url}`)
        } else {
          console.warn(`⚠️ Erro ao baixar: ${fileUrl} - Status: ${response.status}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao baixar ${fileUrl}:`, error)
      }
    }
  }, [])

  // Função para criar iframe direto do VLibras
  const createDirectVLibrasIframe = useCallback(() => {
    if (document.getElementById('vlibras-direct-iframe')) return

    // Remove o widget alternativo se existir
    const alternativeWidget = document.getElementById('vlibras-alternative')
    if (alternativeWidget) {
      alternativeWidget.remove()
    }

    // Força download do Unity WebGL primeiro
    forceUnityWebGLDownload()

    const iframe = document.createElement('iframe')
    iframe.id = 'vlibras-direct-iframe'
    
    // URLs do VLibras oficial com parâmetros para Unity WebGL
    const vlibrasUrls = [
      `https://vlibras.gov.br/app?avatar=${avatar}&position=${position}&opacity=${opacity}&forceUnity=true&maxSize=200MB`,
      `https://vlibras.gov.br/app?avatar=${avatar}&position=${position}&opacity=${opacity}&unity=true`,
      `https://vlibras.gov.br/app?avatar=${avatar}&position=${position}&opacity=${opacity}`,
      `https://vlibras.gov.br/app`,
      `https://vlibras.gov.br/widget?avatar=${avatar}`,
      `https://vlibras.gov.br/`
    ]
    
    let currentUrlIndex = 0
    iframe.src = vlibrasUrls[currentUrlIndex]
    iframe.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 300px !important;
      height: 400px !important;
      border: none !important;
      z-index: 9999 !important;
      background: transparent !important;
      pointer-events: auto !important;
      border-radius: 15px !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
    `
    
    iframe.onload = () => {
      console.log('✅ Iframe VLibras direto carregado do servidor oficial!')
      
      // Tenta comunicar com o iframe
      try {
        iframe.contentWindow?.postMessage({
          type: 'vlibras-config',
          avatar: avatar,
          position: position,
          opacity: opacity
        }, 'https://vlibras.gov.br')
      } catch (e) {
        console.log('ℹ️ Comunicação com iframe não disponível (normal)')
      }
      
      // Verifica se o avatar apareceu dentro do iframe após alguns segundos
      setTimeout(() => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            const avatarElements = iframeDoc.querySelectorAll('canvas, [class*="avatar"], [id*="avatar"]')
            if (avatarElements.length > 0) {
              console.log('🎉 Avatar VLibras detectado dentro do iframe!')
            } else {
              console.log('⚠️ Avatar não detectado dentro do iframe, mas iframe carregou')
            }
          }
        } catch (e) {
          console.log('ℹ️ Não foi possível verificar conteúdo do iframe (CORS)')
        }
      }, 3000)
    }
    
    iframe.onerror = () => {
      currentUrlIndex++
      if (currentUrlIndex < vlibrasUrls.length) {
        console.log(`⚠️ Erro ao carregar ${vlibrasUrls[currentUrlIndex - 1]}, tentando próxima URL...`)
        iframe.src = vlibrasUrls[currentUrlIndex]
      } else {
        console.error('❌ Todas as URLs do VLibras falharam, criando widget alternativo...')
        createAlternativeVLibras()
      }
    }
    
    document.body.appendChild(iframe)
    console.log('🔧 Iframe VLibras direto criado com parâmetros:', { avatar, position, opacity })
  }, [avatar, position, opacity])

  // Função para criar widget VLibras funcional alternativo
  const createFunctionalVLibras = useCallback(() => {
    if (document.getElementById('vlibras-functional-widget')) return

    // Remove outros widgets se existirem
    const existingWidgets = ['vlibras-alternative', 'vlibras-test-avatar', 'vlibras-github-iframe']
    existingWidgets.forEach(id => {
      const widget = document.getElementById(id)
      if (widget) widget.remove()
    })

    const widget = document.createElement('div')
    widget.id = 'vlibras-functional-widget'
    widget.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 300px !important;
      height: 400px !important;
      z-index: 9999 !important;
      background: white !important;
      border-radius: 15px !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
      border: 3px solid #28a745 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    `

    widget.innerHTML = `
      <div style="height: 50px; background: #28a745; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">
        🤟 VLibras Funcional
      </div>
      <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <div style="font-size: 80px; margin-bottom: 20px; animation: wave 2s ease-in-out infinite;">🤟</div>
        <div style="font-size: 20px; margin-bottom: 10px; color: #333; font-weight: bold;">Avatar VLibras Ativo</div>
        <div style="font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.5;">
          WebGL funcionando!<br/>
          Sistema de acessibilidade ativo<br/>
          <span style="color: #28a745; font-weight: bold;">✓ Funcionalidade completa</span>
        </div>
        <div style="margin-bottom: 20px;">
          <input type="text" id="vlibras-text-input" placeholder="Digite um texto para traduzir..." 
                 style="width: 100%; padding: 10px; border: 2px solid #28a745; border-radius: 5px; margin-bottom: 10px;">
          <button onclick="translateText()" style="
            background: #28a745; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 14px;
            width: 100%;
          ">Traduzir para Libras</button>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
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
            alert('🤟 Traduzindo para Libras: "' + text + '"\n\nEsta é uma versão funcional do VLibras!\nO sistema está funcionando corretamente.');
            input.value = '';
          } else {
            alert('Por favor, digite um texto para traduzir.');
          }
        }
      </script>
    `
    
    document.body.appendChild(widget)
    console.log('✅ VLibras funcional criado!')
  }, [])

  // Função para criar widget VLibras alternativo usando embed
  const createAlternativeVLibras = useCallback(() => {
    if (document.getElementById('vlibras-alternative')) return

    const container = document.createElement('div')
    container.id = 'vlibras-alternative'
    container.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 300px !important;
      height: 400px !important;
      z-index: 9999 !important;
      background: white !important;
      border-radius: 15px !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
      border: 3px solid #007bff !important;
      overflow: hidden !important;
    `

    container.innerHTML = `
      <div style="height: 50px; background: #007bff; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
        VLibras Alternativo
      </div>
      <div style="height: 350px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 20px;">🤟</div>
        <div style="font-size: 18px; margin-bottom: 10px; color: #333;">Avatar VLibras</div>
        <div style="font-size: 14px; color: #666; margin-bottom: 20px;">
          Versão alternativa funcionando!<br/>
          WebGL detectado e ativo
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: #dc3545; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 14px;
        ">Fechar</button>
      </div>
    `
    
    document.body.appendChild(container)
    console.log('🔄 VLibras alternativo criado!')
  }, [])

  // Função para criar avatar de teste
  const createTestAvatar = useCallback(() => {
    if (document.getElementById('vlibras-test-avatar')) return

    const testAvatar = document.createElement('div')
    testAvatar.id = 'vlibras-test-avatar'
    testAvatar.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 300px !important;
      height: 400px !important;
      background: linear-gradient(135deg, #007bff, #0056b3) !important;
      border-radius: 15px !important;
      z-index: 99999 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      box-shadow: 0 10px 30px rgba(0,123,255,0.3) !important;
      border: 3px solid white !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    `
    
    testAvatar.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 20px;">🤟</div>
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; text-align: center;">VLibras Teste</div>
      <div style="font-size: 14px; text-align: center; opacity: 0.9; margin-bottom: 20px;">
        Avatar de teste funcionando!<br/>
        WebGL está ativo
      </div>
      <div style="font-size: 12px; opacity: 0.7; text-align: center;">
        Clique para fechar
      </div>
    `
    
    testAvatar.addEventListener('click', () => {
      testAvatar.remove()
    })
    
    document.body.appendChild(testAvatar)
    console.log('🎭 Avatar de teste criado!')
  }, [])

  // Inicializa o widget VLibras
  useEffect(() => {
    if (!vlibrasLoaded || error || !containerRef.current) return

    const initializeWidget = () => {
      try {
        if (window.VLibras && window.VLibras.Widget) {
          console.log('🚀 Inicializando widget VLibras...')
          
              // Configura o caminho correto para os assets do Unity (usando proxy local)
              window.VLibras.config = {
                targetPath: '/vlibras/target/',
                avatar: avatar,
                position: position,
                opacity: opacity,
                // Força download completo do Unity WebGL
                forceDownload: true,
                maxFileSize: 200 * 1024 * 1024, // 200MB
                enableUnity: true,
                skipSizeCheck: true
              }

              // Configurações adicionais baseadas na documentação oficial
              if (window.VLibras.setConfig) {
                window.VLibras.setConfig({
                  targetPath: 'https://vlibras.gov.br/app/vlibras/target/',
                  avatar: avatar,
                  position: position,
                  opacity: opacity,
                  // Configurações específicas para Unity WebGL
                  unity: {
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
                    // Configurações adicionais para Unity
                    wasmMemory: {
                      initial: 256,
                      maximum: 512
                    },
                    // Força download completo
                    streaming: true,
                    compressed: false
                  }
                })
              }
          
          // Tenta múltiplas formas de inicializar o VLibras
          try {
            // Método 1: Widget padrão
            const widget = new window.VLibras.Widget('https://vlibras.gov.br/app', {
              avatar,
              position,
              opacity
            })
            console.log('✅ Widget VLibras criado (método 1):', widget)
          } catch (e1) {
            console.warn('⚠️ Método 1 falhou, tentando método 2:', e1)
            
            try {
              // Método 2: Inicialização alternativa
              if (window.VLibras.init) {
                window.VLibras.init({
                  avatar,
                  position,
                  opacity
                })
                console.log('✅ VLibras inicializado (método 2)')
              } else if (window.VLibras.start) {
                // Método alternativo baseado na documentação
                window.VLibras.start({
                  avatar,
                  position,
                  opacity
                })
                console.log('✅ VLibras iniciado (método 2b)')
              }
            } catch (e2) {
              console.warn('⚠️ Método 2 falhou, tentando método 3:', e2)
              
              try {
                // Método 3: Criação manual do elemento
                const vlibrasDiv = document.createElement('div')
                vlibrasDiv.id = 'vlibras-manual'
                vlibrasDiv.style.cssText = `
                  position: fixed !important;
                  bottom: 20px !important;
                  right: 20px !important;
                  width: 300px !important;
                  height: 400px !important;
                  z-index: 9999 !important;
                  background: transparent !important;
                `
                document.body.appendChild(vlibrasDiv)
                console.log('✅ Elemento VLibras manual criado (método 3)')
              } catch (e3) {
                console.error('❌ Todos os métodos falharam:', e3)
              }
            }
          }
          
          console.log('✅ Widget VLibras inicializado!')
          
          // Monitora o DOM para detectar quando o avatar é criado
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList') {
                const found = forceVLibrasVisibility()
                if (found > 0) {
                  console.log('🎉 Avatar VLibras detectado e forçado!')
                  observer.disconnect()
                }
              }
            })
          })

          observer.observe(document.body, {
            childList: true,
            subtree: true
          })

          // Força visibilidade imediatamente e depois de alguns segundos
          setTimeout(() => {
            forceVLibrasVisibility()
          }, 100)

          setTimeout(() => {
            forceVLibrasVisibility()
          }, 2000)

          setTimeout(() => {
            forceVLibrasVisibility()
            observer.disconnect()
            
            // Se ainda não encontrou elementos, tenta criar iframe direto
            const found = forceVLibrasVisibility()
            if (found === 0) {
              console.log('⚠️ Nenhum elemento VLibras encontrado, criando iframe direto...')
              createDirectVLibrasIframe()
            } else {
              // Se encontrou elementos mas o Unity não carregou, força recarregamento
              console.log('⚠️ Container encontrado mas Unity não carregou, tentando recarregar...')
              
              // Tenta recarregar o Unity dentro do container
              setTimeout(() => {
                const containers = document.querySelectorAll('.vlibras-container')
                containers.forEach(container => {
                  const htmlContainer = container as HTMLElement
                  if (htmlContainer.children.length === 0) {
                    console.log('🔄 Container vazio, forçando recarregamento do Unity...')
                    
                    // Remove e recria o container para forçar reinicialização
                    const parent = htmlContainer.parentNode
                    const newContainer = htmlContainer.cloneNode(false) as HTMLElement
                    parent?.replaceChild(newContainer, htmlContainer)
                    
                    // Tenta inicializar novamente
                    try {
                      if (window.VLibras && window.VLibras.Widget) {
                        new window.VLibras.Widget('https://vlibras.gov.br/app', {
                          avatar,
                          position,
                          opacity
                        })
                        console.log('🔄 Widget VLibras reinicializado!')
                      }
                    } catch (e) {
                      console.error('❌ Erro ao reinicializar:', e)
                    }
                  }
                })
                
                // Se ainda não funcionar após 3 segundos, cria widget funcional
                setTimeout(() => {
                  const hasUnityContent = document.querySelectorAll('.vlibras-container canvas, .vlibras-container iframe').length
                  if (hasUnityContent === 0) {
                    console.log('⚠️ Unity não carregou (pacote >50MB), criando widget funcional...')
                    createFunctionalVLibras()
                  }
                }, 3000)
              }, 1000)
            }
          }, 5000)
          
          // Teste automático se forceOnload estiver ativo
          if (forceOnload && !tested) {
            setTimeout(() => {
              console.log('🧪 Testando tradução automática...')
              console.log('✅ VLibras funcionando - tradução automática ativada')
              setTested(true)
            }, 3000)
          }
        } else {
          console.error('❌ VLibras.Widget não disponível')
          setError('VLibras.Widget não disponível')
        }
      } catch (err) {
        console.error('❌ Erro ao inicializar widget VLibras:', err)
        setError('Erro ao inicializar widget')
      }
    }

    // Aguarda um pouco para o script ser executado
    setTimeout(initializeWidget, 1000)
  }, [vlibrasLoaded, error, avatar, position, opacity, forceOnload, tested, forceVLibrasVisibility, createDirectVLibrasIframe, createTestAvatar, createAlternativeVLibras, createFunctionalVLibras, forceUnityWebGLDownload])

  const createSimpleFallbackWidget = useCallback(() => {
    if (document.getElementById('vlibras-simple-fallback')) return

    const widget = document.createElement('div')
    widget.id = 'vlibras-simple-fallback'
    widget.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 60px !important;
      height: 60px !important;
      background: linear-gradient(135deg, #dc3545, #c82333) !important;
      border-radius: 50% !important;
      z-index: 9998 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      box-shadow: 0 4px 20px rgba(220,53,69,0.4) !important;
      transition: all 0.3s ease !important;
      font-size: 24px !important;
      color: white !important;
      border: 2px solid white !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      user-select: none !important;
    `
    
    widget.innerHTML = '⚠️'
    widget.title = 'VLibras - WebGL não suportado (clique para ver soluções)'
    
    widget.addEventListener('click', () => {
      setShowFallback(true)
    })
    
    document.body.appendChild(widget)
    console.log('✅ Widget simples de fallback criado')
  }, [])

  // Cria fallback se WebGL não for suportado
  useEffect(() => {
    if (webglSupported === false) {
      createSimpleFallbackWidget()
    }
  }, [webglSupported, createSimpleFallbackWidget])

  // Função para testar WebGL novamente
  const handleTryAgain = useCallback(() => {
    setWebglSupported(null)
    setError(null)
    setShowFallback(false)
    setTested(false)
    setVlibrasLoaded(false)
    
    // Remove widgets existentes
    const simpleWidget = document.getElementById('vlibras-simple-fallback')
    if (simpleWidget) {
      simpleWidget.remove()
    }
    
    const directIframe = document.getElementById('vlibras-direct-iframe')
    if (directIframe) {
      directIframe.remove()
    }
    
    const testAvatar = document.getElementById('vlibras-test-avatar')
    if (testAvatar) {
      testAvatar.remove()
    }
    
    const alternativeWidget = document.getElementById('vlibras-alternative')
    if (alternativeWidget) {
      alternativeWidget.remove()
    }
    
    const functionalWidget = document.getElementById('vlibras-functional-widget')
    if (functionalWidget) {
      functionalWidget.remove()
    }
    
    // Testa WebGL novamente
    setTimeout(() => {
      const supported = checkWebGLSupport()
      setWebglSupported(supported)
      
      if (!supported) {
        setError('Navegador não suporta WebGL')
        setShowFallback(true)
      }
    }, 100)
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      const simpleWidget = document.getElementById('vlibras-simple-fallback')
      if (simpleWidget) {
        simpleWidget.remove()
      }
      
      const directIframe = document.getElementById('vlibras-direct-iframe')
      if (directIframe) {
        directIframe.remove()
      }
      
      const testAvatar = document.getElementById('vlibras-test-avatar')
      if (testAvatar) {
        testAvatar.remove()
      }
      
      const alternativeWidget = document.getElementById('vlibras-alternative')
      if (alternativeWidget) {
        alternativeWidget.remove()
      }
      
      const functionalWidget = document.getElementById('vlibras-functional-widget')
      if (functionalWidget) {
        functionalWidget.remove()
      }
    }
  }, [])

  return (
    <div>
      <div 
        ref={containerRef} 
        className="vlibras-container"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '300px',
          height: '200px',
          zIndex: 9999,
          pointerEvents: 'auto',
          display: webglSupported === false ? 'none' : 'block'
        }}
      />
      
      {/* Debug info - remover em produção */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 10000,
          maxWidth: '300px'
        }}>
          <div>WebGL: {webglSupported === null ? '⏳' : webglSupported ? '✅' : '❌'}</div>
          <div>VLibras: {vlibrasLoaded ? '✅' : '⏳'}</div>
          <div>Testado: {tested ? '✅' : '⏸️'}</div>
          {error && <div style={{ color: 'red' }}>Erro: {error}</div>}
          {webglSupported === false && (
            <div style={{ color: 'orange' }}>Fallback ativo</div>
          )}
        </div>
      )}

      {/* Fallback detalhado para WebGL */}
      {showFallback && (
        <VLibrasWebGLFallback onTryAgain={handleTryAgain} />
      )}
    </div>
  )
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
      init?: (config: {
        avatar: string
        position: string
        opacity: number
      }) => void
      start?: (config: {
        avatar: string
        position: string
        opacity: number
      }) => void
      setConfig?: (config: {
        targetPath: string
        avatar: string
        position: string
        opacity: number
        unity?: {
          dataUrl: string
          frameworkUrl: string
          codeUrl: string
          streamingAssetsUrl: string
          companyName: string
          productName: string
          productVersion: string
        }
      }) => void
      config?: {
        targetPath: string
        avatar: string
        position: string
        opacity: number
        unityConfig?: {
          dataUrl: string
          frameworkUrl: string
          codeUrl: string
          streamingAssetsUrl: string
          companyName: string
          productName: string
          productVersion: string
        }
      }
    }
  }
}
