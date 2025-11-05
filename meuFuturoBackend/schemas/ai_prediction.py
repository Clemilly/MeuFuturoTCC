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


# Advanced AI Schemas for Enhanced Features

class AdvancedMetrics(BaseModel):
    """Schema for advanced financial metrics."""
    
    savings_rate: float = Field(..., description="Current savings rate percentage")
    ideal_savings_rate: float = Field(..., description="Ideal savings rate for user profile")
    liquidity_score: int = Field(..., ge=0, le=100, description="Financial liquidity score")
    diversification_score: int = Field(..., ge=0, le=100, description="Spending diversification score")
    stability_index: float = Field(..., description="Financial stability index")
    expense_volatility: float = Field(..., description="Expense volatility percentage")
    income_consistency: float = Field(..., description="Income consistency score")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "savings_rate": 22.5,
                "ideal_savings_rate": 20.0,
                "liquidity_score": 78,
                "diversification_score": 65,
                "stability_index": 0.82,
                "expense_volatility": 12.3,
                "income_consistency": 0.95
            }
        }
    )


class CashFlowPrediction(BaseModel):
    """Schema for cash flow predictions."""
    
    month: str = Field(..., description="Month reference (YYYY-MM)")
    predicted_income: Decimal = Field(..., description="Predicted income")
    predicted_expenses: Decimal = Field(..., description="Predicted expenses")
    predicted_balance: Decimal = Field(..., description="Predicted balance")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence")
    risk_factors: List[str] = Field(default_factory=list, description="Identified risk factors")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "month": "2025-04",
                "predicted_income": 5000.00,
                "predicted_expenses": 3800.00,
                "predicted_balance": 1200.00,
                "confidence": 0.87,
                "risk_factors": ["Gasto sazonal esperado com educação"]
            }
        }
    )


class SeasonalPattern(BaseModel):
    """Schema for seasonal spending patterns."""
    
    category: str = Field(..., description="Category name")
    pattern_type: str = Field(..., description="Pattern type (monthly, quarterly, yearly)")
    peak_months: List[str] = Field(..., description="Months with peak spending")
    average_variation: float = Field(..., description="Average variation percentage")
    next_peak_date: Optional[date] = Field(None, description="Next expected peak date")
    recommendation: str = Field(..., description="Recommendation based on pattern")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "category": "Educação",
                "pattern_type": "yearly",
                "peak_months": ["January", "July"],
                "average_variation": 45.2,
                "next_peak_date": "2025-07-01",
                "recommendation": "Reserve R$ 800 adicionais para julho (material escolar)"
            }
        }
    )


class AnomalyDetection(BaseModel):
    """Schema for spending anomaly detection."""
    
    transaction_id: Optional[str] = Field(None, description="Transaction ID if specific")
    category: str = Field(..., description="Category name")
    amount: Decimal = Field(..., description="Anomalous amount")
    expected_range: Dict[str, Decimal] = Field(..., description="Expected amount range")
    anomaly_score: float = Field(..., ge=0, le=1, description="Anomaly score")
    detected_at: date = Field(..., description="Detection date")
    is_recurring: bool = Field(..., description="Whether this is a recurring anomaly")
    suggestion: str = Field(..., description="Suggestion for user")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "transaction_id": "abc123",
                "category": "Lazer",
                "amount": 850.00,
                "expected_range": {"min": 200.00, "max": 450.00},
                "anomaly_score": 0.92,
                "detected_at": "2025-01-15",
                "is_recurring": False,
                "suggestion": "Este gasto está 89% acima do seu padrão habitual. Foi planejado?"
            }
        }
    )


class FinancialSimulation(BaseModel):
    """Schema for financial scenario simulations."""
    
    scenario_name: str = Field(..., description="Scenario name")
    income_adjustment: float = Field(0, description="Income adjustment percentage")
    expense_adjustment: float = Field(0, description="Expense adjustment percentage")
    savings_increase: float = Field(0, description="Savings increase percentage")
    time_horizon_months: int = Field(..., ge=1, le=120, description="Simulation time horizon")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "scenario_name": "E se eu economizasse 10% mais?",
                "income_adjustment": 0,
                "expense_adjustment": -10,
                "savings_increase": 10,
                "time_horizon_months": 12
            }
        }
    )


