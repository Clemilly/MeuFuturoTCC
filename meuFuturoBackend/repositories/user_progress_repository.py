"""
Repository for user progress and achievements.
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from repositories.base import BaseRepository
from models.user_progress import UserProgress


class UserProgressRepository(BaseRepository[UserProgress]):
    """Repository for user progress operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(UserProgress, db)
    
    async def get_by_user(self, user_id: str) -> Optional[UserProgress]:
        """Get user progress by user ID."""
        result = await self.db.execute(
            select(UserProgress)
            .where(UserProgress.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create_or_update(self, user_id: str, progress_data: dict) -> UserProgress:
        """Create or update user progress."""
        existing_progress = await self.get_by_user(user_id)
        
        if existing_progress:
            # Update existing progress
            for key, value in progress_data.items():
                if hasattr(existing_progress, key):
                    setattr(existing_progress, key, value)
            await self.db.flush()
            await self.db.refresh(existing_progress)
            return existing_progress
        else:
            # Create new progress
            progress_data['user_id'] = user_id
            return await self.create(**progress_data)
    
    async def update_financial_progress(
        self, 
        user_id: str, 
        income: float = 0, 
        expenses: float = 0, 
        savings: float = 0
    ) -> UserProgress:
        """Update financial progress metrics."""
        progress = await self.get_by_user(user_id)
        if not progress:
            progress = await self.create(user_id=user_id)
        
        progress.total_income += income
        progress.total_expenses += expenses
        progress.total_savings += savings
        
        await self.db.flush()
        await self.db.refresh(progress)
        return progress
    
    async def increment_usage_stat(self, user_id: str, stat_name: str, increment: int = 1) -> UserProgress:
        """Increment a usage statistic."""
        progress = await self.get_by_user(user_id)
        if not progress:
            progress = await self.create(user_id=user_id)
        
        if hasattr(progress, stat_name):
            current_value = getattr(progress, stat_name)
            setattr(progress, stat_name, current_value + increment)
        
        await self.db.flush()
        await self.db.refresh(progress)
        return progress
    
    async def check_achievements(self, user_id: str) -> List[str]:
        """Check and unlock new achievements."""
        progress = await self.get_by_user(user_id)
        if not progress:
            return []
        
        new_achievements = []
        
        # Check first transaction achievement
        if progress.transactions_created >= 1 and not progress.first_transaction:
            progress.first_transaction = True
            new_achievements.append("first_transaction")
        
        # Check first goal achievement
        if progress.goals_achieved >= 1 and not progress.first_goal:
            progress.first_goal = True
            new_achievements.append("first_goal")
        
        # Check first budget achievement
        if progress.budgets_respected >= 1 and not progress.first_budget:
            progress.first_budget = True
            new_achievements.append("first_budget")
        
        # Check week streak achievement
        if progress.days_active >= 7 and progress.week_streak < 1:
            progress.week_streak = 1
            new_achievements.append("week_streak")
        
        # Check month streak achievement
        if progress.days_active >= 30 and progress.month_streak < 1:
            progress.month_streak = 1
            new_achievements.append("month_streak")
        
        if new_achievements:
            await self.db.flush()
            await self.db.refresh(progress)
        
        return new_achievements
    
    async def get_achievements(self, user_id: str) -> List[str]:
        """Get all unlocked achievements for a user."""
        progress = await self.get_by_user(user_id)
        if not progress:
            return []
        
        achievements = []
        
        if progress.first_transaction:
            achievements.append("first_transaction")
        if progress.first_goal:
            achievements.append("first_goal")
        if progress.first_budget:
            achievements.append("first_budget")
        if progress.week_streak > 0:
            achievements.append("week_streak")
        if progress.month_streak > 0:
            achievements.append("month_streak")
        
        return achievements
