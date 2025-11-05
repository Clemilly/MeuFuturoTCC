"""
AI service for financial predictions and insights.

Handles AI-powered financial analysis, predictions, and recommendations.
"""

from typing import Optional, List, Dict, Any
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import structlog
import random
import numpy as np
from sklearn.linear_model import LinearRegression

from repositories.ai_prediction import AIPredictionRepository
from repositories.transaction import TransactionRepository
from repositories.user import UserRepository
from schemas.ai_prediction import (
    PredictionRequest,
    FinancialInsights,
    SpendingPattern,
    FinancialRecommendation,
    BudgetAnalysis,
    GoalProjection,
)
from models.ai_prediction import AIPrediction, PredictionType, PredictionStatus
from models.transaction import TransactionType
from core.config import settings

logger = structlog.get_logger()


class AIService:
    """Service for AI-powered financial analysis and predictions."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.prediction_repo = AIPredictionRepository(db)
        self.transaction_repo = TransactionRepository(db)
        self.user_repo = UserRepository(db)
    
    async def generate_predictions(
        self,
        user_id: str,
        request: PredictionRequest,
    ) -> List[AIPrediction]:
        """
        Generate AI predictions for a user.
        
        Args:
            user_id: User ID
            request: Prediction request parameters
            
        Returns:
            List of generated predictions
        """
        # Validate user exists
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        predictions = []
        
        for prediction_type in request.prediction_types:
            try:
                if prediction_type == PredictionType.SAVINGS_PROJECTION:
                    prediction = await self._generate_savings_projection(
                        user_id, request.time_horizon
                    )
                elif prediction_type == PredictionType.EXPENSE_FORECAST:
                    prediction = await self._generate_expense_forecast(
                        user_id, request.time_horizon
                    )
                elif prediction_type == PredictionType.INCOME_PREDICTION:
                    prediction = await self._generate_income_prediction(
                        user_id, request.time_horizon
                    )
                elif prediction_type == PredictionType.FINANCIAL_HEALTH:
                    prediction = await self._generate_financial_health_score(user_id)
                else:
                    continue  # Skip unsupported prediction types
                
                if prediction:
                    predictions.append(prediction)
                    
            except Exception as e:
                logger.error(
                    "Error generating prediction",
                    user_id=user_id,
                    prediction_type=prediction_type,
                    error=str(e)
                )
                continue
        
        logger.info(
            "Predictions generated",
            user_id=user_id,
            count=len(predictions),
            types=[p.type for p in predictions]
        )
        
        return predictions
    
    async def get_financial_insights(self, user_id: str) -> FinancialInsights:
        """
        Get comprehensive financial insights for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Financial insights
        """
        # Get recent predictions
        predictions = await self.prediction_repo.get_active_predictions(user_id)
        
        # Calculate financial health score
        health_score = await self._calculate_health_score(user_id)
        
        # Get spending patterns
        spending_patterns = await self._analyze_spending_patterns(user_id)
        
        # Generate recommendations
        recommendations = await self._generate_recommendations(user_id, spending_patterns)
        
        # Get savings projections
        savings_projection = await self._get_savings_projections(user_id)
        
        return FinancialInsights(
            health_score=health_score["score"],
            health_label=health_score["label"],
            risk_level=health_score["risk_level"],
            monthly_trend=health_score["trend"],
            predictions=predictions,
            savings_projection=savings_projection,
            spending_patterns=[pattern.dict() for pattern in spending_patterns],
            recommendations=[rec.dict() for rec in recommendations],
        )
    
    async def _generate_savings_projection(
        self,
        user_id: str,
        time_horizon: int,
    ) -> Optional[AIPrediction]:
        """Generate savings projection prediction."""
        # Get transaction history
        end_date = date.today()
        start_date = end_date - timedelta(days=90)  # Last 3 months
        
        summary = await self.transaction_repo.get_transaction_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        if summary["transaction_count"] < 5:
            return None  # Not enough data
        
        # Calculate monthly net savings
        monthly_net = summary["net_amount"] / 3  # 3 months average
        
        # Project savings
        projected_savings = monthly_net * (time_horizon / 30)
        
        # Calculate confidence based on transaction consistency
        confidence = min(0.9, max(0.3, summary["transaction_count"] / 50))
        
        # Set expiration date
        expires_at = datetime.utcnow() + timedelta(days=time_horizon)
        
        return await self.prediction_repo.create(
            user_id=user_id,
            type=PredictionType.SAVINGS_PROJECTION,
            title=f"Projeção de Poupança - {time_horizon} dias",
            description=(
                f"Com base no seu padrão atual de {monthly_net:.2f}/mês, "
                f"você pode economizar {projected_savings:.2f} nos próximos {time_horizon} dias"
            ),
            confidence_score=confidence,
            predicted_value=projected_savings,
            prediction_date=end_date + timedelta(days=time_horizon),
            expires_at=expires_at,
            prediction_metadata={
                "monthly_average": float(monthly_net),
                "time_horizon_days": time_horizon,
                "data_points": summary["transaction_count"],
            }
        )
    
    async def _generate_expense_forecast(
        self,
        user_id: str,
        time_horizon: int,
    ) -> Optional[AIPrediction]:
        """Generate expense forecast prediction."""
        # Get expense history
        end_date = date.today()
        start_date = end_date - timedelta(days=90)
        
        summary = await self.transaction_repo.get_transaction_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        if summary["expense_count"] < 3:
            return None
        
        # Calculate monthly expenses
        monthly_expenses = summary["total_expenses"] / 3
        
        # Project expenses with seasonal adjustment
        seasonal_factor = 1.0
        if datetime.now().month in [11, 12]:  # Holiday season
            seasonal_factor = 1.15
        
        projected_expenses = monthly_expenses * (time_horizon / 30) * seasonal_factor
        
        confidence = min(0.85, max(0.4, summary["expense_count"] / 30))
        
        expires_at = datetime.utcnow() + timedelta(days=time_horizon)
        
        return await self.prediction_repo.create(
            user_id=user_id,
            type=PredictionType.EXPENSE_FORECAST,
            title=f"Previsão de Gastos - {time_horizon} dias",
            description=(
                f"Baseado no histórico, você pode gastar cerca de "
                f"{projected_expenses:.2f} nos próximos {time_horizon} dias"
            ),
            confidence_score=confidence,
            predicted_value=projected_expenses,
            prediction_date=end_date + timedelta(days=time_horizon),
            expires_at=expires_at,
            prediction_metadata={
                "monthly_average": float(monthly_expenses),
                "seasonal_factor": seasonal_factor,
                "time_horizon_days": time_horizon,
            }
        )
    
    async def _generate_income_prediction(
        self,
        user_id: str,
        time_horizon: int,
    ) -> Optional[AIPrediction]:
        """Generate income prediction."""
        # Get income history
        end_date = date.today()
        start_date = end_date - timedelta(days=90)
        
        summary = await self.transaction_repo.get_transaction_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        if summary["income_count"] < 2:
            return None
        
        # Calculate monthly income
        monthly_income = summary["total_income"] / 3
        
        # Project income
        projected_income = monthly_income * (time_horizon / 30)
        
        # High confidence for regular income
        confidence = min(0.95, max(0.6, summary["income_count"] / 10))
        
        expires_at = datetime.utcnow() + timedelta(days=time_horizon)
        
        return await self.prediction_repo.create(
            user_id=user_id,
            type=PredictionType.INCOME_PREDICTION,
            title=f"Previsão de Receita - {time_horizon} dias",
            description=(
                f"Com base no padrão de receitas, você deve receber cerca de "
                f"{projected_income:.2f} nos próximos {time_horizon} dias"
            ),
            confidence_score=confidence,
            predicted_value=projected_income,
            prediction_date=end_date + timedelta(days=time_horizon),
            expires_at=expires_at,
            prediction_metadata={
                "monthly_average": float(monthly_income),
                "time_horizon_days": time_horizon,
            }
        )
    
    async def _generate_financial_health_score(self, user_id: str) -> Optional[AIPrediction]:
        """Generate financial health score."""
        health_data = await self._calculate_health_score(user_id)
        
        expires_at = datetime.utcnow() + timedelta(days=30)  # Update monthly
        
        return await self.prediction_repo.create(
            user_id=user_id,
            type=PredictionType.FINANCIAL_HEALTH,
            title=f"Score de Saúde Financeira: {health_data['score']}/100",
            description=(
                f"Sua saúde financeira está {health_data['label'].lower()}. "
                f"Tendência: {health_data['trend'].lower()}"
            ),
            confidence_score=0.8,
            predicted_value=Decimal(str(health_data["score"])),
            expires_at=expires_at,
            prediction_metadata=health_data,
        )
    
    async def _calculate_health_score(self, user_id: str) -> Dict[str, Any]:
        """Calculate financial health score."""
        # Get 6-month summary
        end_date = date.today()
        start_date = end_date - timedelta(days=180)
        
        summary = await self.transaction_repo.get_transaction_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        score = 50  # Base score
        
        # Income vs Expenses ratio (0-30 points)
        if summary["total_income"] > 0:
            expense_ratio = float(summary["total_expenses"] / summary["total_income"])
            if expense_ratio < 0.5:
                score += 30
            elif expense_ratio < 0.7:
                score += 20
            elif expense_ratio < 0.9:
                score += 10
            elif expense_ratio > 1.2:
                score -= 20
        else:
            # No income - penalize heavily
            score -= 30
        
        # Savings rate (0-25 points)
        if summary["total_income"] > 0:
            savings_rate = float(summary["net_amount"] / summary["total_income"])
            if savings_rate > 0.2:
                score += 25
            elif savings_rate > 0.1:
                score += 15
            elif savings_rate > 0:
                score += 5
            else:
                score -= 15
        else:
            # No income - penalize
            score -= 15
        
        # Transaction consistency (0-15 points)
        expected_transactions = 30  # Rough estimate for 6 months
        consistency = min(1.0, summary["transaction_count"] / expected_transactions)
        score += int(consistency * 15)
        
        # Expense diversity (0-10 points) - placeholder
        # In a real implementation, analyze category distribution
        score += random.randint(5, 10)
        
        # Cap score between 0 and 100
        score = max(0, min(100, score))
        
        # Determine label and risk level
        if score >= 80:
            label = "Excelente"
            risk_level = "Muito Baixo"
        elif score >= 60:
            label = "Boa"
            risk_level = "Baixo"
        elif score >= 40:
            label = "Regular"
            risk_level = "Médio"
        else:
            label = "Precisa Atenção"
            risk_level = "Alto"
        
        # Determine trend (simplified)
        trend = "Estável"
        if summary["net_amount"] > 0:
            trend = "Positiva"
        elif summary["net_amount"] < -1000:
            trend = "Negativa"
        
        return {
            "score": score,
            "label": label,
            "risk_level": risk_level,
            "trend": trend,
            "income_expense_ratio": expense_ratio if summary["total_income"] > 0 else 0,
            "savings_rate": savings_rate if summary["total_income"] > 0 else 0,
        }
    
    async def _analyze_spending_patterns(self, user_id: str) -> List[SpendingPattern]:
        """Analyze user's spending patterns."""
        # Get category summary for last 3 months
        end_date = date.today()
        start_date = end_date - timedelta(days=90)
        
        category_summary = await self.transaction_repo.get_category_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            transaction_type=TransactionType.EXPENSE
        )
        
        patterns = []
        for cat in category_summary:
            # Determine trend (simplified)
            trend = "estável"
            if cat["percentage"] > 40:
                trend = "crescente"
            elif cat["percentage"] < 5:
                trend = "decrescente"
            
            # Generate recommendation
            recommendation = "Dentro do esperado"
            if cat["percentage"] > 35:
                recommendation = "Considere otimizar gastos nesta categoria"
            elif cat["percentage"] < 5:
                recommendation = "Categoria com gastos controlados"
            
            patterns.append(SpendingPattern(
                category=cat["category_name"],
                percentage=cat["percentage"],
                trend=trend,
                recommendation=recommendation,
                average_monthly=cat["total_amount"] / 3,
                last_month_change=random.uniform(-10, 10),  # Placeholder
            ))
        
        return patterns
    
    async def _generate_recommendations(
        self,
        user_id: str,
        spending_patterns: List[SpendingPattern],
    ) -> List[FinancialRecommendation]:
        """Generate personalized financial recommendations."""
        recommendations = []
        
        # Analyze spending patterns for recommendations
        for pattern in spending_patterns:
            if pattern.percentage > 35 and pattern.category != "Alimentação":
                recommendations.append(FinancialRecommendation(
                    title=f"Otimize Gastos com {pattern.category}",
                    description=(
                        f"Seus gastos com {pattern.category} representam {pattern.percentage:.1f}% "
                        f"do total. Considere reduzir em 10-15%."
                    ),
                    priority="high",
                    category="Economia",
                    potential_savings=pattern.average_monthly * Decimal("0.15"),
                    implementation_difficulty="medium",
                    estimated_time="2-4 semanas",
                ))
        
        # General recommendations
        if len([p for p in spending_patterns if p.trend == "crescente"]) > 2:
            recommendations.append(FinancialRecommendation(
                title="Controle de Gastos Gerais",
                description=(
                    "Várias categorias mostram tendência de aumento. "
                    "Revise seu orçamento e estabeleça limites mensais."
                ),
                priority="medium",
                category="Planejamento",
                potential_savings=None,
                implementation_difficulty="easy",
                estimated_time="1 semana",
            ))
        
        # Add a default positive recommendation
        if not recommendations:
            recommendations.append(FinancialRecommendation(
                title="Continue o Bom Trabalho!",
                description=(
                    "Seus gastos estão bem distribuídos. "
                    "Considere aumentar sua reserva de emergência."
                ),
                priority="low",
                category="Investimento",
                potential_savings=None,
                implementation_difficulty="easy",
                estimated_time="Contínuo",
            ))
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    async def _get_savings_projections(self, user_id: str) -> Dict[str, Dict[str, Decimal]]:
        """Get savings projections for different scenarios."""
        # Get current savings rate
        end_date = date.today()
        start_date = end_date - timedelta(days=90)
        
        summary = await self.transaction_repo.get_transaction_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        monthly_net = summary["net_amount"] / 3 if summary["net_amount"] > 0 else Decimal("0")
        
        return {
            "conservative": {
                "six_months": float(Decimal(str(monthly_net)) * 6 * Decimal("0.8")),
                "one_year": float(Decimal(str(monthly_net)) * 12 * Decimal("0.8")),
            },
            "moderate": {
                "six_months": float(Decimal(str(monthly_net)) * 6),
                "one_year": float(Decimal(str(monthly_net)) * 12),
            },
            "optimistic": {
                "six_months": float(Decimal(str(monthly_net)) * 6 * Decimal("1.2")),
                "one_year": float(Decimal(str(monthly_net)) * 12 * Decimal("1.2")),
            },
        }
    
    async def archive_old_predictions(self, days_old: int = 30) -> int:
        """Archive old predictions to keep the database clean."""
        return await self.prediction_repo.archive_expired_predictions()
    
    async def get_user_prediction_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get prediction statistics for a user."""
        return await self.prediction_repo.get_prediction_statistics(user_id)
