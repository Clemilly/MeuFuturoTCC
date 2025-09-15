"""
Goal model for financial goals and targets.

Supports various types of financial goals with progress tracking.
"""

from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Date, Text, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4
import enum

from core.database import Base
from models.base import TimestampMixin


class GoalType(str, enum.Enum):
    """Goal type enumeration."""
    SAVINGS = "savings"  # Poupança
    EXPENSE_REDUCTION = "expense_reduction"  # Redução de gastos
    INCOME_INCREASE = "income_increase"  # Aumento de receita
    DEBT_PAYMENT = "debt_payment"  # Pagamento de dívida
    CUSTOM = "custom"  # Personalizado


class GoalStatus(str, enum.Enum):
    """Goal status enumeration."""
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class Goal(Base, TimestampMixin):
    """
    Goal model for financial goals and targets.
    
    Attributes:
        id: Unique goal identifier (UUID)
        name: Goal name
        description: Goal description
        type: Goal type
        target_amount: Target amount to achieve
        current_amount: Current amount achieved
        start_date: When the goal started
        target_date: When the goal should be completed
        status: Current goal status
        is_recurring: Whether this is a recurring goal
        user_id: Owner of the goal
    """
    
    __tablename__ = "goals"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="Unique goal identifier"
    )
    
    # Goal information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Goal name"
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Goal description"
    )
    
    type: Mapped[GoalType] = mapped_column(
        SQLEnum(GoalType),
        nullable=False,
        doc="Goal type"
    )
    
    # Amounts
    target_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2),
        nullable=False,
        doc="Target amount to achieve"
    )
    
    current_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Current amount achieved"
    )
    
    # Dates
    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        doc="When the goal started"
    )
    
    target_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        doc="When the goal should be completed"
    )
    
    # Status
    status: Mapped[GoalStatus] = mapped_column(
        SQLEnum(GoalStatus),
        default=GoalStatus.ACTIVE,
        nullable=False,
        doc="Current goal status"
    )
    
    is_recurring: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether this is a recurring goal"
    )
    
    # Relationships
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        doc="Owner of the goal"
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="goals"
    )
    
    def __repr__(self) -> str:
        return (
            f"<Goal(id='{self.id}', name='{self.name}', "
            f"type='{self.type}', status='{self.status}')>"
        )
    
    @property
    def progress_percentage(self) -> float:
        """Calculate progress percentage (0-100)."""
        if self.target_amount == 0:
            return 0.0
        
        percentage = float(self.current_amount / self.target_amount) * 100
        return min(percentage, 100.0)  # Cap at 100%
    
    @property
    def remaining_amount(self) -> Decimal:
        """Calculate remaining amount to reach target."""
        remaining = self.target_amount - self.current_amount
        return max(remaining, Decimal("0.00"))
    
    @property
    def is_completed(self) -> bool:
        """Check if the goal is completed."""
        return self.current_amount >= self.target_amount
    
    @property
    def days_remaining(self) -> Optional[int]:
        """Calculate days remaining until target date."""
        if not self.target_date:
            return None
        
        from datetime import date as date_class
        today = date_class.today()
        
        if self.target_date <= today:
            return 0
        
        return (self.target_date - today).days
    
    def add_progress(self, amount: Decimal) -> None:
        """Add progress to the goal."""
        self.current_amount += amount
        
        # Auto-complete if target reached
        if self.current_amount >= self.target_amount and self.status == GoalStatus.ACTIVE:
            self.status = GoalStatus.COMPLETED
    
    def is_owned_by(self, user_id: str) -> bool:
        """Check if this goal belongs to the given user."""
        return self.user_id == user_id
