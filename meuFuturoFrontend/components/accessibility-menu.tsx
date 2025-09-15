"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings, Type, Contrast, Eye, Keyboard, Zap, RotateCcw, Info } from "lucide-react"

interface AccessibilitySettings {
  fontSize: number
  contrast: "normal" | "high" | "dark"
  screenReader: boolean
  reducedMotion: boolean
  keyboardNavigation: boolean
  focusIndicator: boolean
  soundFeedback: boolean
}

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
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

  // Load settings from localStorage on mount
  useEffect(() => {
    if (!isMounted.current) return
    
    const savedSettings = localStorage.getItem("accessibility-settings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      if (isMounted.current) {
        setSettings(parsed)
        applySettings(parsed)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isMounted.current) return
    
    localStorage.setItem("accessibility-settings", JSON.stringify(settings))
    applySettings(settings)
  }, [settings])

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement
    const body = document.body

    // Apply font size
    root.style.fontSize = `${newSettings.fontSize}px`

    // Apply contrast settings
    body.classList.remove("high-contrast", "dark", "normal-contrast")
    if (newSettings.contrast === "high") {
      body.classList.add("high-contrast")
    } else if (newSettings.contrast === "dark") {
      body.classList.add("dark")
    } else {
      body.classList.add("normal-contrast")
    }

    // Apply reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty("--animation-duration", "0s")
      body.classList.add("reduce-motion")
    } else {
      root.style.removeProperty("--animation-duration")
      body.classList.remove("reduce-motion")
    }

    // Apply focus indicator enhancement
    if (newSettings.focusIndicator) {
      body.classList.add("enhanced-focus")
    } else {
      body.classList.remove("enhanced-focus")
    }

    // Apply keyboard navigation enhancements
    if (newSettings.keyboardNavigation) {
      body.classList.add("keyboard-navigation")
    } else {
      body.classList.remove("keyboard-navigation")
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
    // Simple audio feedback using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

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
    localStorage.removeItem("accessibility-settings")
  }

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(!isOpen)
              announceToScreenReader(isOpen ? "Menu de acessibilidade fechado" : "Menu de acessibilidade aberto")
            }}
            className="text-primary-foreground hover:bg-primary-foreground/10"
            aria-expanded={isOpen}
            aria-controls="accessibility-panel"
            aria-label="Abrir menu de configurações de acessibilidade"
          >
            <Settings className="w-4 h-4 mr-2" />
            Menu de Acessibilidade
          </Button>

          <div className="flex items-center space-x-2">
          </div>
        </div>

        {isOpen && (
          <Card id="accessibility-panel" className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Configurações de Acessibilidade</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetSettings()
                    announceToScreenReader("Configurações de acessibilidade restauradas para o padrão")
                  }}
                  aria-label="Restaurar configurações padrão"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restaurar Padrão
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tamanho da Fonte */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4" />
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
                  <Contrast className="w-4 h-4" />
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
                  <Zap className="w-4 h-4" />
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
                  <Keyboard className="w-4 h-4" />
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
                  <Eye className="w-4 h-4" />
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
                  <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
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
        )}
      </div>
    </div>
  )
}
