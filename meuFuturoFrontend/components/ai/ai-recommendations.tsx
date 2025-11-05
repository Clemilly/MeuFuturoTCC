"use client";

import { useState } from "react";
import { useAIRecommendations } from "@/hooks/use-ai-recommendations";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MaterialIcon } from "@/lib/material-icons";
import type { PersonalizedRecommendation } from "@/hooks/use-advanced-ai-dashboard";

export function AIRecommendations() {
  const { recommendations, loading, refresh, submitFeedback } =
    useAIRecommendations(10);
  const [selectedRec, setSelectedRec] =
    useState<PersonalizedRecommendation | null>(null);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return colors[priority] || "default";
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgent" || priority === "high")
      return <MaterialIcon name="zap" size={16} tooltip="Urgente" aria-hidden={true} />;
    return <MaterialIcon name="lightbulb" size={16} tooltip="Recomendação" aria-hidden={true} />;
  };

  const handleImplemented = async (rec: PersonalizedRecommendation) => {
    await submitFeedback(rec.id, 5, true, true, "Implementado");
    refresh();
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Alert>
        <MaterialIcon name="lightbulb" size={16} tooltip="Nenhuma recomendação" aria-hidden={true} />
        <AlertDescription>
          Nenhuma recomendação disponível no momento. Continue registrando suas
          transações para receber insights personalizados.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Recomendações de IA
          </h2>
          <p className="text-muted-foreground">
            Sugestões personalizadas para otimizar suas finanças
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <MaterialIcon name="refresh-cw" size={16} className="mr-2" tooltip="Atualizar" aria-hidden={true} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {getPriorityIcon(rec.priority)}
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {rec.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={getPriorityColor(rec.priority) as any}>
                  {rec.priority === "urgent" ? "Urgente" : 
                   rec.priority === "high" ? "Alta" : 
                   rec.priority === "medium" ? "Média" : 
                   rec.priority === "low" ? "Baixa" : rec.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Impacto Potencial
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    +R${" "}
                    {(() => {
                      // Convert potential_impact to number if it's a string (from Decimal)
                      let impactValue: number;
                      if (typeof rec.potential_impact === "number") {
                        impactValue = rec.potential_impact;
                      } else if (typeof rec.potential_impact === "string") {
                        impactValue = parseFloat(rec.potential_impact) || 0;
                      } else {
                        impactValue = 0;
                      }
                      return impactValue > 0 ? impactValue.toFixed(2) : "0.00";
                    })()}
                    /mês
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Confiança IA</p>
                  <p className="text-xl font-bold">
                    {typeof rec.ai_confidence === "number"
                      ? (rec.ai_confidence * 100).toFixed(0)
                      : "0"}
                    %
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Confiança da IA</span>
                  <span>
                    {typeof rec.ai_confidence === "number"
                      ? (rec.ai_confidence * 100).toFixed(0)
                      : "0"}
                    %
                  </span>
                </div>
                <Progress value={rec.ai_confidence * 100} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MaterialIcon name="clock" size={16} className="text-muted-foreground" tooltip="Tempo estimado" aria-hidden={true} />
                  <span>{rec.estimated_time}</span>
                </div>
                <Badge variant="outline">
                  {rec.difficulty === "easy" ? "Fácil" : 
                   rec.difficulty === "medium" ? "Médio" : 
                   rec.difficulty === "hard" ? "Difícil" : rec.difficulty}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedRec(rec)}
                  >
                    Ver Detalhes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{rec.title}</DialogTitle>
                    <DialogDescription>{rec.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Impacto Mensal</p>
                        <p className="text-2xl font-bold text-green-600">
                          +R${" "}
                          {(() => {
                            // Convert potential_impact to number if it's a string (from Decimal)
                            let impactValue: number;
                            if (typeof rec.potential_impact === "number") {
                              impactValue = rec.potential_impact;
                            } else if (typeof rec.potential_impact === "string") {
                              impactValue = parseFloat(rec.potential_impact) || 0;
                            } else {
                              impactValue = 0;
                            }
                            return impactValue > 0 ? impactValue.toFixed(2) : "0.00";
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Probabilidade de Sucesso
                        </p>
                        <p className="text-2xl font-bold">
                          {typeof rec.success_probability === "number"
                            ? rec.success_probability.toFixed(0)
                            : "0"}
                          %
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">
                        Passos para Implementar
                      </h4>
                      <ol className="space-y-2">
                        {rec.implementation_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                              {index + 1}
                            </span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleImplemented(rec)}
                      >
                        <MaterialIcon name="check-circle" size={16} className="mr-2" tooltip="Marcar como implementado" aria-hidden={true} />
                        Já Implementei
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button className="flex-1" onClick={() => handleImplemented(rec)}>
                <MaterialIcon name="check-circle" size={16} className="mr-2" tooltip="Concluir" aria-hidden={true} />
                Concluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
