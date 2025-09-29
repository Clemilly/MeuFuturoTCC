/**
 * Unified transaction form for create and edit operations
 * Modern design with real-time validation and smart features
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Save,
  X,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  Category,
} from "@/lib/types";

interface TransactionFormProps {
  mode: "create" | "edit";
  transaction?: Transaction;
  categories: Category[];
  loading: boolean;
  categoriesLoading?: boolean;
  onSubmit: (
    data: TransactionCreate | TransactionUpdate
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

// Form data interface
interface FormData {
  type: "income" | "expense";
  amount: string;
  description: string;
  transaction_date: string;
  notes: string;
  category_id: string;
}

// Form errors interface
interface FormErrors {
  type?: string;
  amount?: string;
  description?: string;
  transaction_date?: string;
  category_id?: string;
  general?: string;
}

// Quick amount presets
const quickAmounts = [10, 25, 50, 100, 200, 500, 1000];

// Common descriptions for autocomplete
const commonDescriptions = {
  income: [
    "Salário",
    "Freelance",
    "Venda",
    "Investimento",
    "Bônus",
    "Reembolso",
    "Aluguel recebido",
    "Dividendos",
  ],
  expense: [
    "Alimentação",
    "Transporte",
    "Uber",
    "Supermercado",
    "Farmácia",
    "Energia",
    "Água",
    "Internet",
    "Aluguel",
    "Combustível",
  ],
};

export function TransactionForm({
  mode,
  transaction,
  categories,
  loading,
  categoriesLoading = false,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    type: "expense",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "",
    category_id: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (mode === "edit" && transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        transaction_date: transaction.transaction_date,
        notes: transaction.notes || "",
        category_id: transaction.category?.id || "",
      });
    }
  }, [mode, transaction]);

  // Format currency
  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = "Data é obrigatória";
    }

    // Validate date is not in the future
    const selectedDate = new Date(formData.transaction_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
      newErrors.transaction_date = "Data não pode ser no futuro";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const submitData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        transaction_date: formData.transaction_date,
        notes: formData.notes.trim() || undefined,
        category_id:
          formData.category_id && formData.category_id !== "none"
            ? formData.category_id
            : undefined,
      };

      const result = await onSubmit(submitData);

      if (!result.success) {
        setErrors({ general: result.error || "Erro ao salvar transação" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ general: "Erro inesperado ao salvar transação" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount: number) => {
    handleInputChange("amount", amount.toString());
  };

  // Handle common description selection
  const handleCommonDescription = (description: string) => {
    handleInputChange("description", description);
  };

  // Filter categories by type
  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) => !formData.type || cat.type === formData.type || !cat.type
    );
  }, [categories, formData.type]);

  // Get common descriptions for current type
  const currentCommonDescriptions = useMemo(() => {
    return commonDescriptions[formData.type] || [];
  }, [formData.type]);

  // Get transaction icon
  const getTransactionIcon = useMemo(() => {
    return formData.type === "income" ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-600" />
    );
  }, [formData.type]);

  // Get form title
  const formTitle = useMemo(() => {
    return mode === "create" ? "Nova Transação" : "Editar Transação";
  }, [mode]);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getTransactionIcon}
          {formTitle}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General error */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Tipo de Transação *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "income" | "expense") =>
                handleInputChange("type", value)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Despesa
                  </div>
                </SelectItem>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Receita
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
              {formData.amount && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.amount)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">Data *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) =>
                    handleInputChange("transaction_date", e.target.value)
                  }
                  className="pl-10"
                  disabled={isSubmitting}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.transaction_date && (
                <p className="text-sm text-destructive">
                  {errors.transaction_date}
                </p>
              )}
            </div>
          </div>

          {/* Quick Amount Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Valores Rápidos</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="h-6 px-2 text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                {showQuickActions ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
            {showQuickActions && (
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(amount)}
                    className="h-8 px-3 text-xs"
                    disabled={isSubmitting}
                  >
                    R$ {amount}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Salário, Almoço, Uber..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}

            {/* Common descriptions */}
            {currentCommonDescriptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Descrições comuns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentCommonDescriptions.map((desc) => (
                    <Button
                      key={desc}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCommonDescription(desc)}
                      className="h-6 px-2 text-xs"
                      disabled={isSubmitting}
                    >
                      {desc}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleInputChange("category_id", value)}
              disabled={isSubmitting || categoriesLoading}
            >
              <SelectTrigger>
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? "Carregando categorias..."
                      : "Selecione a categoria"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
                      Carregando categorias...
                    </div>
                  </SelectItem>
                ) : (
                  filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais (opcional)"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <Separator />

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting
                ? "Salvando..."
                : mode === "create"
                ? "Criar Transação"
                : "Salvar Alterações"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
