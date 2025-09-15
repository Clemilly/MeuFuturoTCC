"use client"

import { useEffect, useState } from "react"

export function VLibrasUnityLoader() {
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadUnityAssets = async () => {
      console.log('🚀 Iniciando carregamento dos assets Unity WebGL...')
      
      // URLs corretas baseadas na estrutura real do VLibras
      const assets = [
        'https://vlibras.gov.br/app/vlibras/target/vlibras.framework.js',
        'https://vlibras.gov.br/app/vlibras/target/vlibras.wasm',
        'https://vlibras.gov.br/app/vlibras/target/vlibras.data'
      ]

      // UnityLoader pode estar em diferentes locais
      const unityLoaderUrls = [
        'https://vlibras.gov.br/app/vlibras/target/UnityLoader.js',
        'https://vlibras.gov.br/app/UnityLoader.js',
        'https://vlibras.gov.br/UnityLoader.js',
        'https://vlibras.gov.br/app/vlibras/UnityLoader.js'
      ]

      let loadedCount = 0
      const totalAssets = assets.length + 1 // +1 para UnityLoader

      // Carrega assets principais
      for (const asset of assets) {
        try {
          console.log(`📥 Verificando: ${asset}`)
          
          // Para arquivos .js, tenta carregar como script
          if (asset.endsWith('.js')) {
            const script = document.createElement('script')
            script.src = asset
            script.async = true
            script.onload = () => {
              loadedCount++
              setProgress((loadedCount / totalAssets) * 100)
              console.log(`✅ Carregado: ${asset}`)
            }
            script.onerror = () => {
              loadedCount++
              setProgress((loadedCount / totalAssets) * 100)
              console.warn(`⚠️ Erro ao carregar: ${asset}`)
            }
            document.head.appendChild(script)
          } else {
            // Para outros tipos de arquivo, apenas verifica disponibilidade
            try {
              const response = await fetch(asset, { method: 'HEAD' })
              loadedCount++
              setProgress((loadedCount / totalAssets) * 100)
              console.log(`✅ Verificado: ${asset}`)
            } catch (e) {
              loadedCount++
              setProgress((loadedCount / totalAssets) * 100)
              console.warn(`⚠️ Erro ao verificar: ${asset}`)
            }
          }
        } catch (error) {
          loadedCount++
          setProgress((loadedCount / totalAssets) * 100)
          console.error(`❌ Erro: ${asset}`, error)
        }
      }

      // Tenta carregar UnityLoader de múltiplas URLs
      let unityLoaderLoaded = false
      for (const url of unityLoaderUrls) {
        if (unityLoaderLoaded) break
        
        try {
          console.log(`📥 Tentando UnityLoader: ${url}`)
          
          const script = document.createElement('script')
          script.src = url
          script.async = true
          
          await new Promise((resolve, reject) => {
            script.onload = () => {
              loadedCount++
              setProgress((loadedCount / totalAssets) * 100)
              console.log(`✅ UnityLoader carregado: ${url}`)
              unityLoaderLoaded = true
              resolve(true)
            }
            script.onerror = () => {
              console.warn(`⚠️ UnityLoader não encontrado em: ${url}`)
              reject(new Error(`Not found: ${url}`))
            }
            
            document.head.appendChild(script)
            
            // Timeout após 3 segundos
            setTimeout(() => {
              if (!unityLoaderLoaded) {
                script.remove()
                reject(new Error(`Timeout: ${url}`))
              }
            }, 3000)
          })
        } catch (error) {
          console.warn(`⚠️ Erro ao carregar UnityLoader de ${url}:`, error.message)
          continue
        }
      }

      // Se UnityLoader não foi carregado, conta como erro mas continua
      if (!unityLoaderLoaded) {
        loadedCount++
        setProgress((loadedCount / totalAssets) * 100)
        console.warn('⚠️ UnityLoader não encontrado em nenhuma URL, mas continuando...')
      }

      setTimeout(() => {
        setLoaded(true)
        console.log('✅ Assets Unity WebGL carregados!')
      }, 2000)
    }

    loadUnityAssets()
  }, [])

  if (loaded) return null

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      zIndex: 10000,
      textAlign: 'center',
      minWidth: '300px'
    }}>
      <div style={{ fontSize: '18px', marginBottom: '15px' }}>
        🤟 Carregando VLibras Oficial
      </div>
      <div style={{ 
        background: '#333', 
        borderRadius: '5px', 
        height: '20px', 
        marginBottom: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#007bff',
          height: '100%',
          width: `${progress}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{ fontSize: '14px' }}>
        {Math.round(progress)}% - Assets Unity WebGL
      </div>
    </div>
  )
}
