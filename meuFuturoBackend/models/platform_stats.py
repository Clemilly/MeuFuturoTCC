"""
Platform statistics model.

Tracks overall platform metrics and statistics.
"""

from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from uuid import uuid4

from .base import Base, TimestampMixin


class PlatformStats(Base, TimestampMixin):
    """Platform statistics and metrics."""
    
    __tablename__ = "platform_stats"
    
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid4())
    )
    total_users: Mapped[int] = mapped_column(Integer, default=0)
    total_transactions: Mapped[int] = mapped_column(Integer, default=0)
    total_categories: Mapped[int] = mapped_column(Integer, default=0)
    total_goals: Mapped[int] = mapped_column(Integer, default=0)
    total_budgets: Mapped[int] = mapped_column(Integer, default=0)
    total_ai_predictions: Mapped[int] = mapped_column(Integer, default=0)
    total_alerts: Mapped[int] = mapped_column(Integer, default=0)
    platform_uptime: Mapped[float] = mapped_column(Float, default=0.0)
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow
    )
    
    def __repr__(self) -> str:
        return f"<PlatformStats(id={self.id}, users={self.total_users})>"
