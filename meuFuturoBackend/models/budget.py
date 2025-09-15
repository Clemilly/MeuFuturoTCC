"""
Budget model for spending limits and budget tracking.

Supports monthly and custom period budgets with category-based tracking.
"""

from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Date, ForeignKey, Boolean, Enum as SQLEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4
import enum

from core.database import Base
from models.base import TimestampMixin


class BudgetPeriod(str, enum.Enum):
    """Budget period enumeration."""
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    CUSTOM = "custom"


class BudgetStatus(str, enum.Enum):
    """Budget status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXCEEDED = "exceeded"


class Budget(Base, TimestampMixin):
    """
    Budget model for spending limits and budget tracking.
    
    Attributes:
        id: Unique budget identifier (UUID)
        name: Budget name
        amount: Budget amount limit
        spent_amount: Amount already spent
        period: Budget period type
        start_date: Budget start date
        end_date: Budget end date
        status: Current budget status
        is_recurring: Whether this budget repeats
        alert_threshold: Percentage threshold for alerts (0-100)
        user_id: Owner of the budget
        category_id: Category this budget applies to (optional)
    """
    
    __tablename__ = "budgets"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="Unique budget identifier"
    )
    
    # Budget information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Budget name"
    )
    
    amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2),
        nullable=False,
        doc="Budget amount limit"
    )
    
    spent_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Amount already spent"
    )
    
    # Period information
    period: Mapped[BudgetPeriod] = mapped_column(
        SQLEnum(BudgetPeriod),
        nullable=False,
        doc="Budget period type"
    )
    
    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        doc="Budget start date"
    )
    
    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        doc="Budget end date"
    )
    
    # Budget properties
    status: Mapped[BudgetStatus] = mapped_column(
        SQLEnum(BudgetStatus),
        default=BudgetStatus.ACTIVE,
        nullable=False,
        doc="Current budget status"
    )
    
    is_recurring: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether this budget repeats"
    )
    
    alert_threshold: Mapped[int] = mapped_column(
        Integer,
        default=80,
        nullable=False,
        doc="Percentage threshold for alerts (0-100)"
    )
    
    # Relationships
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        doc="Owner of the budget"
    )
    
    category_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=True,
        doc="Category this budget applies to (optional for overall budget)"
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="budgets"
    )
    
    category: Mapped[Optional["Category"]] = relationship(
        "Category",
        back_populates="budgets"
    )
    
    def __repr__(self) -> str:
        return (
            f"<Budget(id='{self.id}', name='{self.name}', "
            f"amount={self.amount}, period='{self.period}')>"
        )
    
    @property
    def remaining_amount(self) -> Decimal:
        """Calculate remaining budget amount."""
        remaining = self.amount - self.spent_amount
        return max(remaining, Decimal("0.00"))
    
    @property
    def spent_percentage(self) -> float:
        """Calculate percentage of budget spent (0-100)."""
        if self.amount == 0:
            return 0.0
        
        percentage = float(self.spent_amount / self.amount) * 100
        return min(percentage, 100.0)  # Cap at 100%
    
    @property
    def is_exceeded(self) -> bool:
        """Check if budget has been exceeded."""
        return self.spent_amount > self.amount
    
    @property
    def is_near_limit(self) -> bool:
        """Check if spending is near the alert threshold."""
        return self.spent_percentage >= self.alert_threshold
    
    @property
    def is_active_period(self) -> bool:
        """Check if current date is within budget period."""
        from datetime import date as date_class
        today = date_class.today()
        return self.start_date <= today <= self.end_date
    
    @property
    def days_remaining(self) -> int:
        """Calculate days remaining in budget period."""
        from datetime import date as date_class
        today = date_class.today()
        
        if self.end_date <= today:
            return 0
        
        return (self.end_date - today).days
    
    def add_expense(self, amount: Decimal) -> None:
        """Add an expense to this budget."""
        self.spent_amount += amount
        
        # Update status if exceeded
        if self.is_exceeded and self.status == BudgetStatus.ACTIVE:
            self.status = BudgetStatus.EXCEEDED
    
    def remove_expense(self, amount: Decimal) -> None:
        """Remove an expense from this budget (e.g., when transaction is deleted)."""
        self.spent_amount = max(self.spent_amount - amount, Decimal("0.00"))
        
        # Update status if no longer exceeded
        if not self.is_exceeded and self.status == BudgetStatus.EXCEEDED:
            self.status = BudgetStatus.ACTIVE
    
    def reset_spent_amount(self) -> None:
        """Reset spent amount (useful for recurring budgets)."""
        self.spent_amount = Decimal("0.00")
        self.status = BudgetStatus.ACTIVE
    
    def is_owned_by(self, user_id: str) -> bool:
        """Check if this budget belongs to the given user."""
        return self.user_id == user_id
