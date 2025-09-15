"""
User progress model.

Tracks user progress, achievements, and usage statistics.
"""

from decimal import Decimal
from sqlalchemy import String, Integer, Boolean, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from .base import Base, TimestampMixin


class UserProgress(Base, TimestampMixin):
    """User progress and achievements tracking."""
    
    __tablename__ = "user_progress"
    
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
    
    # Financial progress
    total_income: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), 
        default=Decimal('0.00')
    )
    total_expenses: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), 
        default=Decimal('0.00')
    )
    total_savings: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), 
        default=Decimal('0.00')
    )
    goals_achieved: Mapped[int] = mapped_column(Integer, default=0)
    budgets_respected: Mapped[int] = mapped_column(Integer, default=0)
    
    # Usage statistics
    days_active: Mapped[int] = mapped_column(Integer, default=0)
    transactions_created: Mapped[int] = mapped_column(Integer, default=0)
    categories_used: Mapped[int] = mapped_column(Integer, default=0)
    ai_insights_viewed: Mapped[int] = mapped_column(Integer, default=0)
    
    # Achievements
    first_transaction: Mapped[bool] = mapped_column(Boolean, default=False)
    first_goal: Mapped[bool] = mapped_column(Boolean, default=False)
    first_budget: Mapped[bool] = mapped_column(Boolean, default=False)
    week_streak: Mapped[int] = mapped_column(Integer, default=0)
    month_streak: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="progress")
    
    def __repr__(self) -> str:
        return f"<UserProgress(id={self.id}, user_id={self.user_id}, savings={self.total_savings})>"