class SimulationResult(BaseModel):
    """Schema for simulation results."""
    
    scenario_name: str = Field(..., description="Scenario name")
    final_balance: float = Field(..., description="Final projected balance")
    total_savings: float = Field(..., description="Total savings accumulated")
    monthly_average_balance: float = Field(..., description="Average monthly balance")
    goals_achievable: List[str] = Field(..., description="Goals achievable with this scenario")
    timeline_data: List[Dict[str, Any]] = Field(..., description="Month-by-month projection")
    comparison_to_current: Dict[str, Any] = Field(..., description="Comparison to current trajectory")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "scenario_name": "E se eu economizasse 10% mais?",
                "final_balance": 18500.00,
                "total_savings": 16200.00,
                "monthly_average_balance": 1350.00,
                "goals_achievable": ["Reserva de Emergência", "Viagem"],
                "timeline_data": [
                    {"month": "2025-02", "balance": 1200.00, "savings": 1200.00}
                ],
                "comparison_to_current": {
                    "balance_difference": 4500.00,
                    "percentage_improvement": 32.1
                }
            }
        }
    )


class PatternAnalysisAdvanced(BaseModel):
    """Schema for advanced pattern analysis."""
    
    temporal_patterns: Dict[str, Any] = Field(..., description="Time-based spending patterns")
    category_correlations: List[Dict[str, Any]] = Field(..., description="Category spending correlations")
    impulse_spending_score: float = Field(..., ge=0, le=100, description="Impulse spending tendency score")
    spending_by_weekday: Dict[str, Decimal] = Field(..., description="Average spending by day of week")
    spending_by_time: Dict[str, Decimal] = Field(..., description="Spending patterns by time of day")
    behavioral_insights: List[str] = Field(..., description="Behavioral insights identified")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "temporal_patterns": {
                    "peak_spending_day": "Friday",
                    "lowest_spending_day": "Tuesday",
                    "month_pattern": "decreasing_trend"
                },
                "category_correlations": [
                    {
                        "categories": ["Lazer", "Alimentação"],
                        "correlation": 0.78,
                        "insight": "Gastos com lazer geralmente acompanham aumento em alimentação"
                    }
                ],
                "impulse_spending_score": 35.2,
                "spending_by_weekday": {
                    "Monday": 120.00,
                    "Friday": 280.00
                },
                "spending_by_time": {
                    "morning": 450.00,
                    "afternoon": 680.00,
                    "evening": 920.00
                },
                "behavioral_insights": [
                    "Você tende a gastar mais nas sextas-feiras à noite",
                    "Compras matinais são geralmente mais planejadas"
                ]
            }
        }
    )


class PersonalizedRecommendation(BaseModel):
    """Schema for personalized AI recommendations."""
    
    id: str = Field(..., description="Recommendation ID")
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    category: str = Field(..., description="Recommendation category")
    priority: str = Field(..., description="Priority (low, medium, high, urgent)")
    potential_impact: Decimal = Field(..., description="Potential monthly impact")
    implementation_steps: List[str] = Field(..., description="Step-by-step implementation")
    difficulty: str = Field(..., description="Implementation difficulty")
    estimated_time: str = Field(..., description="Time to implement")
    success_probability: float = Field(..., ge=0, le=100, description="Success probability")
    related_goals: List[str] = Field(default_factory=list, description="Related goal IDs")
    ai_confidence: float = Field(..., ge=0, le=1, description="AI confidence in recommendation")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "rec_001",
                "title": "Otimize Gastos com Streaming",
                "description": "Você tem 4 assinaturas de streaming. Consolidar para 2 pode economizar R$ 60/mês",
                "category": "Entretenimento",
                "priority": "medium",
                "potential_impact": 60.00,
                "implementation_steps": [
                    "Revise quais serviços você realmente usa",
                    "Cancele assinaturas menos utilizadas",
                    "Considere planos família para economia"
                ],
                "difficulty": "easy",
                "estimated_time": "30 minutos",
                "success_probability": 92.0,
                "related_goals": ["goal_001"],
                "ai_confidence": 0.89
            }
        }
    )


