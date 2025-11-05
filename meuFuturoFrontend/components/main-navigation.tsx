"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MaterialIcon } from "@/lib/material-icons"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface NavigationItem {
  icon: string
  label: string
  href: string
  badge?: number
}

export function MainNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const navigationItems: NavigationItem[] = [
    { icon: "home", label: "Visão Geral", href: "/" },
    { icon: "plus-circle", label: "Transações", href: "/transactions" },
    { icon: "bar-chart-3", label: "Relatórios", href: "/reports" },
    { icon: "brain", label: "IA Financeira", href: "/ai-insights" },
    { icon: "bell", label: "Alertas", href: "/alerts" },
    { icon: "user", label: "Perfil", href: "/profile" },
    { icon: "info", label: "Sobre", href: "/about" },
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks
    
    setIsLoggingOut(true)
    setIsMobileMenuOpen(false)
    
    try {
      const result = await logout()
      
      if (result.success) {
        // Show success message
        toast({
          title: "Logout realizado",
          description: result.message || "Você foi desconectado com sucesso.",
          duration: 3000,
        })
        
        // Redirect to login page
        router.replace('/login')
      } else {
        // Show error message but still redirect for security
        toast({
          title: "Aviso no logout",
          description: result.message || "Erro ao realizar logout. Você será redirecionado para a tela de login.",
          variant: "destructive",
          duration: 5000,
        })
        
        // Still redirect to login for security
        router.replace('/login')
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Logout error:', error)
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro inesperado. Você será redirecionado para a tela de login. Se o problema persistir, tente novamente ou aguarde alguns instantes.",
        variant: "destructive",
        duration: 5000,
      })
      
      // Still redirect to login for security
      router.replace('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav id="navigation" className="bg-card border-b border-border sticky top-0 z-50 w-full" role="navigation" aria-label="Navegação principal">
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
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "group flex items-center space-x-1 sm:space-x-2 relative whitespace-nowrap transition-all duration-300 ease-in-out hover:scale-105 px-2 sm:px-3",
                      isActive 
                        ? "!bg-white dark:!bg-white !text-gray-900 dark:!text-gray-900 hover:!bg-gray-100 dark:hover:!bg-gray-100 shadow-sm" 
                        : "text-foreground hover:bg-accent/50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <MaterialIcon 
                      name={item.icon as any} 
                      size={16} 
                      className={cn(
                        "flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "!text-gray-900 dark:!text-gray-900" : "text-foreground"
                      )} 
                      aria-hidden={true}
                    />
                    <span className={cn(
                      "text-xs sm:text-sm transition-all duration-300 hidden xl:inline",
                      isActive 
                        ? "!text-gray-900 dark:!text-gray-900" 
                        : "text-foreground group-hover:text-foreground"
                    )}>
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
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group flex items-center space-x-1 whitespace-nowrap transition-all duration-300 ease-in-out hover:bg-accent/50 hover:scale-105 px-2 sm:px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sair da conta"
              >
                {isLoggingOut ? (
                  <>
                    <MaterialIcon name="loading" size={16} className="animate-spin text-foreground" aria-hidden={true} />
                    <span className="text-xs sm:text-sm transition-all duration-300 group-hover:text-foreground hidden xl:inline text-foreground">
                      Saindo...
                    </span>
                  </>
                ) : (
                  <>
                    <MaterialIcon name="log-out" size={16} className="transition-transform duration-300 group-hover:scale-110 text-foreground" aria-hidden={true} />
                    <span className="text-xs sm:text-sm transition-all duration-300 group-hover:text-foreground hidden xl:inline text-foreground">
                      Sair
                    </span>
                  </>
                )}
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
              {isMobileMenuOpen ? <MaterialIcon name="close" size={20} aria-hidden={true} /> : <MaterialIcon name="menu" size={20} aria-hidden={true} />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden py-4 border-t border-border">
            <div className="space-y-2">
              <div className="px-3 py-2 bg-muted rounded-md mb-4">
                <div className="flex items-center space-x-2">
                  <MaterialIcon name="user" size={16} className="text-muted-foreground" aria-hidden={true} />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
              </div>

              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start flex items-center space-x-2",
                        isActive 
                          ? "!bg-white dark:!bg-white !text-gray-900 dark:!text-gray-900 hover:!bg-gray-100 dark:hover:!bg-gray-100 shadow-sm" 
                          : ""
                      )}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <MaterialIcon 
                        name={item.icon as any} 
                        size={16} 
                        className={isActive ? "!text-gray-900 dark:!text-gray-900" : ""}
                        aria-hidden={true} 
                      />
                      <span className={isActive ? "!text-gray-900 dark:!text-gray-900" : ""}>{item.label}</span>
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
                  className="w-full justify-start flex items-center space-x-2 text-destructive hover:text-destructive disabled:opacity-50"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <MaterialIcon name="loading" size={16} className="animate-spin" aria-hidden={true} />
                      <span>Saindo...</span>
                    </>
                  ) : (
                    <>
                      <MaterialIcon name="log-out" size={16} aria-hidden={true} />
                      <span>Sair da Conta</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
