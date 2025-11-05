"""
Pattern Analysis service for advanced spending pattern detection.

Handles temporal patterns, correlations, and behavioral insights.
"""

from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from collections import defaultdict
import structlog

from repositories.transaction import TransactionRepository
from schemas.ai_prediction import (
    PatternAnalysisAdvanced,
    SeasonalPattern,
    AnomalyDetection,
)


logger = structlog.get_logger()


class PatternAnalysisService:
    """Service for advanced pattern analysis."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_repo = TransactionRepository(db)
        self.logger = logger.bind(service="pattern_analysis")
    
    async def analyze_patterns(self, user_id: str) -> PatternAnalysisAdvanced:
        """
        Perform advanced pattern analysis.
        
        Args:
            user_id: User ID
            
        Returns:
            Advanced pattern analysis
        """
        self.logger.info("analyzing_patterns", user_id=user_id)
        
        # Get transactions from last year
        end_date = date.today()
        start_date = end_date - timedelta(days=365)
        
        transactions = await self.transaction_repo.get_user_transactions(
            user_id=user_id,
            skip=0,
            limit=1000,
            start_date=start_date,
            end_date=end_date
        )
        
        # Analyze temporal patterns
        temporal_patterns = self._analyze_temporal_patterns(transactions)
        
        # Analyze category correlations
        category_correlations = self._analyze_category_correlations(transactions)
        
        # Calculate impulse spending score
        impulse_score = self._calculate_impulse_spending_score(transactions)
        
        # Analyze spending by weekday
        spending_by_weekday = self._analyze_spending_by_weekday(transactions)
        
        # Analyze spending by time (mock for now, would need transaction time)
        spending_by_time = self._analyze_spending_by_time(transactions)
        
        # Generate behavioral insights
        behavioral_insights = self._generate_behavioral_insights(
            temporal_patterns,
            spending_by_weekday,
            impulse_score
        )
        
        return PatternAnalysisAdvanced(
            temporal_patterns=temporal_patterns,
            category_correlations=category_correlations,
            impulse_spending_score=impulse_score,
            spending_by_weekday=spending_by_weekday,
            spending_by_time=spending_by_time,
            behavioral_insights=behavioral_insights,
        )
    
    async def detect_seasonal_patterns(
        self,
        user_id: str
    ) -> List[SeasonalPattern]:
        """
        Detect seasonal spending patterns.
        
        Args:
            user_id: User ID
            
        Returns:
            List of seasonal patterns
        """
        self.logger.info("detecting_seasonal_patterns", user_id=user_id)
        
        # Get transactions from last 2 years for better pattern detection
        end_date = date.today()
        start_date = end_date - timedelta(days=730)
        
        transactions = await self.transaction_repo.get_user_transactions(
            user_id=user_id,
            skip=0,
            limit=1000,
            start_date=start_date,
            end_date=end_date
        )
        
        # Group by category and month
        category_monthly = defaultdict(lambda: defaultdict(Decimal))
        
        # Month names in Portuguese
        month_names_pt = {
            1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
            5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
            9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
        }
        
        for transaction in transactions:
            if transaction.type.value == "expense":
                category = transaction.category_name
                month = month_names_pt[transaction.transaction_date.month]
                category_monthly[category][month] += transaction.amount
        
        patterns = []
        
        for category, monthly_data in category_monthly.items():
            if len(monthly_data) < 3:
                continue
            
            # Calculate average and find peaks
            amounts = list(monthly_data.values())
            avg_amount = sum(amounts) / len(amounts)
            
            peak_months = [
                month for month, amount in monthly_data.items()
                if amount > avg_amount * Decimal("1.3")
            ]
            
            if peak_months:
                # Calculate variation
                max_amount = max(amounts)
                variation = float((max_amount / avg_amount - 1) * 100)
                
                # Determine next peak date
                next_peak = self._calculate_next_peak_date(peak_months)
                
                pattern = SeasonalPattern(
                    category=category,
                    pattern_type="Anual" if len(peak_months) <= 3 else "Trimestral",
                    peak_months=peak_months,
                    average_variation=round(variation, 2),
                    next_peak_date=next_peak,
                    recommendation=self._generate_seasonal_recommendation(
                        category,
                        peak_months,
                        float(max_amount - avg_amount)
                    ),
                )
                patterns.append(pattern)
        
        return patterns
    
    async def detect_anomalies(
        self,
        user_id: str,
        days: int = 30
    ) -> List[AnomalyDetection]:
        """
        Detect spending anomalies.
        
        Args:
            user_id: User ID
            days: Number of days to check
            
        Returns:
            List of detected anomalies
        """
        self.logger.info("detecting_anomalies", user_id=user_id, days=days)
        
        # Get recent transactions
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        recent_transactions = await self.transaction_repo.get_user_transactions(
            user_id=user_id,
            skip=0,
            limit=1000,
            start_date=start_date,
            end_date=end_date
        )
        
        # Get historical data for baseline
        historical_start = start_date - timedelta(days=180)
        historical_transactions = await self.transaction_repo.get_user_transactions(
            user_id=user_id,
            skip=0,
            limit=1000,
            start_date=historical_start,
            end_date=start_date
        )
        
        # Calculate baselines by category
        category_baselines = self._calculate_category_baselines(
            historical_transactions
        )
        
        anomalies = []
        
        for transaction in recent_transactions:
            if transaction.type.value == "expense":
                category = transaction.category_name
                
                if category in category_baselines:
                    baseline = category_baselines[category]
                    amount = transaction.amount
                    
                    # Check if amount is significantly higher than expected
                    if amount > baseline["max"] * Decimal("1.5"):
                        anomaly_score = float(
                            min((amount - baseline["max"]) / baseline["max"], 1.0)
                        )
                        
                        anomaly = AnomalyDetection(
                            transaction_id=transaction.id,
                            category=category,
                            amount=amount,
                            expected_range={
                                "min": baseline["min"],
                                "max": baseline["max"],
                            },
                            anomaly_score=round(anomaly_score, 2),
                            detected_at=transaction.transaction_date,
                            is_recurring=False,
                            suggestion=self._generate_anomaly_suggestion(
                                category,
                                amount,
                                baseline["avg"],
                                anomaly_score
                            ),
                        )
                        anomalies.append(anomaly)
        
        return anomalies
    
    def _analyze_temporal_patterns(
        self,
        transactions: List[Any]
    ) -> Dict[str, Any]:
        """Analyze temporal spending patterns."""
        if not transactions:
            return {
                "peak_spending_day": "N/A",
                "lowest_spending_day": "N/A",
                "month_pattern": "dados_insuficientes"
            }
        
        # Analyze by day of week
        weekday_totals = defaultdict(Decimal)
        
        # Weekday names in Portuguese
        weekday_names_pt = {
            0: "Segunda-feira", 1: "Terça-feira", 2: "Quarta-feira",
            3: "Quinta-feira", 4: "Sexta-feira", 5: "Sábado", 6: "Domingo"
        }
        
        for transaction in transactions:
            if transaction.type.value == "expense":
                weekday = weekday_names_pt[transaction.transaction_date.weekday()]
                weekday_totals[weekday] += transaction.amount
        
        if not weekday_totals:
            return {
                "peak_spending_day": "N/A",
                "lowest_spending_day": "N/A",
                "month_pattern": "sem_gastos"
            }
        
        peak_day = max(weekday_totals.items(), key=lambda x: x[1])[0]
        lowest_day = min(weekday_totals.items(), key=lambda x: x[1])[0]
        
        return {
            "peak_spending_day": peak_day,
            "lowest_spending_day": lowest_day,
            "month_pattern": "estável",
        }
    
    def _analyze_category_correlations(
        self,
        transactions: List[Any]
    ) -> List[Dict[str, Any]]:
        """Analyze correlations between categories."""
        # Group transactions by date and category
        daily_categories = defaultdict(set)
        
        for transaction in transactions:
            if transaction.type.value == "expense":
                date_key = transaction.transaction_date.isoformat()
                category = transaction.category_name
                daily_categories[date_key].add(category)
        
        # Find frequently co-occurring categories
        correlations = []
        categories_list = list(set(
            t.category_name for t in transactions if t.type.value == "expense"
        ))
        
        for i, cat1 in enumerate(categories_list):
            for cat2 in categories_list[i+1:]:
                co_occurrence = sum(
                    1 for cats in daily_categories.values()
                    if cat1 in cats and cat2 in cats
                )
                
                if co_occurrence >= 3:
                    correlations.append({
                        "categories": [cat1, cat2],
                        "correlation": round(co_occurrence / len(daily_categories), 2),
                        "insight": f"Gastos com {cat1} frequentemente acompanham {cat2}"
                    })
        
        return correlations[:3]  # Top 3 correlations
    
    def _calculate_impulse_spending_score(
        self,
        transactions: List[Any]
    ) -> float:
        """Calculate impulse spending tendency score."""
        if not transactions:
            return 0.0
        
        expense_transactions = [
            t for t in transactions if t.type.value == "expense"
        ]
        
        if not expense_transactions:
            return 0.0
        
        # Simple heuristic: smaller transactions are more likely impulse purchases
        small_transactions = [
            t for t in expense_transactions
            if t.amount < Decimal("100")
        ]
        
        impulse_ratio = len(small_transactions) / len(expense_transactions)
        
        return round(impulse_ratio * 100, 1)
    
    def _analyze_spending_by_weekday(
        self,
        transactions: List[Any]
    ) -> Dict[str, Decimal]:
        """Analyze average spending by day of week."""
        weekday_totals = defaultdict(lambda: {"total": Decimal("0"), "count": 0})
        
        # Weekday names in Portuguese
        weekday_names_pt = {
            0: "Segunda-feira", 1: "Terça-feira", 2: "Quarta-feira",
            3: "Quinta-feira", 4: "Sexta-feira", 5: "Sábado", 6: "Domingo"
        }
        
        for transaction in transactions:
            if transaction.type.value == "expense":
                weekday = weekday_names_pt[transaction.transaction_date.weekday()]
                weekday_totals[weekday]["total"] += transaction.amount
                weekday_totals[weekday]["count"] += 1
        
        return {
            weekday: data["total"] / data["count"] if data["count"] > 0 else Decimal("0")
            for weekday, data in weekday_totals.items()
        }
    
    def _analyze_spending_by_time(
        self,
        transactions: List[Any]
    ) -> Dict[str, Decimal]:
        """Analyze spending patterns by time of day (mock implementation)."""
        # This would require transaction time, which we don't have
        # Return mock data for now
        return {
            "Manhã": Decimal("0"),
            "Tarde": Decimal("0"),
            "Noite": Decimal("0"),
        }
    
    def _generate_behavioral_insights(
        self,
        temporal_patterns: Dict[str, Any],
        spending_by_weekday: Dict[str, Decimal],
        impulse_score: float
    ) -> List[str]:
        """Generate behavioral insights from patterns."""
        insights = []
        
        # Peak day insight
        if temporal_patterns.get("peak_spending_day") not in ["N/A", None]:
            insights.append(
                f"Você tende a gastar mais às {temporal_patterns['peak_spending_day']}s"
            )
        
        # Impulse spending insight
        if impulse_score > 40:
            insights.append(
                "Você tem tendência a fazer compras impulsivas de menor valor"
            )
        elif impulse_score < 20:
            insights.append(
                "Suas compras são geralmente planejadas e de maior valor"
            )
        
        return insights
    
    def _calculate_category_baselines(
        self,
        transactions: List[Any]
    ) -> Dict[str, Dict[str, Decimal]]:
        """Calculate baseline spending ranges by category."""
        category_amounts = defaultdict(list)
        
        for transaction in transactions:
            if transaction.type.value == "expense":
                category = transaction.category_name
                category_amounts[category].append(transaction.amount)
        
        baselines = {}
        
        for category, amounts in category_amounts.items():
            if amounts:
                baselines[category] = {
                    "min": min(amounts),
                    "max": max(amounts),
                    "avg": sum(amounts) / len(amounts),
                }
        
        return baselines
    
    def _calculate_next_peak_date(self, peak_months: List[str]) -> Optional[date]:
        """Calculate next expected peak date."""
        if not peak_months:
            return None
        
        month_numbers = {
            "Janeiro": 1, "Fevereiro": 2, "Março": 3, "Abril": 4,
            "Maio": 5, "Junho": 6, "Julho": 7, "Agosto": 8,
            "Setembro": 9, "Outubro": 10, "Novembro": 11, "Dezembro": 12
        }
        
        today = date.today()
        current_month = today.month
        
        # Find next peak month
        peak_nums = [month_numbers.get(m, 0) for m in peak_months]
        peak_nums.sort()
        
        next_peak_month = None
        for month_num in peak_nums:
            if month_num > current_month:
                next_peak_month = month_num
                break
        
        if next_peak_month is None and peak_nums:
            next_peak_month = peak_nums[0]
            year = today.year + 1
        else:
            year = today.year
        
        if next_peak_month:
            return date(year, next_peak_month, 1)
        
        return None
    
    def _generate_seasonal_recommendation(
        self,
        category: str,
        peak_months: List[str],
        extra_amount: float
    ) -> str:
        """Generate recommendation for seasonal pattern."""
        months_str = " e ".join(peak_months[:2])
        return (
            f"Reserve R$ {extra_amount:.0f} adicionais para "
            f"{months_str} ({category})"
        )
    
    def _generate_anomaly_suggestion(
        self,
        category: str,
        amount: Decimal,
        avg_amount: Decimal,
        anomaly_score: float
    ) -> str:
        """Generate suggestion for detected anomaly."""
        percentage = float((amount / avg_amount - 1) * 100)
        return (
            f"Este gasto está {percentage:.0f}% acima do seu padrão habitual "
            f"em {category}. Foi planejado?"
        )




