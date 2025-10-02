"""
Recommendation service for personalized financial recommendations.

Generates AI-powered recommendations based on user behavior and goals.
"""

from typing import List, Dict, Any
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from collections import defaultdict
import structlog
from uuid import uuid4

from repositories.transaction import TransactionRepository
from repositories.goal import GoalRepository
from schemas.ai_prediction import PersonalizedRecommendation, AdvancedMetrics


logger = structlog.get_logger()


class RecommendationService:
    """Service for generating personalized recommendations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_repo = TransactionRepository(db)
        self.goal_repo = GoalRepository(db)
        self.logger = logger.bind(service="recommendation")
    
    async def generate_recommendations(
        self,
        user_id: str,
        max_recommendations: int = 5
    ) -> List[PersonalizedRecommendation]:
        """
        Generate personalized financial recommendations.
        
        Args:
            user_id: User ID
            max_recommendations: Maximum number of recommendations
            
        Returns:
            List of personalized recommendations
        """
        self.logger.info(
            "generating_recommendations",
            user_id=user_id,
            max_count=max_recommendations
        )
        
        recommendations = []
        
        # Get user data
        end_date = date.today()
        start_date = end_date - timedelta(days=90)
        
        transactions = await self.transaction_repo.get_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        goals = await self.goal_repo.get_all(user_id=user_id)
        
        # Generate different types of recommendations
        
        # 1. Spending optimization recommendations
        spending_recs = await self._generate_spending_recommendations(
            transactions
        )
        recommendations.extend(spending_recs)
        
        # 2. Goal-based recommendations
        goal_recs = await self._generate_goal_recommendations(
            user_id,
            goals,
            transactions
        )
        recommendations.extend(goal_recs)
        
        # 3. Savings recommendations
        savings_recs = await self._generate_savings_recommendations(
            transactions
        )
        recommendations.extend(savings_recs)
        
        # 4. Budget optimization recommendations
        budget_recs = await self._generate_budget_recommendations(
            user_id,
            transactions
        )
        recommendations.extend(budget_recs)
        
        # Sort by priority and AI confidence
        recommendations.sort(
            key=lambda r: (
                self._priority_score(r.priority),
                r.ai_confidence
            ),
            reverse=True
        )
        
        return recommendations[:max_recommendations]
    
    async def calculate_advanced_metrics(
        self,
        user_id: str
    ) -> AdvancedMetrics:
        """
        Calculate advanced financial metrics.
        
        Args:
            user_id: User ID
            
        Returns:
            Advanced metrics
        """
        self.logger.info("calculating_advanced_metrics", user_id=user_id)
        
        # Get last 6 months of data
        end_date = date.today()
        start_date = end_date - timedelta(days=180)
        
        transactions = await self.transaction_repo.get_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Calculate basic totals
        total_income = sum(
            t.amount for t in transactions if t.type.value == "income"
        )
        total_expenses = sum(
            t.amount for t in transactions if t.type.value == "expense"
        )
        
        # Calculate savings rate
        savings_rate = 0.0
        if total_income > 0:
            savings_rate = float((total_income - total_expenses) / total_income * 100)
        
        # Calculate ideal savings rate (20% is standard recommendation)
        ideal_savings_rate = 20.0
        
        # Calculate liquidity score (based on savings rate and stability)
        liquidity_score = self._calculate_liquidity_score(
            savings_rate,
            total_income,
            total_expenses
        )
        
        # Calculate diversification score
        diversification_score = self._calculate_diversification_score(transactions)
        
        # Calculate stability index
        stability_index = self._calculate_stability_index(transactions)
        
        # Calculate expense volatility
        expense_volatility = self._calculate_expense_volatility(transactions)
        
        # Calculate income consistency
        income_consistency = self._calculate_income_consistency(transactions)
        
        return AdvancedMetrics(
            savings_rate=round(savings_rate, 2),
            ideal_savings_rate=ideal_savings_rate,
            liquidity_score=liquidity_score,
            diversification_score=diversification_score,
            stability_index=round(stability_index, 2),
            expense_volatility=round(expense_volatility, 2),
            income_consistency=round(income_consistency, 2),
        )
    
    async def _generate_spending_recommendations(
        self,
        transactions: List[Any]
    ) -> List[PersonalizedRecommendation]:
        """Generate recommendations for spending optimization."""
        recommendations = []
        
        # Analyze spending by category
        category_spending = defaultdict(Decimal)
        total_expenses = Decimal("0")
        
        for t in transactions:
            if t.type.value == "expense":
                category_spending[t.category_name] += t.amount
                total_expenses += t.amount
        
        if total_expenses == 0:
            return recommendations
        
        # Find high-spending categories
        for category, amount in category_spending.items():
            percentage = float(amount / total_expenses * 100)
            
            # If category is more than 30% of spending
            if percentage > 30:
                potential_savings = amount * Decimal("0.15")  # 15% reduction
                
                rec = PersonalizedRecommendation(
                    id=f"rec_{uuid4().hex[:8]}",
                    title=f"Otimize Gastos com {category}",
                    description=(
                        f"Você está gastando {percentage:.1f}% do seu orçamento com "
                        f"{category}. Reduzir em 15% pode economizar "
                        f"R$ {potential_savings:.2f} por mês."
                    ),
                    category="Otimização de Gastos",
                    priority="high" if percentage > 40 else "medium",
                    potential_impact=potential_savings,
                    implementation_steps=[
                        f"Revise seus gastos com {category}",
                        "Identifique itens supérfluos ou substituíveis",
                        "Estabeleça um limite mensal para esta categoria",
                    ],
                    difficulty="medium",
                    estimated_time="2 semanas",
                    success_probability=75.0,
                    related_goals=[],
                    ai_confidence=0.82,
                )
                recommendations.append(rec)
        
        return recommendations
    
    async def _generate_goal_recommendations(
        self,
        user_id: str,
        goals: List[Any],
        transactions: List[Any]
    ) -> List[PersonalizedRecommendation]:
        """Generate recommendations for achieving goals."""
        recommendations = []
        
        # Calculate monthly savings capacity
        total_income = sum(
            t.amount for t in transactions if t.type.value == "income"
        )
        total_expenses = sum(
            t.amount for t in transactions if t.type.value == "expense"
        )
        
        months = 3  # Based on 90 days of data
        monthly_savings = (total_income - total_expenses) / months
        
        for goal in goals:
            if goal.status.value != "active":
                continue
            
            remaining = goal.target_amount - goal.current_amount
            
            # Calculate months needed
            months_needed = 0
            if monthly_savings > 0:
                months_needed = int(remaining / monthly_savings)
            
            # If goal is taking too long
            if goal.target_date:
                target_months = (goal.target_date - date.today()).days // 30
                
                if months_needed > target_months:
                    additional_needed = (remaining / target_months) - monthly_savings
                    
                    rec = PersonalizedRecommendation(
                        id=f"rec_{uuid4().hex[:8]}",
                        title=f"Acelere Meta: {goal.name}",
                        description=(
                            f"Para atingir sua meta '{goal.name}' no prazo, você "
                            f"precisa economizar R$ {additional_needed:.2f} a mais por mês."
                        ),
                        category="Metas Financeiras",
                        priority="high",
                        potential_impact=additional_needed,
                        implementation_steps=[
                            "Revise gastos não essenciais",
                            f"Automatize transferência de R$ {additional_needed:.2f}",
                            "Acompanhe progresso semanalmente",
                        ],
                        difficulty="medium",
                        estimated_time="1 mês",
                        success_probability=65.0,
                        related_goals=[goal.id],
                        ai_confidence=0.78,
                    )
                    recommendations.append(rec)
        
        return recommendations
    
    async def _generate_savings_recommendations(
        self,
        transactions: List[Any]
    ) -> List[PersonalizedRecommendation]:
        """Generate recommendations for increasing savings."""
        recommendations = []
        
        total_income = sum(
            t.amount for t in transactions if t.type.value == "income"
        )
        total_expenses = sum(
            t.amount for t in transactions if t.type.value == "expense"
        )
        
        if total_income == 0:
            return recommendations
        
        current_savings_rate = (total_income - total_expenses) / total_income * 100
        
        # If savings rate is below 20%
        if current_savings_rate < 20:
            target_savings = total_income * Decimal("0.20")
            current_savings = total_income - total_expenses
            additional_needed = (target_savings - current_savings) / 3  # Per month
            
            rec = PersonalizedRecommendation(
                id=f"rec_{uuid4().hex[:8]}",
                title="Aumente sua Taxa de Poupança",
                description=(
                    f"Sua taxa de poupança atual é {current_savings_rate:.1f}%. "
                    f"O ideal é 20%. Economize R$ {additional_needed:.2f} a mais por mês."
                ),
                category="Poupança",
                priority="high",
                potential_impact=additional_needed,
                implementation_steps=[
                    "Automatize transferência para poupança no dia do pagamento",
                    "Use a regra 50/30/20 (50% essenciais, 30% desejos, 20% poupança)",
                    "Renegocie contratos e assinaturas",
                ],
                difficulty="easy",
                estimated_time="1 semana",
                success_probability=85.0,
                related_goals=[],
                ai_confidence=0.88,
            )
            recommendations.append(rec)
        
        return recommendations
    
    async def _generate_budget_recommendations(
        self,
        user_id: str,
        transactions: List[Any]
    ) -> List[PersonalizedRecommendation]:
        """Generate budget optimization recommendations."""
        recommendations = []
        
        try:
            budgets = await self.budget_repo.get_all(user_id=user_id)
            
            for budget in budgets:
                # Check if budget is near or exceeded
                if budget.is_near_limit or budget.is_exceeded:
                    category_name = budget.category.name if budget.category else "Geral"
                    
                    rec = PersonalizedRecommendation(
                        id=f"rec_{uuid4().hex[:8]}",
                        title=f"Atenção: Orçamento de {category_name}",
                        description=(
                            f"Você está próximo do limite do orçamento de {category_name}. "
                            f"Já gastou {budget.spent_percentage:.0f}%."
                        ),
                        category="Orçamento",
                        priority="urgent" if budget.is_exceeded else "high",
                        potential_impact=budget.remaining_amount,
                        implementation_steps=[
                            f"Evite gastos com {category_name} pelos próximos dias",
                            "Revise compras programadas",
                            "Considere ajustar o orçamento se necessário",
                        ],
                        difficulty="easy",
                        estimated_time="Imediato",
                        success_probability=70.0,
                        related_goals=[],
                        ai_confidence=0.92,
                    )
                    recommendations.append(rec)
        except Exception as e:
            self.logger.warning("error_generating_budget_recommendations", error=str(e))
        
        return recommendations
    
    def _calculate_liquidity_score(
        self,
        savings_rate: float,
        total_income: Decimal,
        total_expenses: Decimal
    ) -> int:
        """Calculate financial liquidity score (0-100)."""
        score = 50  # Base score
        
        # Savings rate component (0-30 points)
        if savings_rate >= 20:
            score += 30
        elif savings_rate >= 10:
            score += 20
        elif savings_rate >= 5:
            score += 10
        
        # Income vs expenses ratio (0-20 points)
        if total_income > 0:
            ratio = float(total_expenses / total_income)
            if ratio < 0.5:
                score += 20
            elif ratio < 0.7:
                score += 15
            elif ratio < 0.8:
                score += 10
            elif ratio < 0.9:
                score += 5
        
        return min(100, max(0, score))
    
    def _calculate_diversification_score(self, transactions: List[Any]) -> int:
        """Calculate spending diversification score (0-100)."""
        if not transactions:
            return 50
        
        expense_transactions = [t for t in transactions if t.type.value == "expense"]
        
        if not expense_transactions:
            return 50
        
        # Count unique categories
        unique_categories = len(set(t.category_name for t in expense_transactions))
        
        # More categories = better diversification (up to a point)
        if unique_categories >= 8:
            return 85
        elif unique_categories >= 6:
            return 75
        elif unique_categories >= 4:
            return 65
        elif unique_categories >= 2:
            return 55
        else:
            return 40
    
    def _calculate_stability_index(self, transactions: List[Any]) -> float:
        """Calculate financial stability index (0-1)."""
        if not transactions:
            return 0.5
        
        # Group by month
        monthly_balances = defaultdict(Decimal)
        
        for t in transactions:
            month_key = t.transaction_date.strftime("%Y-%m")
            if t.type.value == "income":
                monthly_balances[month_key] += t.amount
            else:
                monthly_balances[month_key] -= t.amount
        
        if not monthly_balances:
            return 0.5
        
        balances = list(monthly_balances.values())
        positive_months = sum(1 for b in balances if b > 0)
        
        stability = positive_months / len(balances) if balances else 0.5
        
        return min(1.0, max(0.0, stability))
    
    def _calculate_expense_volatility(self, transactions: List[Any]) -> float:
        """Calculate expense volatility percentage."""
        expense_transactions = [t for t in transactions if t.type.value == "expense"]
        
        if len(expense_transactions) < 2:
            return 0.0
        
        # Group by month
        monthly_expenses = defaultdict(Decimal)
        
        for t in expense_transactions:
            month_key = t.transaction_date.strftime("%Y-%m")
            monthly_expenses[month_key] += t.amount
        
        if len(monthly_expenses) < 2:
            return 0.0
        
        expenses = list(monthly_expenses.values())
        avg_expense = sum(expenses) / len(expenses)
        
        if avg_expense == 0:
            return 0.0
        
        # Calculate standard deviation
        variance = sum((float(e - avg_expense) ** 2) for e in expenses) / len(expenses)
        std_dev = variance ** 0.5
        
        volatility = (std_dev / float(avg_expense)) * 100
        
        return min(100.0, volatility)
    
    def _calculate_income_consistency(self, transactions: List[Any]) -> float:
        """Calculate income consistency score (0-1)."""
        income_transactions = [t for t in transactions if t.type.value == "income"]
        
        if len(income_transactions) < 2:
            return 0.5
        
        # Group by month
        monthly_income = defaultdict(Decimal)
        
        for t in income_transactions:
            month_key = t.transaction_date.strftime("%Y-%m")
            monthly_income[month_key] += t.amount
        
        if len(monthly_income) < 2:
            return 0.5
        
        incomes = list(monthly_income.values())
        avg_income = sum(incomes) / len(incomes)
        
        if avg_income == 0:
            return 0.0
        
        # Calculate coefficient of variation (lower is better)
        variance = sum((float(i - avg_income) ** 2) for i in incomes) / len(incomes)
        std_dev = variance ** 0.5
        cv = std_dev / float(avg_income)
        
        # Convert to consistency score (inverse of variation)
        consistency = max(0.0, 1.0 - cv)
        
        return min(1.0, consistency)
    
    def _priority_score(self, priority: str) -> int:
        """Convert priority string to numeric score."""
        priority_map = {
            "urgent": 4,
            "high": 3,
            "medium": 2,
            "low": 1,
        }
        return priority_map.get(priority, 0)

