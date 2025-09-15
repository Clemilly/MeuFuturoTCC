"""
Progress service for managing user progress and achievements.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from repositories.user_progress_repository import UserProgressRepository
from schemas.about import UserProgressResponse

logger = structlog.get_logger()


class ProgressService:
    """Service for user progress and achievements."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.progress_repo = UserProgressRepository(db)
    
    async def get_user_progress(self, user_id: str) -> Optional[UserProgressResponse]:
        """Get user progress and achievements."""
        try:
            progress = await self.progress_repo.get_by_user(user_id)
            
            if not progress:
                # Create default progress for new user
                progress = await self.progress_repo.create(user_id=user_id)
            
            # Get achievements
            achievements = await self.progress_repo.get_achievements(user_id)
            
            # Calculate current streak (simplified)
            current_streak = max(progress.week_streak, progress.month_streak)
            
            return UserProgressResponse(
                total_income=progress.total_income,
                total_expenses=progress.total_expenses,
                total_savings=progress.total_savings,
                goals_achieved=progress.goals_achieved,
                budgets_respected=progress.budgets_respected,
                days_active=progress.days_active,
                transactions_created=progress.transactions_created,
                categories_used=progress.categories_used,
                ai_insights_viewed=progress.ai_insights_viewed,
                achievements=achievements,
                current_streak=current_streak
            )
        except Exception as e:
            logger.error("Error getting user progress", error=str(e), user_id=user_id)
            raise
    
    async def update_user_progress(self, user_id: str, progress_data: dict) -> None:
        """Update user progress based on actions."""
        try:
            await self.progress_repo.create_or_update(user_id, progress_data)
            
            # Check for new achievements
            new_achievements = await self.progress_repo.check_achievements(user_id)
            
            if new_achievements:
                logger.info(
                    "New achievements unlocked",
                    user_id=user_id,
                    achievements=new_achievements
                )
        except Exception as e:
            logger.error("Error updating user progress", error=str(e), user_id=user_id)
            raise
    
    async def check_achievements(self, user_id: str) -> List[str]:
        """Check and unlock new achievements."""
        try:
            return await self.progress_repo.check_achievements(user_id)
        except Exception as e:
            logger.error("Error checking achievements", error=str(e), user_id=user_id)
            raise
    
    async def increment_usage_stat(self, user_id: str, stat_name: str, increment: int = 1) -> None:
        """Increment a usage statistic."""
        try:
            await self.progress_repo.increment_usage_stat(user_id, stat_name, increment)
            
            # Check for new achievements after incrementing
            await self.check_achievements(user_id)
        except Exception as e:
            logger.error(
                "Error incrementing usage stat",
                error=str(e),
                user_id=user_id,
                stat_name=stat_name,
                increment=increment
            )
            raise
    
    async def update_financial_progress(
        self, 
        user_id: str, 
        income: float = 0, 
        expenses: float = 0, 
        savings: float = 0
    ) -> None:
        """Update financial progress metrics."""
        try:
            await self.progress_repo.update_financial_progress(user_id, income, expenses, savings)
            
            # Check for new achievements after financial update
            await self.check_achievements(user_id)
        except Exception as e:
            logger.error(
                "Error updating financial progress",
                error=str(e),
                user_id=user_id,
                income=income,
                expenses=expenses,
                savings=savings
            )
            raise
