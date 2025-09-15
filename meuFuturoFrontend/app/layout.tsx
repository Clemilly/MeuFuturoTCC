import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { GlobalDataProvider } from "@/contexts/transaction-context"

export const metadata: Metadata = {
  title: "MeuFuturo - Gestão Financeira Acessível",
  description: "Sistema de gestão financeira pessoal com foco em acessibilidade e inclusão",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Pular para o conteúdo principal
        </a>
        <AuthProvider>
          <GlobalDataProvider>
            {children}
          </GlobalDataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
