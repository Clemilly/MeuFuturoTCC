"use client"

import { useEffect } from "react"

export function SkipLinks() {
  useEffect(() => {
    // Adiciona suporte a atalhos de teclado globais
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + S para pular para conteúdo principal
      if (event.altKey && event.key === 's') {
        event.preventDefault()
        const main = document.querySelector('main, [role="main"]')
        if (main) {
          main.focus()
          main.scrollIntoView({ behavior: 'smooth' })
        }
      }
      
      // Alt + N para ir para navegação
      if (event.altKey && event.key === 'n') {
        event.preventDefault()
        const nav = document.querySelector('nav, [role="navigation"]')
        if (nav) {
          nav.focus()
          nav.scrollIntoView({ behavior: 'smooth' })
        }
      }
      
      // Alt + A para menu de acessibilidade
      if (event.altKey && event.key === 'a') {
        event.preventDefault()
        const accessibilityPanel = document.querySelector('#accessibility-panel')
        if (accessibilityPanel) {
          accessibilityPanel.focus()
          accessibilityPanel.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Pular para conteúdo principal
      </a>
      <a href="#navigation" className="skip-link">
        Pular para navegação
      </a>
      <a href="#accessibility-panel" className="skip-link">
        Pular para configurações de acessibilidade
      </a>
    </div>
  )
}