class MonthlyAIReport(BaseModel):
    """Schema for monthly AI-generated report."""
    
    report_id: str = Field(..., description="Report ID")
    reference_month: str = Field(..., description="Month reference (YYYY-MM)")
    generated_at: datetime = Field(..., description="Report generation timestamp")
    
    # Summary
    executive_summary: str = Field(..., description="Executive summary in natural language")
    health_score: int = Field(..., ge=0, le=100, description="Monthly health score")
    health_score_change: int = Field(..., description="Change from previous month")
    
    # Financial metrics
    income_total: Decimal = Field(..., description="Total income")
    expense_total: Decimal = Field(..., description="Total expenses")
    savings_total: Decimal = Field(..., description="Total savings")
    savings_rate: float = Field(..., description="Savings rate percentage")
    
    # Insights
    key_insights: List[str] = Field(..., description="Key insights from AI analysis")
    achievements: List[str] = Field(..., description="Financial achievements this month")
    areas_for_improvement: List[str] = Field(..., description="Areas needing attention")
    
    # Predictions
    next_month_prediction: CashFlowPrediction = Field(..., description="Next month prediction")
    
    # Recommendations
    top_recommendations: List[PersonalizedRecommendation] = Field(..., description="Top recommendations")
    
    # Goals progress
    goals_progress: List[Dict[str, Any]] = Field(..., description="Progress on financial goals")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "report_id": "report_202501",
                "reference_month": "2025-01",
                "generated_at": "2025-02-01T00:00:00Z",
                "executive_summary": "Excelente mês! Você economizou 25% da sua renda e reduziu gastos com alimentação em 12%.",
                "health_score": 82,
                "health_score_change": 7,
                "income_total": 5000.00,
                "expense_total": 3750.00,
                "savings_total": 1250.00,
                "savings_rate": 25.0,
                "key_insights": [
                    "Gastos com transporte diminuíram 15% após uso de transporte público",
                    "Receitas extras aumentaram seu saldo em R$ 500"
                ],
                "achievements": [
                    "Meta de poupança mensal atingida",
                    "Orçamento de alimentação respeitado"
                ],
                "areas_for_improvement": [
                    "Gastos com lazer aumentaram 20%",
                    "Compras impulsivas detectadas"
                ],
                "next_month_prediction": {},
                "top_recommendations": [],
                "goals_progress": [
                    {
                        "goal_name": "Reserva de Emergência",
                        "progress": 45.0,
                        "on_track": True
                    }
                ]
            }
        }
    )


class AIFeedback(BaseModel):
    """Schema for user feedback on AI recommendations."""
    
    feedback_type: str = Field(..., description="Type: recommendation, prediction, report")
    item_id: str = Field(..., description="ID of the item being rated")
    rating: int = Field(..., ge=1, le=5, description="Rating 1-5")
    was_helpful: bool = Field(..., description="Whether it was helpful")
    was_implemented: Optional[bool] = Field(None, description="Whether user implemented suggestion")
    comments: Optional[str] = Field(None, description="User comments")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "feedback_type": "recommendation",
                "item_id": "rec_001",
                "rating": 5,
                "was_helpful": True,
                "was_implemented": True,
                "comments": "Ótima sugestão! Já cancelei 2 assinaturas."
            }
        }
    )


class AdvancedDashboard(BaseModel):
    """Schema for advanced AI dashboard data."""
    
    # Core metrics
    health_score: int = Field(..., ge=0, le=100, description="Financial health score")
    health_label: str = Field(..., description="Health label")
    risk_level: str = Field(..., description="Risk level")
    monthly_trend: str = Field(..., description="Trend direction")
    
    # Advanced metrics
    advanced_metrics: AdvancedMetrics = Field(..., description="Advanced financial metrics")
    
    # Predictions
    cash_flow_predictions: List[CashFlowPrediction] = Field(..., description="3, 6, 12 month predictions")
    seasonal_patterns: List[SeasonalPattern] = Field(default_factory=list, description="Seasonal patterns")
    anomalies: List[AnomalyDetection] = Field(default_factory=list, description="Recent anomalies")
    
    # Patterns
    spending_patterns: List[SpendingPattern] = Field(..., description="Spending patterns")
    pattern_analysis: PatternAnalysisAdvanced = Field(..., description="Advanced pattern analysis")
    
    # Recommendations
    recommendations: List[PersonalizedRecommendation] = Field(..., description="Top recommendations")
    
    # Goals
    goal_projections: List[GoalProjection] = Field(default_factory=list, description="Goal projections")
    
    # Savings
    savings_projection: Dict[str, Dict[str, Decimal]] = Field(..., description="Savings projections")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "health_score": 78,
                "health_label": "Boa",
                "risk_level": "Baixo",
                "monthly_trend": "Positiva",
                "advanced_metrics": {},
                "cash_flow_predictions": [],
                "seasonal_patterns": [],
                "anomalies": [],
                "spending_patterns": [],
                "pattern_analysis": {},
                "recommendations": [],
                "goal_projections": [],
                "savings_projection": {}
            }
        }
    )