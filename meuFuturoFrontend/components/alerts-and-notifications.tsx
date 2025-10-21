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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAlerts, type Alert, type AlertCreate, type NotificationSettings } from "@/hooks/use-alerts"
import { MaterialIcon, IconAccessibility } from "@/lib/material-icons"

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
  const { toast } = useToast()
  const {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    dismissAlert,
    completeAlert,
    generateSmartAlerts,
  } = useAlerts()

  const [settings, setSettings] = useState<NotificationSettings>({
    billReminders: true,
    budgetAlerts: true,
    goalUpdates: true,
    weeklyReports: false,
    reminderDays: 3,
  })

  const [newAlert, setNewAlert] = useState<AlertCreate>({
    type: "custom",
    title: "",
    description: "",
    amount: undefined,
    due_date: undefined,
    priority: "medium",
    is_recurring: false,
  })

  const [showNewAlertForm, setShowNewAlertForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [errors, setErrors] = useState<Partial<AlertCreate>>({})

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

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return 0
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
        return <MaterialIcon name="alert-triangle" size={16} className="text-red-600" aria-label="Alta prioridade" />
      case "medium":
        return <MaterialIcon name="clock" size={16} className="text-yellow-600" aria-label="Média prioridade" />
      case "low":
        return <MaterialIcon name="bell" size={16} className="text-blue-600" aria-label="Baixa prioridade" />
      default:
        return <MaterialIcon name="bell" size={16} aria-label="Prioridade padrão" />
    }
  }

  const getTypeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "bill":
        return <MaterialIcon name="dollar-sign" size={16} aria-label="Conta a pagar" />
      case "goal":
        return <MaterialIcon name="check-circle" size={16} aria-label="Meta financeira" />
      case "budget":
        return <MaterialIcon name="chart" size={16} aria-label="Orçamento" />
      case "income":
        return <MaterialIcon name="trending-up" size={16} aria-label="Receita" />
      case "custom":
        return <MaterialIcon name="bell" size={16} aria-label="Alerta personalizado" />
      default:
        return <MaterialIcon name="bell" size={16} aria-label="Alerta" />
    }
  }

  const handleDismissAlert = async (id: string) => {
    const success = await dismissAlert(id)
    if (success) {
      toast({
        title: "Sucesso",
        description: "Alerta dispensado com sucesso",
      })
      announceToScreenReader("Alerta dispensado")
    }
  }

  const handleCompleteAlert = async (id: string) => {
    const success = await completeAlert(id)
    if (success) {
      toast({
        title: "Sucesso",
        description: "Alerta marcado como concluído",
      })
      announceToScreenReader("Alerta marcado como concluído")
    }
  }

  const handleDeleteAlert = async (id: string) => {
    const success = await deleteAlert(id)
    if (success) {
      toast({
        title: "Sucesso",
        description: "Alerta excluído com sucesso",
      })
      announceToScreenReader("Alerta excluído")
    }
  }

  const editAlert = (alert: Alert) => {
    setEditingAlert(alert)
    setNewAlert({
      type: alert.type,
      title: alert.title,
      description: alert.description,
      amount: alert.amount,
      due_date: alert.due_date,
      priority: alert.priority,
      is_recurring: alert.is_recurring,
    })
    setShowNewAlertForm(true)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AlertCreate> = {}

    if (!newAlert.title.trim()) {
      newErrors.title = "Título é obrigatório"
    }

    if (newAlert.amount !== undefined && newAlert.amount <= 0) {
      newErrors.amount = "Valor deve ser maior que zero"
    }

    if (newAlert.due_date && new Date(newAlert.due_date) < new Date()) {
      newErrors.due_date = "Data não pode ser no passado"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addNewAlert = async () => {
    if (!validateForm()) return

    const alertData: AlertCreate = {
      type: newAlert.type,
      title: newAlert.title.trim(),
      description: newAlert.description.trim(),
      amount: newAlert.amount,
      due_date: newAlert.due_date,
      priority: newAlert.priority,
      is_recurring: newAlert.is_recurring,
    }

    if (editingAlert) {
      // Update existing alert
      const success = await updateAlert(editingAlert.id, alertData)
      if (success) {
        toast({
          title: "Sucesso",
          description: "Alerta atualizado com sucesso",
        })
        announceToScreenReader("Alerta atualizado com sucesso")
      }
    } else {
      // Create new alert
      const success = await createAlert(alertData)
      if (success) {
        toast({
          title: "Sucesso",
          description: "Novo alerta criado com sucesso",
        })
        announceToScreenReader("Novo alerta criado com sucesso")
      }
    }

    // Reset form
    setNewAlert({
      type: "custom",
      title: "",
      description: "",
      amount: undefined,
      due_date: undefined,
      priority: "medium",
      is_recurring: false,
    })
    setEditingAlert(null)
    setShowNewAlertForm(false)
    setErrors({})
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
    (alert) => alert.type === "bill" && alert.due_date && getDaysUntilDue(alert.due_date) <= 7,
  )

  return (
    <div className="space-y-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <MaterialIcon name="alert-circle" size={16} aria-label="Erro" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resumo de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <MaterialIcon name="bell-ring" size={20} className="text-primary" aria-label="Notificações" />
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
              <MaterialIcon name="alert-triangle" size={20} className="text-red-600" aria-label="Alertas urgentes" />
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
              <MaterialIcon name="calendar" size={20} className="text-yellow-600" aria-label="Contas próximas" />
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
                <MaterialIcon name="check-circle" size={48} className="mx-auto mb-4 text-green-600" aria-label="Nenhum alerta ativo" />
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
                          {alert.due_date && (
                            <span>
                              Vence em: {getDaysUntilDue(alert.due_date)} dias ({formatDate(alert.due_date)})
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {alert.type === "bill" && "Conta"}
                            {alert.type === "goal" && "Meta"}
                            {alert.type === "budget" && "Orçamento"}
                            {alert.type === "income" && "Receita"}
                            {alert.type === "custom" && "Personalizado"}
                          </Badge>
                          {alert.is_recurring && <Badge variant="secondary">Recorrente</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      {alert.type === "bill" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteAlert(alert.id)}
                          aria-label={`Marcar ${alert.title} como pago`}
                          disabled={loading}
                        >
                          <MaterialIcon name="check-circle" size={16} aria-label="Marcar como concluído" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editAlert(alert)}
                        aria-label={`Editar alerta ${alert.title}`}
                        disabled={loading}
                      >
                        <MaterialIcon name="edit" size={16} aria-label="Editar" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissAlert(alert.id)}
                        aria-label={`Dispensar alerta ${alert.title}`}
                        disabled={loading}
                      >
                        <MaterialIcon name="bell" size={16} aria-label="Dispensar" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                        aria-label={`Excluir alerta ${alert.title}`}
                        disabled={loading}
                      >
                        <MaterialIcon name="trash" size={16} aria-label="Excluir" />
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
                        <span>Criado em: {formatDate(alert.created_at)}</span>
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
                <MaterialIcon name="settings" size={20} aria-label="Configurações" />
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
                <MaterialIcon name="plus" size={20} aria-label="Adicionar" />
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
                  onChange={(e) => {
                    setNewAlert((prev) => ({ ...prev, title: e.target.value }))
                    if (errors.title) {
                      setErrors(prev => ({ ...prev, title: undefined }))
                    }
                  }}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
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
                    value={newAlert.amount || ""}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined
                      setNewAlert((prev) => ({ ...prev, amount: value }))
                      if (errors.amount) {
                        setErrors(prev => ({ ...prev, amount: undefined }))
                      }
                    }}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alert-date">Data de Vencimento (opcional)</Label>
                  <Input
                    id="alert-date"
                    type="date"
                    value={newAlert.due_date || ""}
                    onChange={(e) => {
                      setNewAlert((prev) => ({ ...prev, due_date: e.target.value || undefined }))
                      if (errors.due_date) {
                        setErrors(prev => ({ ...prev, due_date: undefined }))
                      }
                    }}
                  />
                  {errors.due_date && (
                    <p className="text-sm text-red-600">{errors.due_date}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="alert-recurring"
                  checked={newAlert.is_recurring}
                  onCheckedChange={(checked) => setNewAlert((prev) => ({ ...prev, is_recurring: checked }))}
                />
                <Label htmlFor="alert-recurring">Alerta recorrente</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={addNewAlert} disabled={!newAlert.title.trim() || loading}>
                  <MaterialIcon name="plus" size={16} className="mr-2" aria-label="Adicionar" />
                  {editingAlert ? "Atualizar Alerta" : "Criar Alerta"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewAlert({
                      type: "custom",
                      title: "",
                      description: "",
                      amount: undefined,
                      due_date: undefined,
                      priority: "medium",
                      is_recurring: false,
                    })
                    setEditingAlert(null)
                    setShowNewAlertForm(false)
                    setErrors({})
                  }}
                  disabled={loading}
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
