"""
Alert service for financial alerts management.
"""

from typing import List, Dict, Any
from decimal import Decimal
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import structlog

from repositories.alert import AlertRepository
from repositories.transaction import TransactionRepository
from schemas.alert import AlertCreate, AlertUpdate, AlertResponse
from models.alert import Alert, AlertType, AlertPriority, AlertStatus
from models.transaction import TransactionType

logger = structlog.get_logger()


class AlertService:
    """Service for financial alerts management."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.alert_repo = AlertRepository(db)
        self.transaction_repo = TransactionRepository(db)
    
    async def get_user_alerts(self, user_id: str) -> List[AlertResponse]:
        """Get all alerts for a user."""
        alerts = await self.alert_repo.get_user_alerts(user_id)
        return [self._alert_to_response(alert) for alert in alerts]
    
    async def get_active_alerts(self, user_id: str) -> List[AlertResponse]:
        """Get active alerts for a user."""
        alerts = await self.alert_repo.get_active_alerts(user_id)
        return [self._alert_to_response(alert) for alert in alerts]
    
    async def get_urgent_alerts(self, user_id: str) -> List[AlertResponse]:
        """Get urgent alerts for a user."""
        alerts = await self.alert_repo.get_urgent_alerts(user_id)
        return [self._alert_to_response(alert) for alert in alerts]
    
    async def create_alert(self, user_id: str, alert_data: AlertCreate) -> AlertResponse:
        """Create a new financial alert."""
        alert = Alert(
            user_id=user_id,
            **alert_data.model_dump()
        )
        
        created_alert = await self.alert_repo.create(alert)
        
        logger.info(
            "Financial alert created",
            user_id=user_id,
            alert_id=created_alert.id,
            alert_type=created_alert.type.value,
            priority=created_alert.priority.value
        )
        
        return self._alert_to_response(created_alert)
    
    async def update_alert(
        self, 
        user_id: str, 
        alert_id: str, 
        alert_data: AlertUpdate
    ) -> AlertResponse:
        """Update a financial alert."""
        alert = await self.alert_repo.get_by_id(alert_id)
        if not alert or alert.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerta não encontrado"
            )
        
        update_data = alert_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(alert, field, value)
        
        updated_alert = await self.alert_repo.update(alert)
        
        logger.info(
            "Financial alert updated",
            user_id=user_id,
            alert_id=alert_id,
            updated_fields=list(update_data.keys())
        )
        
        return self._alert_to_response(updated_alert)
    
    async def delete_alert(self, user_id: str, alert_id: str) -> bool:
        """Delete a financial alert."""
        alert = await self.alert_repo.get_by_id(alert_id)
        if not alert or alert.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerta não encontrado"
            )
        
        success = await self.alert_repo.delete(alert_id)
        
        if success:
            logger.info(
                "Financial alert deleted",
                user_id=user_id,
                alert_id=alert_id
            )
        
        return success
    
    async def dismiss_alert(self, user_id: str, alert_id: str) -> AlertResponse:
        """Dismiss an alert."""
        alert = await self.alert_repo.dismiss_alert(alert_id, user_id)
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerta não encontrado"
            )
        
        logger.info(
            "Financial alert dismissed",
            user_id=user_id,
            alert_id=alert_id
        )
        
        return self._alert_to_response(alert)
    
    async def complete_alert(self, user_id: str, alert_id: str) -> AlertResponse:
        """Mark an alert as completed."""
        alert = await self.alert_repo.complete_alert(alert_id, user_id)
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alerta não encontrado"
            )
        
        logger.info(
            "Financial alert completed",
            user_id=user_id,
            alert_id=alert_id
        )
        
        return self._alert_to_response(alert)
    
    async def generate_smart_alerts(self, user_id: str) -> List[AlertResponse]:
        """Generate smart alerts based on user data."""
        alerts = []
        
        try:
            # Get recent transactions
            recent_transactions = await self.transaction_repo.get_recent_transactions(
                user_id, limit=30
            )
            
            # Generate budget alerts
            budget_alerts = await self._generate_budget_alerts(user_id, recent_transactions)
            alerts.extend(budget_alerts)
            
            # Generate goal alerts
            goal_alerts = await self._generate_goal_alerts(user_id)
            alerts.extend(goal_alerts)
            
            logger.info(
                "Smart alerts generated",
                user_id=user_id,
                total_alerts=len(alerts),
                budget_alerts=len(budget_alerts),
                goal_alerts=len(goal_alerts)
            )
            
        except Exception as e:
            logger.error(
                "Error generating smart alerts",
                user_id=user_id,
                error=str(e)
            )
        
        return alerts
    
    async def _generate_budget_alerts(
        self, 
        user_id: str, 
        transactions: List
    ) -> List[AlertResponse]:
        """Generate budget-related alerts."""
        alerts = []
        
        try:
            # Calculate monthly spending by category
            monthly_spending = {}
            for transaction in transactions:
                if transaction.type == TransactionType.EXPENSE:
                    # Get category name from relationship or use default
                    category = transaction.category.name if transaction.category else "Outros"
                    monthly_spending[category] = monthly_spending.get(category, 0) + float(transaction.amount)
            
            # Generate alerts for high spending
            for category, amount in monthly_spending.items():
                if amount > 1000:  # Threshold for high spending
                    alert_data = AlertCreate(
                        type=AlertType.BUDGET,
                        title=f"Gastos Altos em {category}",
                        description=f"Você gastou R$ {amount:.2f} em {category} este mês",
                        amount=Decimal(str(amount)),
                        priority=AlertPriority.HIGH
                    )
                    
                    alert = Alert(user_id=user_id, **alert_data.model_dump())
                    created_alert = await self.alert_repo.create(alert)
                    alerts.append(self._alert_to_response(created_alert))
            
        except Exception as e:
            logger.error(
                "Error generating budget alerts",
                user_id=user_id,
                error=str(e)
            )
        
        return alerts
    
    async def _generate_goal_alerts(self, user_id: str) -> List[AlertResponse]:
        """Generate goal-related alerts."""
        alerts = []
        
        try:
            # Import here to avoid circular imports
            from services.goal_service import GoalService
            goal_service = GoalService(self.db)
            
            # Get goals ending soon
            goals_ending_soon = await goal_service.get_goals_ending_soon(user_id, days=7)
            
            for goal in goals_ending_soon:
                if not goal.is_completed:
                    alert_data = AlertCreate(
                        type=AlertType.GOAL,
                        title=f"Meta Próxima do Prazo: {goal.name}",
                        description=f"Sua meta '{goal.name}' termina em {goal.days_remaining} dias. Progresso atual: {goal.progress_percentage:.1f}%",
                        priority=AlertPriority.MEDIUM
                    )
                    
                    alert = Alert(user_id=user_id, **alert_data.model_dump())
                    created_alert = await self.alert_repo.create(alert)
                    alerts.append(self._alert_to_response(created_alert))
            
            # Get goals near completion
            goals_near_completion = await goal_service.get_goals_near_completion(user_id, threshold=0.8)
            
            for goal in goals_near_completion:
                if not goal.is_completed:
                    alert_data = AlertCreate(
                        type=AlertType.GOAL,
                        title=f"Meta Quase Concluída: {goal.name}",
                        description=f"Parabéns! Sua meta '{goal.name}' está {goal.progress_percentage:.1f}% concluída!",
                        priority=AlertPriority.LOW
                    )
                    
                    alert = Alert(user_id=user_id, **alert_data.model_dump())
                    created_alert = await self.alert_repo.create(alert)
                    alerts.append(self._alert_to_response(created_alert))
            
        except Exception as e:
            logger.error(
                "Error generating goal alerts",
                user_id=user_id,
                error=str(e)
            )
        
        return alerts
    
    async def get_upcoming_bills(
        self, 
        user_id: str, 
        days: int = 7
    ) -> List[AlertResponse]:
        """Get upcoming bills within specified days."""
        alerts = await self.alert_repo.get_upcoming_bills(user_id, days)
        return [self._alert_to_response(alert) for alert in alerts]
    
    async def get_overdue_alerts(self, user_id: str) -> List[AlertResponse]:
        """Get overdue alerts for a user."""
        alerts = await self.alert_repo.get_overdue_alerts(user_id)
        return [self._alert_to_response(alert) for alert in alerts]
    
    async def get_alert_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get alert statistics for a user."""
        all_alerts = await self.alert_repo.get_user_alerts(user_id)
        active_alerts = [a for a in all_alerts if a.status == AlertStatus.ACTIVE]
        urgent_alerts = [a for a in active_alerts if a.priority == AlertPriority.HIGH]
        
        total_alerts = len(all_alerts)
        active_count = len(active_alerts)
        urgent_count = len(urgent_alerts)
        
        # Alerts by type
        alerts_by_type = {}
        for alert_type in AlertType:
            alerts_by_type[alert_type.value] = len([
                a for a in active_alerts if a.type == alert_type
            ])
        
        # Alerts by priority
        alerts_by_priority = {}
        for priority in AlertPriority:
            alerts_by_priority[priority.value] = len([
                a for a in active_alerts if a.priority == priority
            ])
        
        return {
            "total_alerts": total_alerts,
            "active_alerts": active_count,
            "urgent_alerts": urgent_count,
            "alerts_by_type": alerts_by_type,
            "alerts_by_priority": alerts_by_priority
        }
    
    def _alert_to_response(self, alert: Alert) -> AlertResponse:
        """Convert Alert model to AlertResponse."""
        return AlertResponse(
            id=alert.id,
            type=alert.type,
            title=alert.title,
            description=alert.description,
            amount=alert.amount,
            due_date=alert.due_date,
            priority=alert.priority,
            status=alert.status,
            is_recurring=alert.is_recurring,
            days_until_due=alert.days_until_due,
            is_overdue=alert.is_overdue,
            created_at=alert.created_at,
            updated_at=alert.updated_at
        )


