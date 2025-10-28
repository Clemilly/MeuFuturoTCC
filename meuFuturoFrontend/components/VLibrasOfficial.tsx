'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function VLibrasOfficial() {
  useEffect(() => {
    // Garantir inicialização após o script carregar
    if (typeof window !== 'undefined' && window.VLibras) {
      new window.VLibras.Widget('https://vlibras.gov.br/app')
    }
  }, [])

  const handleLoad = () => {
    if (typeof window !== 'undefined' && window.VLibras) {
      new window.VLibras.Widget('https://vlibras.gov.br/app')
    }
  }

  return (
    <>
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>
      <Script 
        src="https://vlibras.gov.br/app/vlibras-plugin.js" 
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
    </>
  )
}

