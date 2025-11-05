"""
Alert model for notifications and reminders.

Supports various types of financial alerts and notifications.
"""

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Date, DateTime, Text, ForeignKey, Boolean, Enum as SQLEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4
import enum

from core.database import Base
from models.base import TimestampMixin


class AlertType(str, enum.Enum):
    """Alert type enumeration."""
    BILL = "bill"  # Conta a pagar
    GOAL = "goal"  # Meta financeira
    BUDGET = "budget"  # Orçamento
    INCOME = "income"  # Receita esperada
    CUSTOM = "custom"  # Personalizado


class AlertPriority(str, enum.Enum):
    """Alert priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class AlertStatus(str, enum.Enum):
    """Alert status enumeration."""
    ACTIVE = "active"
    DISMISSED = "dismissed"
    COMPLETED = "completed"


class Alert(Base, TimestampMixin):
    """
    Alert model for notifications and reminders.
    
    Attributes:
        id: Unique alert identifier (UUID)
        type: Alert type
        title: Alert title
        description: Alert description
        amount: Optional amount associated with alert
        due_date: Optional due date
        priority: Alert priority level
        status: Current alert status
        is_recurring: Whether this is a recurring alert
        metadata: Additional metadata as JSON
        user_id: Owner of the alert
    """
    
    __tablename__ = "alerts"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="Unique alert identifier"
    )
    
    # Alert information
    type: Mapped[AlertType] = mapped_column(
        SQLEnum(AlertType),
        nullable=False,
        doc="Alert type"
    )
    
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Alert title"
    )
    
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Alert description"
    )
    
    # Optional fields
    amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=15, scale=2),
        nullable=True,
        doc="Optional amount associated with alert"
    )
    
    due_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        doc="Optional due date"
    )
    
    # Alert properties
    priority: Mapped[AlertPriority] = mapped_column(
        SQLEnum(AlertPriority),
        default=AlertPriority.MEDIUM,
        nullable=False,
        doc="Alert priority level"
    )
    
    status: Mapped[AlertStatus] = mapped_column(
        SQLEnum(AlertStatus),
        default=AlertStatus.ACTIVE,
        nullable=False,
        doc="Current alert status"
    )
    
    is_recurring: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether this is a recurring alert"
    )
    
    # Timestamps
    dismissed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="When the alert was dismissed"
    )
    
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="When the alert was completed"
    )
    
    # Additional data
    alert_metadata: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        doc="Additional alert metadata as JSON"
    )
    
    # Relationships
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        doc="Owner of the alert"
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="alerts"
    )
    
    def __repr__(self) -> str:
        return (
            f"<Alert(id='{self.id}', type='{self.type}', "
            f"title='{self.title}', status='{self.status}')>"
        )
    
    @property
    def days_until_due(self) -> Optional[int]:
        """Calculate days until due date."""
        if not self.due_date:
            return None
        
        from datetime import date as date_class
        today = date_class.today()
        
        if self.due_date <= today:
            return 0
        
        return (self.due_date - today).days
    
    @property
    def is_overdue(self) -> bool:
        """Check if the alert is overdue."""
        if not self.due_date:
            return False
        
        from datetime import date as date_class
        return self.due_date < date_class.today()
    
    @property
    def is_due_soon(self, days: int = 3) -> bool:
        """Check if the alert is due within specified days."""
        days_until = self.days_until_due
        return days_until is not None and 0 <= days_until <= days
    
    def dismiss(self) -> None:
        """Mark the alert as dismissed."""
        self.status = AlertStatus.DISMISSED
        self.dismissed_at = datetime.now(timezone.utc)
    
    def complete(self) -> None:
        """Mark the alert as completed."""
        self.status = AlertStatus.COMPLETED
        self.completed_at = datetime.now(timezone.utc)
    
    def is_owned_by(self, user_id: str) -> bool:
        """Check if this alert belongs to the given user."""
        return self.user_id == user_id
