"""
Goal repository for financial goals management.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from decimal import Decimal
from models.goal import Goal, GoalType, GoalStatus
from repositories.base import BaseRepository


class GoalRepository(BaseRepository[Goal]):
    """Repository for financial goals."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Goal, db)
    
    async def get_user_goals(
        self, 
        user_id: str, 
        status: Optional[GoalStatus] = None
    ) -> List[Goal]:
        """Get all goals for a user."""
        query = select(Goal).where(Goal.user_id == user_id)
        
        if status:
            query = query.where(Goal.status == status)
        
        query = query.order_by(Goal.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_active_goals(self, user_id: str) -> List[Goal]:
        """Get active goals for a user."""
        return await self.get_user_goals(user_id, GoalStatus.ACTIVE)
    
    async def get_goals_by_type(
        self, 
        user_id: str, 
        goal_type: GoalType
    ) -> List[Goal]:
        """Get goals by type for a user."""
        query = select(Goal).where(
            and_(
                Goal.user_id == user_id,
                Goal.type == goal_type,
                Goal.status == GoalStatus.ACTIVE
            )
        ).order_by(Goal.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update_goal_progress(
        self, 
        goal_id: str, 
        current_amount: Decimal
    ) -> Optional[Goal]:
        """Update goal progress."""
        goal = await self.get_by_id(goal_id)
        if not goal:
            return None
        
        goal.current_amount = current_amount
        
        # Auto-complete if target reached
        if goal.current_amount >= goal.target_amount:
            goal.status = GoalStatus.COMPLETED
        
        await self.db.commit()
        await self.db.refresh(goal)
        return goal
    
    async def get_goals_near_completion(
        self, 
        user_id: str, 
        threshold: float = 0.8
    ) -> List[Goal]:
        """Get goals that are near completion (above threshold percentage)."""
        goals = await self.get_active_goals(user_id)
        return [
            goal for goal in goals 
            if goal.progress_percentage >= threshold
        ]
    
    async def get_overdue_goals(self, user_id: str) -> List[Goal]:
        """Get goals that are overdue (past target date)."""
        from datetime import date
        today = date.today()
        
        query = select(Goal).where(
            and_(
                Goal.user_id == user_id,
                Goal.status == GoalStatus.ACTIVE,
                Goal.target_date.isnot(None),
                Goal.target_date < today,
                Goal.is_completed == False
            )
        ).order_by(Goal.target_date.asc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_goals_ending_soon(
        self, 
        user_id: str, 
        days: int = 30
    ) -> List[Goal]:
        """Get goals ending within specified days."""
        from datetime import date, timedelta
        today = date.today()
        future_date = today + timedelta(days=days)
        
        query = select(Goal).where(
            and_(
                Goal.user_id == user_id,
                Goal.status == GoalStatus.ACTIVE,
                Goal.target_date.isnot(None),
                Goal.target_date >= today,
                Goal.target_date <= future_date,
                Goal.is_completed == False
            )
        ).order_by(Goal.target_date.asc())
        
        result = await self.db.execute(query)
        return result.scalars().all()


