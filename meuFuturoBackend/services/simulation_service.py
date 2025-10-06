"""
Simulation service for financial scenario modeling.

Handles "what-if" scenarios and financial projections.
"""

from typing import List, Dict, Any
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from repositories.transaction import TransactionRepository
from repositories.goal import GoalRepository
from schemas.ai_prediction import FinancialSimulation, SimulationResult, CashFlowPrediction


logger = structlog.get_logger()


class SimulationService:
    """Service for financial scenario simulations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_repo = TransactionRepository(db)
        self.goal_repo = GoalRepository(db)
        self.logger = logger.bind(service="simulation")
    
    async def run_simulation(
        self,
        user_id: str,
        simulation: FinancialSimulation,
    ) -> SimulationResult:
        """
        Run a financial simulation scenario.
        
        Args:
            user_id: User ID
            simulation: Simulation parameters
            
        Returns:
            Simulation results
        """
        self.logger.info(
            "running_simulation",
            user_id=user_id,
            scenario=simulation.scenario_name
        )
        
        # Get historical data
        historical_data = await self._get_historical_averages(user_id)
        
        # Calculate current trajectory
        current_trajectory = await self._calculate_current_trajectory(
            user_id,
            historical_data,
            simulation.time_horizon_months
        )
        
        # Calculate simulated trajectory
        simulated_trajectory = await self._calculate_simulated_trajectory(
            historical_data,
            simulation,
            simulation.time_horizon_months
        )
        
        # Check which goals are achievable
        goals_achievable = await self._check_goals_achievability(
            user_id,
            simulated_trajectory
        )
        
        # Calculate comparison metrics
        comparison = self._calculate_comparison(
            current_trajectory,
            simulated_trajectory
        )
        
        return SimulationResult(
            scenario_name=simulation.scenario_name,
            final_balance=simulated_trajectory["final_balance"],
            total_savings=simulated_trajectory["total_savings"],
            monthly_average_balance=simulated_trajectory["monthly_average"],
            goals_achievable=goals_achievable,
            timeline_data=simulated_trajectory["timeline"],
            comparison_to_current=comparison,
        )
    
    async def _get_historical_averages(self, user_id: str) -> Dict[str, Decimal]:
        """Get historical averages for the user."""
        # Get last 6 months of transactions
        end_date = date.today()
        start_date = end_date - timedelta(days=180)
        
        transactions = await self.transaction_repo.get_user_transactions(
            user_id=user_id,
            skip=0,
            limit=1000,
            start_date=start_date,
            end_date=end_date
        )
        
        total_income = Decimal("0")
        total_expenses = Decimal("0")
        
        for transaction in transactions:
            if transaction.type.value == "income":
                total_income += transaction.amount
            else:
                total_expenses += transaction.amount
        
        months = 6
        avg_income = total_income / months if total_income > 0 else Decimal("0")
        avg_expenses = total_expenses / months if total_expenses > 0 else Decimal("0")
        avg_savings = avg_income - avg_expenses
        
        return {
            "avg_monthly_income": avg_income,
            "avg_monthly_expenses": avg_expenses,
            "avg_monthly_savings": avg_savings,
        }
    
    async def _calculate_current_trajectory(
        self,
        user_id: str,
        historical_data: Dict[str, Decimal],
        months: int
    ) -> Dict[str, Any]:
        """Calculate current financial trajectory."""
        timeline = []
        cumulative_balance = Decimal("0")
        
        for month in range(1, months + 1):
            monthly_income = historical_data["avg_monthly_income"]
            monthly_expenses = historical_data["avg_monthly_expenses"]
            monthly_savings = monthly_income - monthly_expenses
            cumulative_balance += monthly_savings
            
            timeline.append({
                "month": month,
                "income": float(monthly_income),
                "expenses": float(monthly_expenses),
                "savings": float(monthly_savings),
                "balance": float(cumulative_balance),
            })
        
        return {
            "final_balance": cumulative_balance,
            "total_savings": cumulative_balance,
            "monthly_average": cumulative_balance / months if months > 0 else Decimal("0"),
            "timeline": timeline,
        }
    
    async def _calculate_simulated_trajectory(
        self,
        historical_data: Dict[str, Decimal],
        simulation: FinancialSimulation,
        months: int
    ) -> Dict[str, Any]:
        """Calculate simulated financial trajectory."""
        timeline = []
        cumulative_balance = Decimal("0")
        
        # Apply adjustments
        income_multiplier = Decimal(str(1 + (simulation.income_adjustment / 100)))
        expense_multiplier = Decimal(str(1 + (simulation.expense_adjustment / 100)))
        
        for month in range(1, months + 1):
            monthly_income = historical_data["avg_monthly_income"] * income_multiplier
            monthly_expenses = historical_data["avg_monthly_expenses"] * expense_multiplier
            monthly_savings = monthly_income - monthly_expenses
            cumulative_balance += monthly_savings
            
            timeline.append({
                "month": month,
                "income": float(monthly_income),
                "expenses": float(monthly_expenses),
                "savings": float(monthly_savings),
                "balance": float(cumulative_balance),
            })
        
        return {
            "final_balance": cumulative_balance,
            "total_savings": cumulative_balance,
            "monthly_average": cumulative_balance / months if months > 0 else Decimal("0"),
            "timeline": timeline,
        }
    
    async def _check_goals_achievability(
        self,
        user_id: str,
        trajectory: Dict[str, Any]
    ) -> List[str]:
        """Check which goals are achievable with simulated trajectory."""
        goals = await self.goal_repo.get_all(user_id=user_id)
        achievable = []
        
        final_balance = trajectory["final_balance"]
        
        for goal in goals:
            if goal.status.value == "active":
                remaining = goal.target_amount - goal.current_amount
                if final_balance >= remaining:
                    achievable.append(goal.name)
        
        return achievable
    
    def _calculate_comparison(
        self,
        current: Dict[str, Any],
        simulated: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate comparison between current and simulated trajectories."""
        balance_diff = simulated["final_balance"] - current["final_balance"]
        
        percentage_improvement = 0.0
        if current["final_balance"] != 0:
            percentage_improvement = float(
                (balance_diff / current["final_balance"]) * 100
            )
        
        return {
            "balance_difference": float(balance_diff),
            "percentage_improvement": round(percentage_improvement, 2),
            "better_outcome": balance_diff > 0,
        }




