import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

export interface Alert {
  id: string;
  type: "bill" | "goal" | "budget" | "income" | "custom";
  title: string;
  description: string;
  amount?: number;
  due_date?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "dismissed" | "completed";
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  days_until_due?: number;
  is_overdue?: boolean;
}

export interface AlertCreate {
  type: Alert["type"];
  title: string;
  description: string;
  amount?: number;
  due_date?: string;
  priority: Alert["priority"];
  is_recurring: boolean;
}

export interface AlertUpdate {
  title?: string;
  description?: string;
  amount?: number;
  due_date?: string;
  priority?: Alert["priority"];
  is_recurring?: boolean;
}

export interface NotificationSettings {
  billReminders: boolean;
  budgetAlerts: boolean;
  goalUpdates: boolean;
  weeklyReports: boolean;
  reminderDays: number;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load alerts from API
  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get("/financial/alerts");
      setAlerts(response.data || []);
    } catch (err) {
      console.error("Error loading alerts:", err);
      setError("Erro ao carregar alertas");
    } finally {
      setLoading(false);
    }
  };

  // Create new alert
  const createAlert = async (alertData: AlertCreate): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.post("/financial/alerts", alertData);
      setAlerts(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      console.error("Error creating alert:", err);
      setError("Erro ao criar alerta");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update alert
  const updateAlert = async (alertId: string, alertData: AlertUpdate): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.put(`/financial/alerts/${alertId}`, alertData);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? response.data : alert
      ));
      return true;
    } catch (err) {
      console.error("Error updating alert:", err);
      setError("Erro ao atualizar alerta");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete alert
  const deleteAlert = async (alertId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.delete(`/financial/alerts/${alertId}`);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      return true;
    } catch (err) {
      console.error("Error deleting alert:", err);
      setError("Erro ao excluir alerta");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Dismiss alert
  const dismissAlert = async (alertId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.put(`/financial/alerts/${alertId}/dismiss`);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? response.data : alert
      ));
      return true;
    } catch (err) {
      console.error("Error dismissing alert:", err);
      setError("Erro ao dispensar alerta");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Complete alert
  const completeAlert = async (alertId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.put(`/financial/alerts/${alertId}/complete`);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? response.data : alert
      ));
      return true;
    } catch (err) {
      console.error("Error completing alert:", err);
      setError("Erro ao marcar alerta como concluído");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate smart alerts
  const generateSmartAlerts = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.post("/financial/alerts/generate");
      setAlerts(prev => [...response.data, ...prev]);
      return true;
    } catch (err) {
      console.error("Error generating smart alerts:", err);
      setError("Erro ao gerar alertas inteligentes");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load alerts on mount
  useEffect(() => {
    loadAlerts();
  }, []);

  return {
    alerts,
    loading,
    error,
    loadAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    dismissAlert,
    completeAlert,
    generateSmartAlerts,
  };
}
