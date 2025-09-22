"""
Alert repository for financial alerts management.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from datetime import date, timedelta
from models.alert import Alert, AlertType, AlertPriority, AlertStatus
from repositories.base import BaseRepository


class AlertRepository(BaseRepository[Alert]):
    """Repository for financial alerts."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Alert, db)
    
    async def get_user_alerts(
        self, 
        user_id: str, 
        status: Optional[AlertStatus] = None
    ) -> List[Alert]:
        """Get all alerts for a user."""
        query = select(Alert).where(Alert.user_id == user_id)
        
        if status:
            query = query.where(Alert.status == status)
        
        query = query.order_by(Alert.priority.desc(), Alert.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_active_alerts(self, user_id: str) -> List[Alert]:
        """Get active alerts for a user."""
        return await self.get_user_alerts(user_id, AlertStatus.ACTIVE)
    
    async def get_urgent_alerts(self, user_id: str) -> List[Alert]:
        """Get urgent alerts for a user."""
        query = select(Alert).where(
            and_(
                Alert.user_id == user_id,
                Alert.status == AlertStatus.ACTIVE,
                Alert.priority == AlertPriority.HIGH
            )
        ).order_by(Alert.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_upcoming_bills(
        self, 
        user_id: str, 
        days: int = 7
    ) -> List[Alert]:
        """Get upcoming bills within specified days."""
        today = date.today()
        future_date = today + timedelta(days=days)
        
        query = select(Alert).where(
            and_(
                Alert.user_id == user_id,
                Alert.status == AlertStatus.ACTIVE,
                Alert.type == AlertType.BILL,
                Alert.due_date.isnot(None),
                Alert.due_date >= today,
                Alert.due_date <= future_date
            )
        ).order_by(Alert.due_date.asc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_overdue_alerts(self, user_id: str) -> List[Alert]:
        """Get overdue alerts for a user."""
        today = date.today()
        
        query = select(Alert).where(
            and_(
                Alert.user_id == user_id,
                Alert.status == AlertStatus.ACTIVE,
                Alert.due_date.isnot(None),
                Alert.due_date < today
            )
        ).order_by(Alert.due_date.asc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_alerts_by_type(
        self, 
        user_id: str, 
        alert_type: AlertType
    ) -> List[Alert]:
        """Get alerts by type for a user."""
        query = select(Alert).where(
            and_(
                Alert.user_id == user_id,
                Alert.status == AlertStatus.ACTIVE,
                Alert.type == alert_type
            )
        ).order_by(Alert.priority.desc(), Alert.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_alerts_by_priority(
        self, 
        user_id: str, 
        priority: AlertPriority
    ) -> List[Alert]:
        """Get alerts by priority for a user."""
        query = select(Alert).where(
            and_(
                Alert.user_id == user_id,
                Alert.status == AlertStatus.ACTIVE,
                Alert.priority == priority
            )
        ).order_by(Alert.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def dismiss_alert(self, alert_id: str, user_id: str) -> Optional[Alert]:
        """Dismiss an alert."""
        alert = await self.get_by_id(alert_id)
        if not alert or alert.user_id != user_id:
            return None
        
        alert.status = AlertStatus.DISMISSED
        await self.db.commit()
        await self.db.refresh(alert)
        return alert
    
    async def complete_alert(self, alert_id: str, user_id: str) -> Optional[Alert]:
        """Mark an alert as completed."""
        alert = await self.get_by_id(alert_id)
        if not alert or alert.user_id != user_id:
            return None
        
        alert.status = AlertStatus.COMPLETED
        await self.db.commit()
        await self.db.refresh(alert)
        return alert
    
    async def get_recurring_alerts(self, user_id: str) -> List[Alert]:
        """Get recurring alerts for a user."""
        query = select(Alert).where(
            and_(
                Alert.user_id == user_id,
                Alert.status == AlertStatus.ACTIVE,
                Alert.is_recurring == True
            )
        ).order_by(Alert.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_alerts_ending_soon(
        self, 
        user_id: str, 
        days: int = 3
    ) -> List[Alert]:
        """Get alerts ending within specified days."""
        today = date.today()
        future_date = today + timedelta(days=days)
        
        query = select(Alert).where(
            and_(
                Alert.user_id == user_id,
                Alert.status == AlertStatus.ACTIVE,
                Alert.due_date.isnot(None),
                Alert.due_date >= today,
                Alert.due_date <= future_date
            )
        ).order_by(Alert.due_date.asc())
        
        result = await self.db.execute(query)
        return result.scalars().all()


