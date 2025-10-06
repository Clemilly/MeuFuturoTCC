"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import type { Category, CategoryCreate } from "@/lib/types";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
}

const CATEGORY_COLORS = [
  { value: "#FF6B6B", label: "Vermelho" },
  { value: "#4ECDC4", label: "Turquesa" },
  { value: "#45B7D1", label: "Azul" },
  { value: "#96CEB4", label: "Verde" },
  { value: "#FFEAA7", label: "Amarelo" },
  { value: "#DDA0DD", label: "Roxo" },
  { value: "#98D8C8", label: "Verde Água" },
  { value: "#F7DC6F", label: "Dourado" },
  { value: "#BB8FCE", label: "Lavanda" },
  { value: "#85C1E9", label: "Azul Claro" },
];

const CATEGORY_ICONS = [
  { value: "utensils", label: "Utensílios" },
  { value: "car", label: "Carro" },
  { value: "home", label: "Casa" },
  { value: "shopping-cart", label: "Compras" },
  { value: "heart", label: "Saúde" },
  { value: "graduation-cap", label: "Educação" },
  { value: "gamepad2", label: "Entretenimento" },
  { value: "briefcase", label: "Trabalho" },
  { value: "plane", label: "Viagem" },
  { value: "gift", label: "Presente" },
];

export function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  const [formData, setFormData] = useState<CategoryCreate>({
    name: "",
    description: "",
    color: "#FF6B6B",
    icon: "utensils",
    type: "expense",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CategoryCreate>>({});

  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryCreate> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.length > 50) {
      newErrors.name = "Nome deve ter no máximo 50 caracteres";
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Descrição deve ter no máximo 200 caracteres";
    }

    if (!formData.color) {
      newErrors.color = "Cor é obrigatória";
    }

    if (!formData.icon) {
      newErrors.icon = "Ícone é obrigatório";
    }

    if (!formData.type) {
      newErrors.type = "Tipo é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.createCategory(formData);

      if (response.error) {
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });

      onSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      color: "#FF6B6B",
      icon: "utensils",
      type: "expense",
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof CategoryCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Categoria
          </DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar suas transações.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Alimentação"
              maxLength={50}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descrição opcional da categoria"
              maxLength={200}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                handleInputChange("type", value as "income" | "expense")
              }
            >
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor *</Label>
            <Select
              value={formData.color}
              onValueChange={(value) => handleInputChange("color", value)}
            >
              <SelectTrigger className={errors.color ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione uma cor">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: formData.color }}
                    />
                    {
                      CATEGORY_COLORS.find((c) => c.value === formData.color)
                        ?.label
                    }
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ícone *</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => handleInputChange("icon", value)}
            >
              <SelectTrigger className={errors.icon ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione um ícone" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ICONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.icon && (
              <p className="text-sm text-red-500">{errors.icon}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}









