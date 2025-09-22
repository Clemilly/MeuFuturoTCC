"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, PlusCircle, BarChart3, Brain, Bell, Menu, X, Shield, LogOut, User, Info, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AccessibilityMenu } from "@/components/accessibility-menu"

export function MainNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigationItems = [
    { icon: Home, label: "Visão Geral", href: "/" },
    { icon: PlusCircle, label: "Transações", href: "/transactions" },
    { icon: BarChart3, label: "Relatórios", href: "/reports" },
    { icon: Brain, label: "IA Financeira", href: "/ai-insights" },
    { icon: Bell, label: "Alertas", href: "/alerts" },
    { icon: Shield, label: "Segurança", href: "/security" },
    { icon: User, label: "Perfil", href: "/profile" },
    { icon: Info, label: "Sobre", href: "/about" },
  ]

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 w-full" role="navigation" aria-label="Navegação principal">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <Link href="/" className="text-lg sm:text-xl font-bold text-foreground hover:text-primary whitespace-nowrap">
              MeuFuturo
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-1 min-w-0 flex-1 justify-center">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="group flex items-center space-x-1 sm:space-x-2 relative whitespace-nowrap transition-all duration-300 ease-in-out hover:bg-accent/50 hover:scale-105 px-2 sm:px-3"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-xs sm:text-sm transition-all duration-300 group-hover:text-foreground hidden xl:inline">
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}

            <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-border flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAccessibilityMenuOpen(!isAccessibilityMenuOpen)}
                className="group flex items-center space-x-1 whitespace-nowrap transition-all duration-300 ease-in-out hover:bg-accent/50 hover:scale-105 px-2"
                aria-label="Menu de acessibilidade"
                aria-expanded={isAccessibilityMenuOpen}
                aria-controls="accessibility-menu"
              >
                <Settings className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xs sm:text-sm transition-all duration-300 group-hover:text-foreground hidden xl:inline">
                  Acessibilidade
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="group flex items-center space-x-1 whitespace-nowrap transition-all duration-300 ease-in-out hover:bg-accent/50 hover:scale-105 px-2"
                aria-label="Sair da conta"
              >
                <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xs sm:text-sm transition-all duration-300 group-hover:text-foreground hidden xl:inline">
                  Sair
                </span>
              </Button>
            </div>
          </div>

          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Abrir menu de navegação"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden py-4 border-t border-border">
            <div className="space-y-2">
              <div className="px-3 py-2 bg-muted rounded-md mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">{user?.name}</span>
                  {user?.twoFactorEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      2FA
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
              </div>

              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start flex items-center space-x-2"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )
              })}

              <div className="pt-2 border-t border-border space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-2"
                  onClick={() => {
                    setIsAccessibilityMenuOpen(!isAccessibilityMenuOpen)
                    setIsMobileMenuOpen(false)
                  }}
                  aria-expanded={isAccessibilityMenuOpen}
                  aria-controls="accessibility-menu"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações de Acessibilidade</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-2 text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Menu de Acessibilidade */}
      {isAccessibilityMenuOpen && (
        <div id="accessibility-menu" className="border-t border-border bg-card">
          <AccessibilityMenu 
            isOpen={isAccessibilityMenuOpen} 
            onClose={() => setIsAccessibilityMenuOpen(false)} 
          />
        </div>
      )}
    </nav>
  )
}
