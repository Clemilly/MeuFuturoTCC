"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Settings,
  Plus,
  Trash2,
  BellRing,
  Edit,
} from "lucide-react"

interface Alert {
  id: number
  type: "bill" | "goal" | "budget" | "income" | "custom"
  title: string
  description: string
  amount?: number
  dueDate?: string
  priority: "low" | "medium" | "high"
  status: "active" | "dismissed" | "completed"
  recurring: boolean
  createdAt: string
}

interface NotificationSettings {
  billReminders: boolean
  budgetAlerts: boolean
  goalUpdates: boolean
  weeklyReports: boolean
  reminderDays: number
}

export function AlertsAndNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: "bill",
      title: "Conta de Internet",
      description: "Vencimento em 3 dias",
      amount: 89.9,
      dueDate: "2025-01-27",
      priority: "high",
      status: "active",
      recurring: true,
      createdAt: "2025-01-20",
    },
    {
      id: 2,
      type: "goal",
      title: "Meta de Poupança",
      description: "Você está 85% próximo da sua meta mensal!",
      priority: "medium",
      status: "active",
      recurring: false,
      createdAt: "2025-01-22",
    },
    {
      id: 3,
      type: "budget",
      title: "Orçamento de Alimentação",
      description: "Você já gastou 90% do orçamento mensal com alimentação",
      priority: "medium",
      status: "active",
      recurring: false,
      createdAt: "2025-01-23",
    },
    {
      id: 4,
      type: "bill",
      title: "Cartão de Crédito",
      description: "Fatura vence em 7 dias",
      amount: 1250.0,
      dueDate: "2025-01-31",
      priority: "high",
      status: "active",
      recurring: true,
      createdAt: "2025-01-18",
    },
    {
      id: 5,
      type: "custom",
      title: "Revisão Financeira Mensal",
      description: "Hora de revisar seus gastos e metas do mês",
      priority: "low",
      status: "active",
      recurring: true,
      createdAt: "2025-01-15",
    },
  ])

  const [settings, setSettings] = useState<NotificationSettings>({
    billReminders: true,
    budgetAlerts: true,
    goalUpdates: true,
    weeklyReports: false,
    reminderDays: 3,
  })

  const [newAlert, setNewAlert] = useState({
    type: "custom" as Alert["type"],
    title: "",
    description: "",
    amount: "",
    dueDate: "",
    priority: "medium" as Alert["priority"],
    recurring: false,
  })

  const [showNewAlertForm, setShowNewAlertForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("notification-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("notification-settings", JSON.stringify(settings))
  }, [settings])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPriorityColor = (priority: Alert["priority"]) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50 text-red-800"
      case "medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-800"
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-800"
      default:
        return "border-gray-200 bg-gray-50 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: Alert["priority"]) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "low":
        return <Bell className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "bill":
        return <DollarSign className="h-4 w-4" />
      case "goal":
        return <CheckCircle className="h-4 w-4" />
      case "budget":
        return <AlertTriangle className="h-4 w-4" />
      case "income":
        return <DollarSign className="h-4 w-4" />
      case "custom":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, status: "dismissed" } : alert)))
    announceToScreenReader("Alerta dispensado")
  }

  const completeAlert = (id: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, status: "completed" } : alert)))
    announceToScreenReader("Alerta marcado como concluído")
  }

  const deleteAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    announceToScreenReader("Alerta excluído")
  }

  const editAlert = (alert: Alert) => {
    setEditingAlert(alert)
    setNewAlert({
      type: alert.type,
      title: alert.title,
      description: alert.description,
      amount: alert.amount?.toString() || "",
      dueDate: alert.dueDate || "",
      priority: alert.priority,
      recurring: alert.recurring,
    })
    setShowNewAlertForm(true)
  }

  const addNewAlert = () => {
    if (!newAlert.title.trim()) return

    if (editingAlert) {
      // Update existing alert
      const updatedAlert: Alert = {
        ...editingAlert,
        type: newAlert.type,
        title: newAlert.title,
        description: newAlert.description,
        amount: newAlert.amount ? Number.parseFloat(newAlert.amount) : undefined,
        dueDate: newAlert.dueDate || undefined,
        priority: newAlert.priority,
        recurring: newAlert.recurring,
      }

      setAlerts((prev) => prev.map((alert) => (alert.id === editingAlert.id ? updatedAlert : alert)))
      announceToScreenReader("Alerta atualizado com sucesso")
    } else {
      // Create new alert
      const alert: Alert = {
        id: Date.now(),
        type: newAlert.type,
        title: newAlert.title,
        description: newAlert.description,
        amount: newAlert.amount ? Number.parseFloat(newAlert.amount) : undefined,
        dueDate: newAlert.dueDate || undefined,
        priority: newAlert.priority,
        status: "active",
        recurring: newAlert.recurring,
        createdAt: new Date().toISOString(),
      }

      setAlerts((prev) => [alert, ...prev])
      announceToScreenReader("Novo alerta criado com sucesso")
    }

    // Reset form
    setNewAlert({
      type: "custom",
      title: "",
      description: "",
      amount: "",
      dueDate: "",
      priority: "medium",
      recurring: false,
    })
    setEditingAlert(null)
    setShowNewAlertForm(false)
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

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const urgentAlerts = activeAlerts.filter((alert) => alert.priority === "high")
  const upcomingBills = activeAlerts.filter(
    (alert) => alert.type === "bill" && alert.dueDate && getDaysUntilDue(alert.dueDate) <= 7,
  )

  return (
    <div className="space-y-8">
      {/* Resumo de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{activeAlerts.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{urgentAlerts.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contas Próximas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{upcomingBills.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Ativos ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="new">Novo Alerta</TabsTrigger>
        </TabsList>

        {/* Alertas Ativos */}
        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Nenhum alerta ativo</h3>
                <p className="text-muted-foreground">Você está em dia com todas as suas obrigações financeiras!</p>
              </CardContent>
            </Card>
          ) : (
            activeAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getPriorityColor(alert.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(alert.type)}
                        {getPriorityIcon(alert.priority)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          {alert.amount && <span>Valor: {formatCurrency(alert.amount)}</span>}
                          {alert.dueDate && (
                            <span>
                              Vence em: {getDaysUntilDue(alert.dueDate)} dias ({formatDate(alert.dueDate)})
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {alert.type === "bill" && "Conta"}
                            {alert.type === "goal" && "Meta"}
                            {alert.type === "budget" && "Orçamento"}
                            {alert.type === "income" && "Receita"}
                            {alert.type === "custom" && "Personalizado"}
                          </Badge>
                          {alert.recurring && <Badge variant="secondary">Recorrente</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      {alert.type === "bill" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => completeAlert(alert.id)}
                          aria-label={`Marcar ${alert.title} como pago`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editAlert(alert)}
                        aria-label={`Editar alerta ${alert.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        aria-label={`Dispensar alerta ${alert.title}`}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                        aria-label={`Excluir alerta ${alert.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Todos os Alertas */}
        <TabsContent value="all" className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`${alert.status !== "active" ? "opacity-60" : ""} border-l-4 ${getPriorityColor(
                alert.priority,
              )}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(alert.type)}
                      {getPriorityIcon(alert.priority)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <Badge
                          variant={
                            alert.status === "active"
                              ? "default"
                              : alert.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {alert.status === "active" && "Ativo"}
                          {alert.status === "completed" && "Concluído"}
                          {alert.status === "dismissed" && "Dispensado"}
                        </Badge>
                        <span>Criado em: {formatDate(alert.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações de Notificação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-4">
                <h4 className="font-semibold">Tipos de Alerta</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="bill-reminders">Lembretes de Contas</Label>
                    <p className="text-sm text-muted-foreground">Alertas sobre vencimentos de contas</p>
                  </div>
                  <Switch
                    id="bill-reminders"
                    checked={settings.billReminders}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, billReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="budget-alerts">Alertas de Orçamento</Label>
                    <p className="text-sm text-muted-foreground">Notificações sobre limites de gastos</p>
                  </div>
                  <Switch
                    id="budget-alerts"
                    checked={settings.budgetAlerts}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, budgetAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="goal-updates">Atualizações de Metas</Label>
                    <p className="text-sm text-muted-foreground">Progresso das suas metas financeiras</p>
                  </div>
                  <Switch
                    id="goal-updates"
                    checked={settings.goalUpdates}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, goalUpdates: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="weekly-reports">Relatórios Semanais</Label>
                    <p className="text-sm text-muted-foreground">Resumo semanal das suas finanças</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, weeklyReports: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Configurações de Tempo</h4>

                <div className="space-y-2">
                  <Label htmlFor="reminder-days">Dias de Antecedência para Lembretes</Label>
                  <Select
                    value={settings.reminderDays.toString()}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, reminderDays: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger id="reminder-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="5">5 dias</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="15">15 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Novo Alerta */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>{editingAlert ? "Editar Alerta" : "Criar Novo Alerta"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-type">Tipo de Alerta</Label>
                  <Select
                    value={newAlert.type}
                    onValueChange={(value: Alert["type"]) => setNewAlert((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="alert-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bill">Conta a Pagar</SelectItem>
                      <SelectItem value="goal">Meta Financeira</SelectItem>
                      <SelectItem value="budget">Orçamento</SelectItem>
                      <SelectItem value="income">Receita Esperada</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alert-priority">Prioridade</Label>
                  <Select
                    value={newAlert.priority}
                    onValueChange={(value: Alert["priority"]) => setNewAlert((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger id="alert-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-title">Título do Alerta</Label>
                <Input
                  id="alert-title"
                  placeholder="Ex: Conta de luz"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-description">Descrição</Label>
                <Textarea
                  id="alert-description"
                  placeholder="Detalhes adicionais sobre o alerta"
                  value={newAlert.description}
                  onChange={(e) => setNewAlert((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-amount">Valor (opcional)</Label>
                  <Input
                    id="alert-amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={newAlert.amount}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alert-date">Data de Vencimento (opcional)</Label>
                  <Input
                    id="alert-date"
                    type="date"
                    value={newAlert.dueDate}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="alert-recurring"
                  checked={newAlert.recurring}
                  onCheckedChange={(checked) => setNewAlert((prev) => ({ ...prev, recurring: checked }))}
                />
                <Label htmlFor="alert-recurring">Alerta recorrente</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={addNewAlert} disabled={!newAlert.title.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {editingAlert ? "Atualizar Alerta" : "Criar Alerta"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewAlert({
                      type: "custom",
                      title: "",
                      description: "",
                      amount: "",
                      dueDate: "",
                      priority: "medium",
                      recurring: false,
                    })
                    setEditingAlert(null)
                    setShowNewAlertForm(false)
                  }}
                >
                  {editingAlert ? "Cancelar" : "Limpar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
