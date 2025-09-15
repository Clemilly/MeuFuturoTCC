"""
Transaction model for financial records.

Supports income and expense transactions with categorization and metadata.
"""

from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Date, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4
import enum

from core.database import Base
from models.base import TimestampMixin


class TransactionType(str, enum.Enum):
    """Transaction type enumeration."""
    INCOME = "income"
    EXPENSE = "expense"


class Transaction(Base, TimestampMixin):
    """
    Transaction model for financial records.
    
    Attributes:
        id: Unique transaction identifier (UUID)
        type: Transaction type (income/expense)
        amount: Transaction amount (positive value)
        description: Transaction description
        notes: Optional additional notes
        transaction_date: Date when transaction occurred
        user_id: Owner of the transaction
        category_id: Category of the transaction
    """
    
    __tablename__ = "transactions"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="Unique transaction identifier"
    )
    
    # Transaction details
    type: Mapped[TransactionType] = mapped_column(
        SQLEnum(TransactionType),
        nullable=False,
        doc="Transaction type (income/expense)"
    )
    
    amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2),
        nullable=False,
        doc="Transaction amount (always positive)"
    )
    
    description: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Transaction description"
    )
    
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Optional additional notes"
    )
    
    transaction_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        doc="Date when transaction occurred"
    )
    
    # Relationships
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        doc="Owner of the transaction"
    )
    
    category_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        doc="Category of the transaction"
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="transactions"
    )
    
    category: Mapped[Optional["Category"]] = relationship(
        "Category",
        back_populates="transactions"
    )
    
    def __repr__(self) -> str:
        try:
            return (
                f"<Transaction(id='{self.id}', type='{self.type}', "
                f"amount={self.amount}, date='{self.transaction_date}')>"
            )
        except Exception:
            # Fallback for detached instances
            return f"<Transaction(id='{getattr(self, 'id', 'unknown')}')>"
    
    @property
    def signed_amount(self) -> Decimal:
        """Get the signed amount (negative for expenses, positive for income)."""
        if self.type == TransactionType.EXPENSE:
            return -self.amount
        return self.amount
    
    @property
    def category_name(self) -> str:
        """Get the category name or 'Sem categoria'."""
        if self.category:
            return self.category.name
        return "Sem categoria"
    
    def is_owned_by(self, user_id: str) -> bool:
        """Check if this transaction belongs to the given user."""
        return self.user_id == user_id
