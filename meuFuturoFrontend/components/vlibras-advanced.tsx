"use client"

import { useVLibras } from '@/hooks/use-vlibras'

interface VLibrasAdvancedProps {
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
  forceOnload?: boolean
  showDebugInfo?: boolean
}

export function VLibrasAdvanced({ 
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0,
  forceOnload = true,
  showDebugInfo = false
}: VLibrasAdvancedProps) {
  const { 
    isLoaded, 
    isActive, 
    hasError, 
    error, 
    toggleVLibras, 
    reinitVLibras 
  } = useVLibras({
    avatar,
    position,
    opacity,
    forceOnload
  })

  return (
    <>
      {/* Widget container */}
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>

      {/* Debug info (apenas em desenvolvimento) */}
      {showDebugInfo && process.env.NODE_ENV === 'development' && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 10, 
            right: 10, 
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        >
          <div><strong>VLibras Debug Info:</strong></div>
          <div>Status: {isLoaded ? 'Carregado' : 'Carregando...'}</div>
          <div>Ativo: {isActive ? 'Sim' : 'Não'}</div>
          <div>Avatar: {avatar}</div>
          <div>Posição: {position}</div>
          <div>Opacidade: {opacity}</div>
          {hasError && <div style={{ color: '#ff6b6b' }}>Erro: {error}</div>}
          <div style={{ marginTop: '5px' }}>
            <button 
              onClick={toggleVLibras}
              style={{ 
                marginRight: '5px', 
                padding: '2px 5px', 
                fontSize: '10px' 
              }}
            >
              Toggle
            </button>
            <button 
              onClick={reinitVLibras}
              style={{ 
                padding: '2px 5px', 
                fontSize: '10px' 
              }}
            >
              Reiniciar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
