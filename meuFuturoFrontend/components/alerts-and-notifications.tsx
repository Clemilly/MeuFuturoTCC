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
import { Alert as AlertComponent, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAlerts, type Alert, type AlertCreate, type NotificationSettings } from "@/hooks/use-alerts"
import { MaterialIcon, IconAccessibility } from "@/lib/material-icons"

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

  // NOTIFICAÇÕES DESABILITADAS: Estado de configurações de notificação comentado
  // Este estado não é mais usado ativamente, mas mantido para preservação futura
  const [settings, setSettings] = useState<NotificationSettings>({
    billReminders: false, // Desabilitado - notificações não implementadas
    budgetAlerts: false,  // Desabilitado - notificações não implementadas
    goalUpdates: false,   // Desabilitado - notificações não implementadas
    weeklyReports: false, // Desabilitado - notificações não implementadas
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dismissConfirmOpen, setDismissConfirmOpen] = useState(false)
  const [alertToDismiss, setAlertToDismiss] = useState<string | null>(null)
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false)
  const [alertToComplete, setAlertToComplete] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  // NOTIFICAÇÕES DESABILITADAS: Sistema de notificações automáticas não está implementado
  // O código abaixo está comentado para preservação futura, mas totalmente inativo
  // 
  // Load settings from localStorage
  // useEffect(() => {
  //   const savedSettings = localStorage.getItem("notification-settings")
  //   if (savedSettings) {
  //     setSettings(JSON.parse(savedSettings))
  //   }
  // }, [])

  // Save settings to localStorage
  // useEffect(() => {
  //   localStorage.setItem("notification-settings", JSON.stringify(settings))
  // }, [settings])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  /**
   * Calcula a data de vencimento ajustada para alertas recorrentes.
   * Se a data já passou e o alerta é recorrente, avança para o próximo mês mantendo o mesmo dia.
   */
  const getAdjustedDueDate = (alert: Alert): Date | null => {
    if (!alert.due_date) return null
    
    // Parse da data garantindo que extraímos apenas a parte da data (YYYY-MM-DD)
    // Isso evita problemas com fuso horário ou horário na string
    const dateStr = alert.due_date.split('T')[0] // Pega apenas a parte da data (YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number)
    const dueDate = new Date(year, month - 1, day) // month - 1 porque Date usa 0-11
    dueDate.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Extrair o dia do mês original
    const dayOfMonth = dueDate.getDate()
    
    // Se o alerta é recorrente
    if (alert.is_recurring) {
      // Calcular a próxima ocorrência baseada no mês/ano atual e no dia original
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() // 0-11
      
      // Tentar usar o mesmo dia no mês atual
      let adjustedDate = new Date(currentYear, currentMonth, dayOfMonth)
      adjustedDate.setHours(0, 0, 0, 0)
      
      // Se a data calculada já passou ou é hoje, avançar para o próximo mês
      if (adjustedDate <= today) {
        // Avançar para o próximo mês
        adjustedDate = new Date(currentYear, currentMonth + 1, dayOfMonth)
        adjustedDate.setHours(0, 0, 0, 0)
        
        // Se o dia não existe no mês (ex: 31/02), usar o último dia do mês
        if (adjustedDate.getDate() !== dayOfMonth) {
          // Criar data para o primeiro dia do mês seguinte, depois voltar 1 dia
          adjustedDate = new Date(currentYear, currentMonth + 2, 0)
          adjustedDate.setHours(0, 0, 0, 0)
        }
      }
      
      return adjustedDate
    }
    
    // Para alertas não recorrentes, retornar a data original
    return dueDate
  }

  /**
   * Obtém o número de dias até o vencimento, considerando ajustes para alertas recorrentes.
   */
  const getDaysUntilDue = (alert: Alert): number => {
    if (!alert.due_date) return 0
    
    const adjustedDate = getAdjustedDueDate(alert)
    if (!adjustedDate) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const diffTime = adjustedDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  /**
   * Formata a data de vencimento mostrando o dia do mês, considerando ajustes para alertas recorrentes.
   */
  const formatDueDate = (alert: Alert): string | null => {
    if (!alert.due_date) return null
    
    const adjustedDate = getAdjustedDueDate(alert)
    if (!adjustedDate) return formatDate(alert.due_date)
    
    return adjustedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
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
    setAlertToDismiss(id)
    setDismissConfirmOpen(true)
  }

  const confirmDismissAlert = async () => {
    if (!alertToDismiss) return
    
    const success = await dismissAlert(alertToDismiss)
    if (success) {
      toast({
        title: "Sucesso",
        description: "Alerta dispensado com sucesso",
      })
      announceToScreenReader("Alerta dispensado")
    }
    setDismissConfirmOpen(false)
    setAlertToDismiss(null)
  }

  const handleCompleteAlert = (id: string) => {
    setAlertToComplete(id)
    setCompleteConfirmOpen(true)
  }

  const confirmCompleteAlert = async () => {
    if (!alertToComplete) return
    
    const success = await completeAlert(alertToComplete)
    if (success) {
      toast({
        title: "Sucesso",
        description: "Alerta marcado como concluído",
      })
      announceToScreenReader("Alerta marcado como concluído")
    }
    setCompleteConfirmOpen(false)
    setAlertToComplete(null)
  }

  const handleDeleteAlert = (id: string) => {
    setAlertToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteAlert = async () => {
    if (!alertToDelete) return
    
    const success = await deleteAlert(alertToDelete)
    if (success) {
      toast({
        title: "Sucesso",
        description: "Alerta excluído com sucesso",
      })
      announceToScreenReader("Alerta excluído")
    }
    setDeleteConfirmOpen(false)
    setAlertToDelete(null)
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
    setActiveTab("new") // Muda para a aba "Novo Alerta" ao editar
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!newAlert.title.trim()) {
      newErrors.title = "Título é obrigatório"
    }

    if (newAlert.amount !== undefined && newAlert.amount <= 0) {
      newErrors.amount = "Valor deve ser maior que zero"
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
    setActiveTab("active") // Volta para a aba "Ativos" após criar/atualizar
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

  // Filter out any undefined/null alerts and ensure we have valid data
  const validAlerts = (alerts || []).filter((alert) => alert != null && typeof alert === 'object')
  const activeAlerts = validAlerts.filter((alert) => alert.status === "active")
  const urgentAlerts = activeAlerts.filter((alert) => alert.priority === "high")
  const upcomingBills = activeAlerts.filter(
    (alert) => alert.type === "bill" && alert.due_date && getDaysUntilDue(alert) <= 7,
  )

  return (
    <div className="space-y-8">
        {/* Error Alert */}
        {error && (
          <AlertComponent variant="destructive">
            <MaterialIcon name="alert-circle" size={16} aria-label="Erro" />
            <AlertDescription>{error}</AlertDescription>
          </AlertComponent>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Ativos ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
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
                              Vence em: {getDaysUntilDue(alert)} dias ({formatDueDate(alert)})
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

                    {alert.status === "active" && (
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
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Todos os Alertas */}
        <TabsContent value="all" className="space-y-4">
          {!loading && validAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MaterialIcon name="inbox" size={48} className="text-muted-foreground mb-4" tooltip="Nenhum alerta" aria-hidden={true} />
                <h3 className="text-lg font-semibold mb-2">Nada para mostrar aqui</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Não há alertas disponíveis no momento. Crie um novo alerta para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            validAlerts.map((alert) => (
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

                    {alert.status === "active" && (
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
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ABA "CONFIGURAÇÕES" REMOVIDA: A categoria de configurações foi inibida conforme solicitado
            O código abaixo está preservado para possível reativação futura.
            NOTIFICAÇÕES DESABILITADAS: Configurações de notificação automática comentadas
            O sistema não envia notificações automáticas (email, SMS, push, etc.) no momento.
        */}
        {/* 
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MaterialIcon name="settings" size={20} aria-label="Configurações" />
                <span>Configurações de Notificação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AlertComponent>
                <MaterialIcon name="info" size={16} aria-label="Informação" />
                <AlertDescription>
                  <strong>Notificações automáticas não disponíveis</strong>
                  <br />
                  O sistema de notificações automáticas (email, SMS, push notifications) ainda não está implementado.
                  As configurações abaixo estão desabilitadas e não geram envio de notificações.
                </AlertDescription>
              </AlertComponent>

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
        */}

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
                        setErrors(prev => {
                          const { title, ...rest } = prev
                          return rest
                        })
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
                        setErrors(prev => {
                          const { amount, ...rest } = prev
                          return rest
                        })
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
                        setErrors(prev => {
                          const { due_date, ...rest } = prev
                          return rest
                        })
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

      {/* Dialog de confirmação para dispensar alerta */}
      <AlertDialog open={dismissConfirmOpen} onOpenChange={setDismissConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Dispensar Alerta</AlertDialogTitle>
            <AlertDialogDescription>
              Dispensar um alerta significa desativá-lo definitivamente. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertToDismiss(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDismissAlert}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={completeConfirmOpen} onOpenChange={setCompleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Conclusão do Alerta</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja concluir este alerta? Após concluído, não será possível reativá-lo. Será necessário criar um novo alerta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertToComplete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCompleteAlert}>
              Sim, Concluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão do Alerta</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir este alerta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAlert}>
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
