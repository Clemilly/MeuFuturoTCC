"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { MaterialIcon } from "@/lib/material-icons"
import { saveAccessibilitySettings, loadAccessibilitySettings, clearAccessibilitySettings } from "@/lib/accessibility-storage"

interface AccessibilitySettings {
  fontSize: number
  contrast: "normal" | "high" | "dark"
  screenReader: boolean
  reducedMotion: boolean
  keyboardNavigation: boolean
  focusIndicator: boolean
  soundFeedback: boolean
}

interface AccessibilityMenuProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AccessibilityMenu({ isOpen = true, onClose }: AccessibilityMenuProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: "normal",
    screenReader: false,
    reducedMotion: false,
    keyboardNavigation: true,
    focusIndicator: true,
    soundFeedback: false,
  })
  const isMounted = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Load settings from storage on mount
  useEffect(() => {
    if (!isMounted.current) return
    
    const savedSettings = loadAccessibilitySettings()
    if (savedSettings && isMounted.current) {
      setSettings(savedSettings)
      applySettings(savedSettings)
    }
  }, [])

  // Save settings to storage whenever they change
  useEffect(() => {
    if (!isMounted.current) return
    
    saveAccessibilitySettings(settings)
    applySettings(settings)
  }, [settings])

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement
    const body = document.body

    // Apply font size using data attribute for better cascade
    root.setAttribute('data-font-size', newSettings.fontSize.toString())
    
    // Apply contrast settings - FIX: Remove conflicting classes first
    body.classList.remove("high-contrast", "dark", "normal-contrast")
    root.removeAttribute('data-theme')
    
    if (newSettings.contrast === "high") {
      root.setAttribute('data-theme', 'high-contrast')
      body.classList.add("high-contrast")
    } else if (newSettings.contrast === "dark") {
      root.setAttribute('data-theme', 'dark')
      body.classList.add("dark")
    } else {
      root.setAttribute('data-theme', 'normal')
      body.classList.add("normal-contrast")
    }

    // Apply reduced motion - Enhanced implementation
    if (newSettings.reducedMotion) {
      root.setAttribute('data-reduce-motion', 'true')
      body.classList.add("reduce-motion")
    } else {
      root.removeAttribute('data-reduce-motion')
      body.classList.remove("reduce-motion")
    }

    // Apply focus indicator enhancement - Enhanced visibility
    if (newSettings.focusIndicator) {
      root.setAttribute('data-enhanced-focus', 'true')
      body.classList.add("enhanced-focus")
    } else {
      root.removeAttribute('data-enhanced-focus')
      body.classList.remove("enhanced-focus")
    }

    // Apply keyboard navigation enhancements
    if (newSettings.keyboardNavigation) {
      root.setAttribute('data-keyboard-nav', 'true')
      body.classList.add("keyboard-navigation")
    } else {
      root.removeAttribute('data-keyboard-nav')
      body.classList.remove("keyboard-navigation")
    }

    // Apply screen reader optimizations
    if (newSettings.screenReader) {
      root.setAttribute('data-screen-reader', 'true')
      body.classList.add("screen-reader-optimized")
    } else {
      root.removeAttribute('data-screen-reader')
      body.classList.remove("screen-reader-optimized")
    }

    // Sound feedback flag
    if (newSettings.soundFeedback) {
      root.setAttribute('data-sound-feedback', 'true')
    } else {
      root.removeAttribute('data-sound-feedback')
    }
  }

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))

    // Provide audio feedback if enabled
    if (settings.soundFeedback) {
      playFeedbackSound()
    }
  }

  const playFeedbackSound = () => {
    if (typeof window === 'undefined') return
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return

      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.03, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.08)
      
      setTimeout(() => audioContext.close(), 200)
    } catch (error) {
      console.debug('Audio feedback not available:', error)
    }
  }

  // Adiciona suporte a atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A para abrir menu de acessibilidade
      if (event.altKey && event.key === 'a') {
        event.preventDefault()
        if (onClose) {
          // Se o menu está aberto, fecha; se fechado, abre
          onClose()
        }
      }
      
      // Alt + S para pular para conteúdo principal
      if (event.altKey && event.key === 's') {
        event.preventDefault()
        const main = document.querySelector('main')
        if (main) {
          main.focus()
          main.scrollIntoView({ behavior: 'smooth' })
        }
      }
      
      // Alt + N para ir para navegação
      if (event.altKey && event.key === 'n') {
        event.preventDefault()
        const nav = document.querySelector('nav')
        if (nav) {
          nav.focus()
          nav.scrollIntoView({ behavior: 'smooth' })
        }
      }
      
      // Esc para fechar menus
      if (event.key === 'Escape' && onClose) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Global sound feedback listener
  useEffect(() => {
    if (!settings.soundFeedback) return

    const handleInteraction = (event: Event) => {
      const target = event.target as HTMLElement
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        playFeedbackSound()
      }
    }

    document.addEventListener('click', handleInteraction)
    return () => document.removeEventListener('click', handleInteraction)
  }, [settings.soundFeedback])

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      contrast: "normal",
      screenReader: false,
      reducedMotion: false,
      keyboardNavigation: true,
      focusIndicator: true,
      soundFeedback: false,
    }
    setSettings(defaultSettings)
    clearAccessibilitySettings()
  }

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div")
    announcement.setAttribute("role", "status")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Skip Links */}
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

      <div className="p-4" role="region" aria-labelledby="accessibility-title">
        <Card id="accessibility-panel" className="mb-4">
          <CardHeader>
            <CardTitle id="accessibility-title" className="flex items-center justify-between">
              <span>Configurações de Acessibilidade</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetSettings()
                    announceToScreenReader("Configurações de acessibilidade restauradas para o padrão")
                  }}
                  aria-label="Restaurar configurações padrão"
                >
                  <MaterialIcon name="rotate-ccw" size={16} className="mr-2" aria-hidden="true" />
                  Restaurar Padrão
                </Button>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Fechar menu de acessibilidade"
                  >
                    <MaterialIcon name="close" size={16} aria-hidden="true" />
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-6">
              {/* Tamanho da Fonte */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MaterialIcon name="type" size={16} aria-hidden="true" />
                  <label htmlFor="font-size-slider" className="font-semibold">
                    Tamanho da Fonte: {settings.fontSize}px
                  </label>
                </div>
                <Slider
                  id="font-size-slider"
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSetting("fontSize", value[0])}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                  aria-label="Ajustar tamanho da fonte"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Pequena (12px)</span>
                  <span>Grande (24px)</span>
                </div>
              </div>

              {/* Contraste */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MaterialIcon name="contrast" size={16} aria-hidden="true" />
                  <span className="font-semibold">Contraste</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: "normal", label: "Normal" },
                    { value: "high", label: "Alto Contraste" },
                    { value: "dark", label: "Modo Escuro" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={settings.contrast === option.value ? "default" : "outline"}
                      onClick={() => {
                        updateSetting("contrast", option.value as any)
                        announceToScreenReader(`Contraste alterado para ${option.label}`)
                      }}
                      className="w-full"
                      aria-pressed={settings.contrast === option.value}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Configurações de Movimento e Animação */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MaterialIcon name="zap" size={16} aria-hidden="true" />
                  <span className="font-semibold">Movimento e Animação</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label htmlFor="reduced-motion" className="text-sm font-medium">
                      Reduzir Movimento
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Minimiza animações e transições para reduzir desconforto
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => {
                      updateSetting("reducedMotion", checked)
                      announceToScreenReader(checked ? "Movimento reduzido ativado" : "Movimento reduzido desativado")
                    }}
                    aria-describedby="reduced-motion-desc"
                  />
                </div>
              </div>

              {/* Configurações de Navegação */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MaterialIcon name="keyboard" size={16} aria-hidden="true" />
                  <span className="font-semibold">Navegação</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label htmlFor="keyboard-nav" className="text-sm font-medium">
                      Navegação por Teclado Aprimorada
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Melhora a visibilidade e funcionalidade da navegação por teclado
                    </p>
                  </div>
                  <Switch
                    id="keyboard-nav"
                    checked={settings.keyboardNavigation}
                    onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label htmlFor="focus-indicator" className="text-sm font-medium">
                      Indicador de Foco Aprimorado
                    </label>
                    <p className="text-xs text-muted-foreground">Torna mais visível qual elemento está em foco</p>
                  </div>
                  <Switch
                    id="focus-indicator"
                    checked={settings.focusIndicator}
                    onCheckedChange={(checked) => updateSetting("focusIndicator", checked)}
                  />
                </div>
              </div>

              {/* Configurações de Leitores de Tela */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MaterialIcon name="eye" size={16} aria-hidden="true" />
                  <span className="font-semibold">Leitores de Tela</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label htmlFor="screen-reader" className="text-sm font-medium">
                      Otimização para Leitores de Tela
                    </label>
                    <p className="text-xs text-muted-foreground">Ativa descrições adicionais e navegação otimizada</p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label htmlFor="sound-feedback" className="text-sm font-medium">
                      Feedback Sonoro
                    </label>
                    <p className="text-xs text-muted-foreground">Sons sutis para confirmar ações e mudanças</p>
                  </div>
                  <Switch
                    id="sound-feedback"
                    checked={settings.soundFeedback}
                    onCheckedChange={(checked) => updateSetting("soundFeedback", checked)}
                  />
                </div>

              </div>

              {/* Informações de Compatibilidade */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start space-x-2">
                  <MaterialIcon name="info" size={16} className="mt-0.5 text-muted-foreground" aria-hidden="true" />
                  <div className="space-y-2">
                    <h4 className="font-medium">Compatibilidade</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>✓ NVDA, JAWS, VoiceOver e outros leitores de tela</p>
                      <p>✓ Navegação completa por teclado (Tab, Enter, Setas)</p>
                      <p>✓ Conformidade WCAG 2.2 Nível A</p>
                      <p>✓ Suporte a dispositivos móveis e desktop</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atalhos de Teclado */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Atalhos de Teclado</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded text-xs">Alt + A</kbd>
                    <span className="ml-2">Abrir menu de acessibilidade</span>
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded text-xs">Alt + S</kbd>
                    <span className="ml-2">Pular para conteúdo principal</span>
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded text-xs">Alt + N</kbd>
                    <span className="ml-2">Ir para navegação</span>
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded text-xs">Esc</kbd>
                    <span className="ml-2">Fechar menus e diálogos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
}
