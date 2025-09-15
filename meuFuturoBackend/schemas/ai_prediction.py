"""
AI Prediction-related Pydantic schemas for request/response validation.

Includes schemas for AI insights, predictions, and financial analysis.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from decimal import Decimal

from models.ai_prediction import PredictionType, PredictionStatus


class PredictionBase(BaseModel):
    """Base prediction schema with common fields."""
    
    type: PredictionType = Field(..., description="Type of prediction")
    title: str = Field(..., min_length=1, max_length=255, description="Prediction title")
    description: str = Field(..., min_length=1, description="Detailed description")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="AI confidence level (0.0-1.0)")


class PredictionRequest(BaseModel):
    """Schema for requesting AI predictions."""
    
    prediction_types: List[PredictionType] = Field(..., description="Types of predictions to generate")
    time_horizon: int = Field(30, ge=1, le=365, description="Prediction time horizon in days")
    include_recommendations: bool = Field(True, description="Include actionable recommendations")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "prediction_types": ["savings_projection", "expense_forecast"],
                "time_horizon": 90,
                "include_recommendations": True
            }
        }
    )


class AIPredictionResponse(PredictionBase):
    """Schema for AI prediction response."""
    
    id: str = Field(..., description="Unique prediction identifier")
    predicted_value: Optional[Decimal] = Field(None, description="Main predicted value")
    prediction_date: Optional[date] = Field(None, description="Date this prediction was made for")
    expires_at: Optional[datetime] = Field(None, description="When this prediction expires")
    status: PredictionStatus = Field(..., description="Current prediction status")
    confidence_percentage: int = Field(..., description="Confidence as percentage (0-100)")
    is_high_confidence: bool = Field(..., description="Whether this is high confidence")
    is_expired: bool = Field(..., description="Whether prediction has expired")
    days_until_expiry: Optional[int] = Field(None, description="Days until expiry")
    prediction_metadata: Optional[Dict[str, Any]] = Field(None, description="Additional prediction data")
    user_id: str = Field(..., description="Owner of the prediction")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "type": "savings_projection",
                "title": "Projeção de Poupança - 3 Meses",
                "description": "Com base no seu padrão atual, você pode economizar R$ 2.400 nos próximos 3 meses",
                "confidence_score": 0.85,
                "confidence_percentage": 85,
                "predicted_value": 2400.00,
                "prediction_date": "2025-04-24",
                "expires_at": "2025-04-30T23:59:59Z",
                "status": "active",
                "is_high_confidence": True,
                "is_expired": False,
                "days_until_expiry": 90,
                "metadata": {
                    "scenario": "moderate",
                    "factors": ["consistent_income", "stable_expenses"]
                },
                "user_id": "789e0123-e89b-12d3-a456-426614174000",
                "created_at": "2025-01-24T10:00:00Z",
                "updated_at": "2025-01-24T10:00:00Z"
            }
        }
    )


class FinancialInsights(BaseModel):
    """Schema for comprehensive financial insights."""
    
    health_score: int = Field(..., ge=0, le=100, description="Financial health score (0-100)")
    health_label: str = Field(..., description="Health score label")
    risk_level: str = Field(..., description="Financial risk level")
    monthly_trend: str = Field(..., description="Monthly trend direction")
    
    # Predictions
    predictions: List[AIPredictionResponse] = Field(..., description="AI predictions")
    
    # Savings projections
    savings_projection: Dict[str, Dict[str, Decimal]] = Field(..., description="Savings projections by scenario")
    
    # Spending patterns
    spending_patterns: List[Dict[str, Any]] = Field(..., description="Spending pattern analysis")
    
    # Recommendations
    recommendations: List[Dict[str, Any]] = Field(..., description="Personalized recommendations")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "health_score": 75,
                "health_label": "Boa",
                "risk_level": "Baixo",
                "monthly_trend": "Positiva",
                "predictions": [],
                "savings_projection": {
                    "conservative": {"six_months": 7200.00, "one_year": 14400.00},
                    "moderate": {"six_months": 8400.00, "one_year": 16800.00},
                    "optimistic": {"six_months": 9600.00, "one_year": 19200.00}
                },
                "spending_patterns": [
                    {
                        "category": "Alimentação",
                        "percentage": 35,
                        "trend": "stable",
                        "recommendation": "Dentro do esperado"
                    }
                ],
                "recommendations": [
                    {
                        "title": "Otimize Transporte",
                        "description": "Considere usar transporte público 2x por semana",
                        "priority": "high",
                        "category": "Economia",
                        "potential_savings": 120.00
                    }
                ]
            }
        }
    )


class SpendingPattern(BaseModel):
    """Schema for spending pattern analysis."""
    
    category: str = Field(..., description="Category name")
    percentage: float = Field(..., ge=0, le=100, description="Percentage of total spending")
    trend: str = Field(..., description="Trend direction (increasing, decreasing, stable)")
    recommendation: str = Field(..., description="Recommendation for this category")
    average_monthly: Decimal = Field(..., description="Average monthly spending")
    last_month_change: float = Field(..., description="Percentage change from last month")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "category": "Alimentação",
                "percentage": 35.5,
                "trend": "stable",
                "recommendation": "Dentro do esperado para seu perfil",
                "average_monthly": 1200.00,
                "last_month_change": 2.5
            }
        }
    )


class FinancialRecommendation(BaseModel):
    """Schema for AI-generated financial recommendations."""
    
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    priority: str = Field(..., description="Priority level (low, medium, high)")
    category: str = Field(..., description="Recommendation category")
    potential_savings: Optional[Decimal] = Field(None, description="Potential monthly savings")
    implementation_difficulty: str = Field(..., description="Implementation difficulty (easy, medium, hard)")
    estimated_time: str = Field(..., description="Estimated time to implement")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Otimize Gastos com Transporte",
                "description": "Use transporte público 2 vezes por semana e economize cerca de R$ 120 por mês",
                "priority": "high", 
                "category": "Economia",
                "potential_savings": 120.00,
                "implementation_difficulty": "easy",
                "estimated_time": "1 semana"
            }
        }
    )


class BudgetAnalysis(BaseModel):
    """Schema for budget analysis and recommendations."""
    
    current_budget: Optional[Decimal] = Field(None, description="Current monthly budget")
    recommended_budget: Decimal = Field(..., description="AI recommended budget")
    budget_variance: float = Field(..., description="Variance percentage from recommended")
    category_recommendations: List[Dict[str, Any]] = Field(..., description="Category-specific budget recommendations")
    savings_potential: Decimal = Field(..., description="Potential monthly savings")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "current_budget": 4000.00,
                "recommended_budget": 3800.00,
                "budget_variance": -5.0,
                "category_recommendations": [
                    {
                        "category": "Alimentação",
                        "current": 1400.00,
                        "recommended": 1200.00,
                        "reason": "Acima da média para sua faixa de renda"
                    }
                ],
                "savings_potential": 200.00
            }
        }
    )


class GoalProjection(BaseModel):
    """Schema for financial goal projections."""
    
    goal_id: str = Field(..., description="Goal identifier")
    goal_name: str = Field(..., description="Goal name")
    current_amount: Decimal = Field(..., description="Current saved amount")
    target_amount: Decimal = Field(..., description="Target amount")
    projected_completion_date: date = Field(..., description="Projected completion date")
    monthly_contribution_needed: Decimal = Field(..., description="Monthly contribution needed")
    probability_of_success: float = Field(..., ge=0, le=100, description="Success probability percentage")
    recommendations: List[str] = Field(..., description="Recommendations to achieve goal")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "goal_id": "123e4567-e89b-12d3-a456-426614174000",
                "goal_name": "Reserva de Emergência",
                "current_amount": 3000.00,
                "target_amount": 15000.00,
                "projected_completion_date": "2026-06-15",
                "monthly_contribution_needed": 800.00,
                "probability_of_success": 85.0,
                "recommendations": [
                    "Automatize a transferência para poupança",
                    "Reduza gastos supérfluos em 10%"
                ]
            }
        }
    )
