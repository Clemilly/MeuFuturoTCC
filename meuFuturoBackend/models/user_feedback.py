"""
User feedback model.

Handles user feedback and suggestions for the platform.
"""

from enum import Enum
from sqlalchemy import String, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from .base import Base, TimestampMixin


class FeedbackType(str, Enum):
    """Types of user feedback."""
    BUG = "bug"
    SUGGESTION = "suggestion"
    PRAISE = "praise"
    COMPLAINT = "complaint"
    FEATURE_REQUEST = "feature_request"


class FeedbackStatus(str, Enum):
    """Status of feedback processing."""
    PENDING = "pending"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class UserFeedback(Base, TimestampMixin):
    """User feedback and suggestions."""
    
    __tablename__ = "user_feedback"
    
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    feedback_type: Mapped[FeedbackType] = mapped_column(
        String(20), 
        nullable=False
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=True)  # 1-5 stars
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[FeedbackStatus] = mapped_column(
        String(20), 
        default=FeedbackStatus.PENDING
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="feedbacks")
    
    def __repr__(self) -> str:
        return f"<UserFeedback(id={self.id}, type={self.feedback_type}, status={self.status})>"
