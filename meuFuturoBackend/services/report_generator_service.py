"""
Report Generator service for AI-powered financial reports.

Generates comprehensive monthly and custom financial reports.
"""

from typing import List, Dict, Any
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
import structlog
from uuid import uuid4

from repositories.transaction import TransactionRepository
from repositories.goal import GoalRepository
from schemas.ai_prediction import MonthlyAIReport, CashFlowPrediction, PersonalizedRecommendation
from services.recommendation_service import RecommendationService
from services.ai_service import AIService


logger = structlog.get_logger()


class ReportGeneratorService:
    """Service for generating AI-powered reports."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_repo = TransactionRepository(db)
        self.goal_repo = GoalRepository(db)
        self.recommendation_service = RecommendationService(db)
        self.ai_service = AIService(db)
        self.logger = logger.bind(service="report_generator")
    
    async def generate_monthly_report(
        self,
        user_id: str,
        reference_month: str  # Format: YYYY-MM
    ) -> MonthlyAIReport:
        """
        Generate comprehensive monthly AI report.
        
        Args:
            user_id: User ID
            reference_month: Month reference (YYYY-MM)
            
        Returns:
            Monthly AI report
        """
        self.logger.info(
            "generating_monthly_report",
            user_id=user_id,
            month=reference_month
        )
        
        # Parse reference month
        year, month = map(int, reference_month.split("-"))
        
        # Calculate date range for the month
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        # Get transactions for the month
        transactions = await self.transaction_repo.get_user_transactions(
            user_id=user_id,
            skip=0,
            limit=1000,
            start_date=start_date,
            end_date=end_date
        )
        
        # Calculate financial metrics
        income_total = sum(
            t.amount for t in transactions if t.type.value == "income"
        )
        expense_total = sum(
            t.amount for t in transactions if t.type.value == "expense"
        )
        savings_total = income_total - expense_total
        
        savings_rate = 0.0
        if income_total > 0:
            savings_rate = float(savings_total / income_total * 100)
        
        # Calculate health score for current month
        health_score = self._calculate_month_health_score(
            income_total,
            expense_total,
            transactions
        )
        
        # Calculate health score change (compare with previous month)
        health_score_change = await self._calculate_health_score_change(
            user_id,
            year,
            month,
            health_score
        )
        
        # Generate executive summary
        executive_summary = self._generate_executive_summary(
            income_total,
            expense_total,
            savings_total,
            savings_rate,
            health_score_change
        )
        
        # Generate key insights
        key_insights = await self._generate_key_insights(
            user_id,
            transactions,
            income_total,
            expense_total
        )
        
        # Identify achievements
        achievements = await self._identify_achievements(
            user_id,
            savings_rate,
            health_score_change,
            transactions
        )
        
        # Identify areas for improvement
        areas_for_improvement = self._identify_improvement_areas(
            savings_rate,
            transactions
        )
        
        # Generate next month prediction
        next_month_prediction = await self._predict_next_month(
            user_id,
            transactions
        )
        
        # Generate top recommendations
        top_recommendations = await self.recommendation_service.generate_recommendations(
            user_id,
            max_recommendations=5
        )
        
        # Get goals progress
        goals_progress = await self._get_goals_progress(user_id)
        
        return MonthlyAIReport(
            report_id=f"report_{reference_month.replace('-', '')}_{uuid4().hex[:8]}",
            reference_month=reference_month,
            generated_at=datetime.utcnow(),
            executive_summary=executive_summary,
            health_score=health_score,
            health_score_change=health_score_change,
            income_total=income_total,
            expense_total=expense_total,
            savings_total=savings_total,
            savings_rate=round(savings_rate, 2),
            key_insights=key_insights,
            achievements=achievements,
            areas_for_improvement=areas_for_improvement,
            next_month_prediction=next_month_prediction,
            top_recommendations=top_recommendations,
            goals_progress=goals_progress,
        )
    
    def _calculate_month_health_score(
        self,
        income: Decimal,
        expenses: Decimal,
        transactions: List[Any]
    ) -> int:
        """Calculate health score for the month."""
        score = 50  # Base score
        
        # Income vs expenses ratio (0-25 points)
        if income > 0:
            ratio = float(expenses / income)
            if ratio < 0.5:
                score += 25
            elif ratio < 0.7:
                score += 20
            elif ratio < 0.8:
                score += 15
            elif ratio < 0.9:
                score += 10
            else:
                score -= 10
        
        # Transaction consistency (0-15 points)
        if len(transactions) >= 10:
            score += 15
        elif len(transactions) >= 5:
            score += 10
        elif len(transactions) >= 3:
            score += 5
        
        # Savings achievement (0-10 points)
        savings = income - expenses
        if savings > income * Decimal("0.2"):
            score += 10
        elif savings > income * Decimal("0.1"):
            score += 5
        
        return min(100, max(0, score))
    
    async def _calculate_health_score_change(
        self,
        user_id: str,
        current_year: int,
        current_month: int,
        current_score: int
    ) -> int:
        """Calculate health score change from previous month."""
        # Get previous month
        if current_month == 1:
            prev_year = current_year - 1
            prev_month = 12
        else:
            prev_year = current_year
            prev_month = current_month - 1
        
        # Get previous month transactions
        start_date = date(prev_year, prev_month, 1)
        if prev_month == 12:
            end_date = date(prev_year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(prev_year, prev_month + 1, 1) - timedelta(days=1)
        
        try:
            prev_transactions = await self.transaction_repo.get_by_date_range(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date
            )
            
            if prev_transactions:
                prev_income = sum(
                    t.amount for t in prev_transactions if t.type.value == "income"
                )
                prev_expenses = sum(
                    t.amount for t in prev_transactions if t.type.value == "expense"
                )
                
                prev_score = self._calculate_month_health_score(
                    prev_income,
                    prev_expenses,
                    prev_transactions
                )
                
                return current_score - prev_score
        except Exception as e:
            self.logger.warning("error_calculating_score_change", error=str(e))
        
        return 0
    
    def _generate_executive_summary(
        self,
        income: Decimal,
        expenses: Decimal,
        savings: Decimal,
        savings_rate: float,
        score_change: int
    ) -> str:
        """Generate executive summary in natural language."""
        # Determine overall performance
        if savings_rate >= 20:
            performance = "Excelente mês"
        elif savings_rate >= 10:
            performance = "Bom mês"
        elif savings_rate >= 0:
            performance = "Mês regular"
        else:
            performance = "Mês desafiador"
        
        # Build summary
        summary_parts = [performance + "!"]
        
        if savings > 0:
            summary_parts.append(
                f"Você economizou {savings_rate:.1f}% da sua renda (R$ {savings:.2f})."
            )
        else:
            summary_parts.append(
                f"Suas despesas excederam a renda em R$ {abs(savings):.2f}."
            )
        
        if score_change > 0:
            summary_parts.append(
                f"Sua saúde financeira melhorou {score_change} pontos."
            )
        elif score_change < 0:
            summary_parts.append(
                f"Sua saúde financeira caiu {abs(score_change)} pontos."
            )
        
        return " ".join(summary_parts)
    
    async def _generate_key_insights(
        self,
        user_id: str,
        transactions: List[Any],
        income: Decimal,
        expenses: Decimal
    ) -> List[str]:
        """Generate key insights from the month's data."""
        insights = []
        
        # Analyze income
        if income > 0:
            income_transactions = [t for t in transactions if t.type.value == "income"]
            if len(income_transactions) > 1:
                insights.append(
                    f"Você teve {len(income_transactions)} fontes de receita este mês"
                )
        
        # Analyze top spending category
        from collections import defaultdict
        category_spending = defaultdict(Decimal)
        
        for t in transactions:
            if t.type.value == "expense":
                category_spending[t.category_name] += t.amount
        
        if category_spending:
            top_category = max(category_spending.items(), key=lambda x: x[1])
            percentage = float(top_category[1] / expenses * 100) if expenses > 0 else 0
            
            insights.append(
                f"Maior gasto foi com {top_category[0]} (R$ {top_category[1]:.2f} - "
                f"{percentage:.1f}% das despesas)"
            )
        
        # Analyze transaction frequency
        expense_count = sum(1 for t in transactions if t.type.value == "expense")
        if expense_count > 0:
            avg_transaction = expenses / expense_count if expense_count > 0 else Decimal("0")
            insights.append(
                f"Valor médio por transação: R$ {avg_transaction:.2f} "
                f"({expense_count} transações)"
            )
        
        return insights[:5]  # Top 5 insights
    
    async def _identify_achievements(
        self,
        user_id: str,
        savings_rate: float,
        score_change: int,
        transactions: List[Any]
    ) -> List[str]:
        """Identify financial achievements for the month."""
        achievements = []
        
        # Savings rate achievement
        if savings_rate >= 20:
            achievements.append("Excelente taxa de poupança atingida (20%+)")
        elif savings_rate >= 15:
            achievements.append("Boa taxa de poupança atingida (15%+)")
        
        # Health score improvement
        if score_change >= 10:
            achievements.append(f"Grande melhoria na saúde financeira (+{score_change} pontos)")
        elif score_change >= 5:
            achievements.append(f"Melhoria na saúde financeira (+{score_change} pontos)")
        
        # Transaction discipline
        if len(transactions) >= 10:
            achievements.append("Bom registro de transações - continue acompanhando!")
        
        # Check if any goals were completed
        try:
            goals = await self.goal_repo.get_all(user_id=user_id)
            completed_goals = [g for g in goals if g.status.value == "completed"]
            
            if completed_goals:
                achievements.append(
                    f"Meta '{completed_goals[0].name}' concluída com sucesso!"
                )
        except Exception as e:
            self.logger.warning("error_checking_goals", error=str(e))
        
        return achievements if achievements else ["Continue se esforçando!"]
    
    def _identify_improvement_areas(
        self,
        savings_rate: float,
        transactions: List[Any]
    ) -> List[str]:
        """Identify areas needing improvement."""
        areas = []
        
        # Low savings rate
        if savings_rate < 10:
            areas.append("Taxa de poupança abaixo do ideal - tente economizar mais")
        
        # High number of small transactions (potential impulse buying)
        small_transactions = [
            t for t in transactions
            if t.type.value == "expense" and t.amount < Decimal("50")
        ]
        
        if len(small_transactions) > len(transactions) * 0.6:
            areas.append("Muitas compras pequenas detectadas - cuidado com gastos impulsivos")
        
        # Uneven spending
        from collections import defaultdict
        weekly_spending = defaultdict(Decimal)
        
        for t in transactions:
            if t.type.value == "expense":
                week_num = t.transaction_date.isocalendar()[1]
                weekly_spending[week_num] += t.amount
        
        if len(weekly_spending) >= 2:
            amounts = list(weekly_spending.values())
            max_amount = max(amounts)
            min_amount = min(amounts)
            
            if max_amount > min_amount * Decimal("2"):
                areas.append("Gastos irregulares ao longo do mês - tente distribuir melhor")
        
        return areas if areas else ["Continue com o bom trabalho!"]
    
    async def _predict_next_month(
        self,
        user_id: str,
        current_month_transactions: List[Any]
    ) -> CashFlowPrediction:
        """Predict cash flow for next month."""
        # Get historical data (last 6 months)
        end_date = date.today()
        start_date = end_date - timedelta(days=180)
        
        historical_transactions = await self.transaction_repo.get_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Calculate averages
        total_income = sum(
            t.amount for t in historical_transactions if t.type.value == "income"
        )
        total_expenses = sum(
            t.amount for t in historical_transactions if t.type.value == "expense"
        )
        
        months = 6
        avg_income = total_income / months if months > 0 else Decimal("0")
        avg_expenses = total_expenses / months if months > 0 else Decimal("0")
        predicted_balance = avg_income - avg_expenses
        
        # Determine confidence based on consistency
        confidence = 0.7  # Base confidence
        
        if len(historical_transactions) >= 30:
            confidence += 0.1
        if total_income > 0:
            confidence += 0.1
        
        # Identify risk factors
        risk_factors = []
        
        if avg_expenses > avg_income:
            risk_factors.append("Despesas históricas excedem receita")
        
        # Calculate next month reference
        today = date.today()
        if today.month == 12:
            next_month = date(today.year + 1, 1, 1)
        else:
            next_month = date(today.year, today.month + 1, 1)
        
        return CashFlowPrediction(
            month=next_month.strftime("%Y-%m"),
            predicted_income=avg_income,
            predicted_expenses=avg_expenses,
            predicted_balance=predicted_balance,
            confidence=round(confidence, 2),
            risk_factors=risk_factors,
        )
    
    async def _get_goals_progress(self, user_id: str) -> List[Dict[str, Any]]:
        """Get progress on financial goals."""
        progress_list = []
        
        try:
            goals = await self.goal_repo.get_all(user_id=user_id)
            
            for goal in goals:
                if goal.status.value in ["active", "completed"]:
                    progress_percentage = goal.progress_percentage
                    on_track = True
                    
                    # Determine if on track
                    if goal.target_date and goal.status.value == "active":
                        days_remaining = goal.days_remaining or 0
                        
                        if days_remaining > 0:
                            daily_needed = float(goal.remaining_amount) / days_remaining
                            # If needs more than reasonable daily amount, not on track
                            if daily_needed > 100:  # Arbitrary threshold
                                on_track = False
                    
                    progress_list.append({
                        "goal_id": goal.id,
                        "goal_name": goal.name,
                        "progress": round(progress_percentage, 1),
                        "on_track": on_track,
                        "status": goal.status.value,
                    })
        except Exception as e:
            self.logger.warning("error_getting_goals_progress", error=str(e))
        
        return progress_list




