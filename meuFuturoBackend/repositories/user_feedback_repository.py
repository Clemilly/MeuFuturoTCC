"""
Repository for user feedback.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from repositories.base import BaseRepository
from models.user_feedback import UserFeedback, FeedbackType, FeedbackStatus


class UserFeedbackRepository(BaseRepository[UserFeedback]):
    """Repository for user feedback operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(UserFeedback, db)
    
    async def get_by_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[UserFeedback]:
        """Get feedback by user ID."""
        result = await self.db.execute(
            select(UserFeedback)
            .where(UserFeedback.user_id == user_id)
            .order_by(UserFeedback.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_type(self, feedback_type: FeedbackType, skip: int = 0, limit: int = 100) -> List[UserFeedback]:
        """Get feedback by type."""
        result = await self.db.execute(
            select(UserFeedback)
            .where(UserFeedback.feedback_type == feedback_type)
            .order_by(UserFeedback.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_status(self, status: FeedbackStatus, skip: int = 0, limit: int = 100) -> List[UserFeedback]:
        """Get feedback by status."""
        result = await self.db.execute(
            select(UserFeedback)
            .where(UserFeedback.status == status)
            .order_by(UserFeedback.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def update_status(self, feedback_id: str, status: FeedbackStatus) -> Optional[UserFeedback]:
        """Update feedback status."""
        feedback = await self.get_by_id(feedback_id)
        if feedback:
            feedback.status = status
            await self.db.flush()
            await self.db.refresh(feedback)
        return feedback
    
    async def get_rating_stats(self) -> dict:
        """Get rating statistics."""
        result = await self.db.execute(
            select(
                UserFeedback.rating,
                func.count(UserFeedback.id).label('count')
            )
            .where(UserFeedback.rating.isnot(None))
            .group_by(UserFeedback.rating)
        )
        
        stats = {}
        for row in result.fetchall():
            stats[f"rating_{row.rating}"] = row.count
        
        return stats
