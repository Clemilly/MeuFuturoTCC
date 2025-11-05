"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MaterialIcon } from "@/lib/material-icons"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import { cn } from "@/lib/utils"

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fechar ao pressionar Esc
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
        // Retornar foco para o botão
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      // Prevenir scroll do body quando o painel está aberto
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Fechar ao clicar fora do painel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Usar setTimeout para evitar fechar imediatamente ao abrir
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  // Focar no painel quando abrir
  useEffect(() => {
    if (isOpen && panelRef.current) {
      // Pequeno delay para garantir que a animação começou
      const timeoutId = setTimeout(() => {
        const firstFocusable = panelRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        firstFocusable?.focus()
      }, 150)

      return () => clearTimeout(timeoutId)
    }
  }, [isOpen])

  const togglePanel = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <>
      {/* Overlay para backdrop (opcional, mas melhora a UX) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] transition-opacity duration-300"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Botão Flutuante */}
      <Button
        ref={buttonRef}
        onClick={togglePanel}
        aria-label={isOpen ? "Fechar configurações de acessibilidade" : "Abrir configurações de acessibilidade"}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[10000]",
          "h-16 w-16 rounded-full",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "shadow-xl hover:shadow-2xl",
          "transition-all duration-300 ease-in-out",
          "flex items-center justify-center",
          "focus:ring-4 focus:ring-primary focus:ring-offset-2 focus:outline-none",
          "active:scale-95",
          "border-2 border-primary-foreground/20",
          isOpen && "scale-110 bg-primary/80 rotate-90"
        )}
        style={{
          // Garantir que fique acima do VLibras (z-index padrão do VLibras é ~9999)
          zIndex: 10000,
        }}
      >
        <MaterialIcon
          name={isOpen ? "close" : "accessibility"}
          size={28}
          className="transition-transform duration-300"
          aria-hidden={true}
        />
      </Button>

      {/* Painel de Acessibilidade */}
      <div
        id="accessibility-panel"
        ref={panelRef}
        className={cn(
          "fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[10000]",
          "w-[calc(100vw-2rem)] sm:w-[90vw] max-w-md",
          "max-h-[calc(100vh-12rem)] sm:max-h-[75vh]",
          "bg-card border-2 border-border rounded-lg shadow-2xl",
          "overflow-hidden",
          "transition-all duration-300 ease-in-out",
          "transform",
          "backdrop-blur-sm",
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
        style={{
          zIndex: 10000,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
      >
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)] sm:max-h-[75vh] overscroll-contain scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <AccessibilityMenu
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </div>
    </>
  )
}

