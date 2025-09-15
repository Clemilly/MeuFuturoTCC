import { RouteGuard } from "@/components/route-guard"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import { MainNavigation } from "@/components/main-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Shield,
  Brain,
  BarChart3,
  Bell,
  Users,
  Target,
  Award,
  Heart,
  Zap,
  Home,
  CreditCard,
  FileText,
  Lightbulb,
  AlertTriangle,
  User,
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const navigationLinks = [
    { href: "/", icon: Home, label: "Dashboard", description: "Visão geral financeira" },
    { href: "/transactions", icon: CreditCard, label: "Transações", description: "Gerenciar receitas e despesas" },
    { href: "/reports", icon: FileText, label: "Relatórios", description: "Gráficos e análises" },
    { href: "/ai-insights", icon: Lightbulb, label: "IA Financeira", description: "Insights inteligentes" },
    { href: "/alerts", icon: AlertTriangle, label: "Alertas", description: "Notificações e lembretes" },
    { href: "/profile", icon: User, label: "Perfil", description: "Configurações pessoais" },
  ]

  const features = [
    {
      icon: TrendingUp,
      title: "Gestão Financeira Inteligente",
      description:
        "Controle completo de receitas e despesas com categorização automática e análise de padrões de gastos.",
    },
    {
      icon: Brain,
      title: "Inteligência Artificial",
      description:
        "Previsões financeiras personalizadas, análise de comportamento e recomendações para melhorar sua saúde financeira.",
    },
    {
      icon: BarChart3,
      title: "Relatórios Visuais",
      description:
        "Gráficos interativos e relatórios detalhados para visualizar seu progresso financeiro de forma clara.",
    },
    {
      icon: Bell,
      title: "Alertas Inteligentes",
      description: "Notificações sobre vencimentos, metas atingidas e situações que requerem sua atenção.",
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Autenticação de dois fatores e proteção completa dos seus dados financeiros sensíveis.",
    },
    {
      icon: Users,
      title: "Acessibilidade Total",
      description:
        "Interface inclusiva que atende pessoas com diferentes necessidades e níveis de familiaridade tecnológica.",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Inclusão",
      description: "Acreditamos que tecnologia financeira deve ser acessível a todos, independente de suas limitações.",
    },
    {
      icon: Target,
      title: "Simplicidade",
      description: "Transformamos a complexidade das finanças pessoais em uma experiência simples e intuitiva.",
    },
    {
      icon: Award,
      title: "Qualidade",
      description: "Seguimos os mais altos padrões de usabilidade e acessibilidade em cada detalhe do sistema.",
    },
    {
      icon: Zap,
      title: "Inovação",
      description: "Utilizamos IA e tecnologias modernas para oferecer insights únicos sobre suas finanças.",
    },
  ]

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <AccessibilityMenu />
        <MainNavigation />

        <main id="main-content" className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">Acesso Rápido às Funcionalidades</CardTitle>
              <CardDescription>Navegue facilmente para outras seções do MeuFuturo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {navigationLinks.map((link, index) => (
                  <Link key={index} href={link.href}>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:bg-primary/10 hover:border-primary/30 transition-colors bg-transparent"
                    >
                      <link.icon className="w-5 h-5 text-primary" />
                      <div className="text-center">
                        <div className="font-medium text-sm">{link.label}</div>
                        <div className="text-xs text-muted-foreground">{link.description}</div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Sobre o MeuFuturo</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Uma plataforma de gestão financeira pessoal desenvolvida com foco em <strong>acessibilidade</strong>,
            <strong> simplicidade</strong> e <strong>inteligência artificial</strong> para ajudar você a construir um
            futuro financeiro sólido.
          </p>
        </div>

        <div className="mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Nossa Missão</CardTitle>
              <CardDescription className="text-lg">
                Democratizar o acesso à educação e gestão financeira através de uma plataforma inclusiva, intuitiva e
                inteligente que capacita pessoas de todos os perfis a tomarem decisões financeiras conscientes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-foreground mb-6 text-center">Principais Funcionalidades</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-foreground mb-6 text-center">Nossos Valores</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <value.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span>{value.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Desenvolvido Para Você</CardTitle>
              <CardDescription className="text-lg">
                O MeuFuturo foi criado pensando em diferentes perfis de usuários, garantindo que todos tenham uma
                experiência excepcional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-lg">Iniciantes em Tecnologia</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Interface simples e intuitiva com orientações claras para quem está começando no mundo digital.
                  </p>
                </div>
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-lg">Pessoas com Deficiência</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Suporte completo a leitores de tela, VLibras, alto contraste e navegação por teclado.
                  </p>
                </div>
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-lg">Usuários Avançados</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Recursos avançados, atalhos de teclado e análises detalhadas para quem busca controle total.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-muted/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Tecnologia e Conformidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-center">
                <div className="p-4">
                  <Badge variant="outline" className="mb-2">
                    WCAG 2.2
                  </Badge>
                  <p className="text-sm text-muted-foreground">Nível A de Acessibilidade</p>
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2">
                    React + Next.js
                  </Badge>
                  <p className="text-sm text-muted-foreground">Tecnologia Moderna</p>
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2">
                    Português BR
                  </Badge>
                  <p className="text-sm text-muted-foreground">Interface Localizada</p>
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2">
                    Responsivo
                  </Badge>
                  <p className="text-sm text-muted-foreground">Todos os Dispositivos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </RouteGuard>
  )
}
