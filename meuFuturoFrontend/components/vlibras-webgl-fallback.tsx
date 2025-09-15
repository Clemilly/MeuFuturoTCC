"use client"

import { useState, useEffect } from 'react'

interface VLibrasWebGLFallbackProps {
  onTryAgain?: () => void
}

export function VLibrasWebGLFallback({ onTryAgain }: VLibrasWebGLFallbackProps) {
  const [showSolutions, setShowSolutions] = useState(false)
  const [browserInfo, setBrowserInfo] = useState<{
    name: string
    version: string
    os: string
  }>({ name: '', version: '', os: '' })

  useEffect(() => {
    // Detecta informações do navegador
    const userAgent = navigator.userAgent
    let browserName = 'Navegador'
    let browserVersion = ''
    let os = ''

    if (userAgent.includes('Chrome')) {
      browserName = 'Google Chrome'
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Mozilla Firefox'
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari'
      const match = userAgent.match(/Version\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : ''
    }

    if (userAgent.includes('Mac')) {
      os = 'macOS'
    } else if (userAgent.includes('Windows')) {
      os = 'Windows'
    } else if (userAgent.includes('Linux')) {
      os = 'Linux'
    }

    setBrowserInfo({ name: browserName, version: browserVersion, os })
  }, [])

  const getChromeInstructions = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-blue-600">Google Chrome:</h4>
      <ol className="list-decimal list-inside space-y-2 text-sm">
        <li>Digite <code className="bg-gray-100 px-1 rounded">chrome://settings</code> na barra de endereços</li>
        <li>Role até a seção <strong>"Sistema"</strong></li>
        <li>Ative <strong>"Usar aceleração de hardware quando disponível"</strong></li>
        <li>Reinicie o Chrome</li>
        <li>Teste em: <a href="https://get.webgl.org" target="_blank" className="text-blue-500 underline">get.webgl.org</a></li>
      </ol>
    </div>
  )

  const getFirefoxInstructions = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-orange-600">Mozilla Firefox:</h4>
      <ol className="list-decimal list-inside space-y-2 text-sm">
        <li>Digite <code className="bg-gray-100 px-1 rounded">about:config</code> na barra de endereços</li>
        <li>Pesquise por <code className="bg-gray-100 px-1 rounded">webgl.disabled</code></li>
        <li>Certifique-se que está como <strong>false</strong></li>
        <li>Pesquise por <code className="bg-gray-100 px-1 rounded">webgl.force-enabled</code></li>
        <li>Defina como <strong>true</strong></li>
        <li>Reinicie o Firefox</li>
      </ol>
    </div>
  )

  const getSafariInstructions = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-600">Safari:</h4>
      <ol className="list-decimal list-inside space-y-2 text-sm">
        <li>Abra o Safari</li>
        <li>Vá em <strong>Safari → Preferências</strong></li>
        <li>Clique na aba <strong>"Avançado"</strong></li>
        <li>Marque <strong>"Mostrar menu Desenvolver"</strong></li>
        <li>Vá em <strong>Desenvolver → Habilitar WebGL</strong></li>
        <li>Reinicie o Safari</li>
      </ol>
    </div>
  )

  const getMacOSInstructions = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800">macOS específico:</h4>
      <ol className="list-decimal list-inside space-y-2 text-sm">
        <li>Atualize o macOS: <strong>Apple Menu → Sobre este Mac → Atualização de Software</strong></li>
        <li>Verifique se não há extensões bloqueando WebGL</li>
        <li>Teste em modo de navegação privada</li>
        <li>Se usar MacBook Pro/MacBook Air, verifique se não está em modo de economia de energia</li>
      </ol>
    </div>
  )

  return (
    <div className="fixed bottom-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-2xl">⚠️</div>
        <div>
          <h3 className="font-semibold text-gray-800">WebGL Não Suportado</h3>
          <p className="text-sm text-gray-600">VLibras precisa de WebGL para funcionar</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-xs text-gray-500">
          <strong>Navegador:</strong> {browserInfo.name} {browserInfo.version}<br/>
          <strong>Sistema:</strong> {browserInfo.os}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setShowSolutions(!showSolutions)}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          {showSolutions ? 'Ocultar' : 'Ver'} Soluções
        </button>

        {showSolutions && (
          <div className="space-y-4 text-xs border-t pt-3">
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="font-semibold text-yellow-800 mb-2">Soluções Rápidas:</p>
              <ul className="space-y-1 text-yellow-700">
                <li>• Atualize seu navegador</li>
                <li>• Reinicie o navegador</li>
                <li>• Teste em modo privado</li>
                <li>• Desative extensões temporariamente</li>
              </ul>
            </div>

            {browserInfo.name.includes('Chrome') && getChromeInstructions()}
            {browserInfo.name.includes('Firefox') && getFirefoxInstructions()}
            {browserInfo.name.includes('Safari') && getSafariInstructions()}
            {browserInfo.os === 'macOS' && getMacOSInstructions()}

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="font-semibold text-blue-800 mb-2">Teste WebGL:</p>
              <a 
                href="https://get.webgl.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Visite get.webgl.org para testar
              </a>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={onTryAgain}
            className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
          >
            Testar Novamente
          </button>
          <button
            onClick={() => setShowSolutions(false)}
            className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
