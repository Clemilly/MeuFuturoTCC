"""
Feedback service for managing user feedback and suggestions.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from repositories.user_feedback_repository import UserFeedbackRepository
from schemas.about import UserFeedbackCreate, UserFeedbackResponse
from models.user_feedback import FeedbackType, FeedbackStatus

logger = structlog.get_logger()


class FeedbackService:
    """Service for user feedback and suggestions."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.feedback_repo = UserFeedbackRepository(db)
    
    async def submit_feedback(
        self, 
        user_id: str, 
        feedback_data: UserFeedbackCreate
    ) -> UserFeedbackResponse:
        """Submit user feedback."""
        try:
            # Create feedback
            feedback = await self.feedback_repo.create(
                user_id=user_id,
                feedback_type=feedback_data.feedback_type,
                rating=feedback_data.rating,
                title=feedback_data.title,
                description=feedback_data.description,
                is_anonymous=feedback_data.is_anonymous,
                status=FeedbackStatus.PENDING
            )
            
            logger.info(
                "Feedback submitted",
                user_id=user_id,
                feedback_id=feedback.id,
                feedback_type=feedback_data.feedback_type
            )
            
            return UserFeedbackResponse(
                id=feedback.id,
                feedback_type=feedback.feedback_type,
                rating=feedback.rating,
                title=feedback.title,
                description=feedback.description,
                is_anonymous=feedback.is_anonymous,
                status=feedback.status,
                created_at=feedback.created_at
            )
        except Exception as e:
            logger.error(
                "Error submitting feedback",
                error=str(e),
                user_id=user_id,
                feedback_data=feedback_data.dict()
            )
            raise
    
    async def get_user_feedback(
        self, 
        user_id: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[UserFeedbackResponse]:
        """Get user's feedback submissions."""
        try:
            feedbacks = await self.feedback_repo.get_by_user(user_id, skip, limit)
            
            return [
                UserFeedbackResponse(
                    id=feedback.id,
                    feedback_type=feedback.feedback_type,
                    rating=feedback.rating,
                    title=feedback.title,
                    description=feedback.description,
                    is_anonymous=feedback.is_anonymous,
                    status=feedback.status,
                    created_at=feedback.created_at
                )
                for feedback in feedbacks
            ]
        except Exception as e:
            logger.error(
                "Error getting user feedback",
                error=str(e),
                user_id=user_id
            )
            raise
    
    async def get_feedback_by_type(
        self, 
        feedback_type: FeedbackType, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[UserFeedbackResponse]:
        """Get feedback by type."""
        try:
            feedbacks = await self.feedback_repo.get_by_type(feedback_type, skip, limit)
            
            return [
                UserFeedbackResponse(
                    id=feedback.id,
                    feedback_type=feedback.feedback_type,
                    rating=feedback.rating,
                    title=feedback.title,
                    description=feedback.description,
                    is_anonymous=feedback.is_anonymous,
                    status=feedback.status,
                    created_at=feedback.created_at
                )
                for feedback in feedbacks
            ]
        except Exception as e:
            logger.error(
                "Error getting feedback by type",
                error=str(e),
                feedback_type=feedback_type
            )
            raise
    
    async def get_feedback_by_status(
        self, 
        status: FeedbackStatus, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[UserFeedbackResponse]:
        """Get feedback by status."""
        try:
            feedbacks = await self.feedback_repo.get_by_status(status, skip, limit)
            
            return [
                UserFeedbackResponse(
                    id=feedback.id,
                    feedback_type=feedback.feedback_type,
                    rating=feedback.rating,
                    title=feedback.title,
                    description=feedback.description,
                    is_anonymous=feedback.is_anonymous,
                    status=feedback.status,
                    created_at=feedback.created_at
                )
                for feedback in feedbacks
            ]
        except Exception as e:
            logger.error(
                "Error getting feedback by status",
                error=str(e),
                status=status
            )
            raise
    
    async def update_feedback_status(
        self, 
        feedback_id: str, 
        status: FeedbackStatus
    ) -> Optional[UserFeedbackResponse]:
        """Update feedback status."""
        try:
            feedback = await self.feedback_repo.update_status(feedback_id, status)
            
            if not feedback:
                return None
            
            logger.info(
                "Feedback status updated",
                feedback_id=feedback_id,
                status=status
            )
            
            return UserFeedbackResponse(
                id=feedback.id,
                feedback_type=feedback.feedback_type,
                rating=feedback.rating,
                title=feedback.title,
                description=feedback.description,
                is_anonymous=feedback.is_anonymous,
                status=feedback.status,
                created_at=feedback.created_at
            )
        except Exception as e:
            logger.error(
                "Error updating feedback status",
                error=str(e),
                feedback_id=feedback_id,
                status=status
            )
            raise
    
    async def get_rating_stats(self) -> dict:
        """Get feedback rating statistics."""
        try:
            return await self.feedback_repo.get_rating_stats()
        except Exception as e:
            logger.error("Error getting rating stats", error=str(e))
            raise
