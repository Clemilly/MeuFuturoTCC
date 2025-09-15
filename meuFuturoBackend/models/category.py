"""
Category model for organizing transactions.

Supports both system-defined and user-defined categories.
"""

from typing import List, Optional
from sqlalchemy import String, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from core.database import Base
from models.base import TimestampMixin


class Category(Base, TimestampMixin):
    """
    Category model for organizing transactions.
    
    Attributes:
        id: Unique category identifier (UUID)
        name: Category name
        description: Optional description
        color: Hex color code for UI display
        icon: Icon identifier for UI display
        is_system: Whether this is a system-defined category
        is_active: Whether the category is active
        user_id: Owner of the category (nullable for system categories)
        parent_id: Parent category for subcategories
    """
    
    __tablename__ = "categories"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="Unique category identifier"
    )
    
    # Category information
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="Category name"
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Category description"
    )
    
    # UI properties
    color: Mapped[Optional[str]] = mapped_column(
        String(7),  # Hex color code (#RRGGBB)
        nullable=True,
        doc="Hex color code for UI display"
    )
    
    icon: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="Icon identifier for UI display"
    )
    
    # Category type and status
    is_system: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether this is a system-defined category"
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Whether the category is active"
    )
    
    # Relationships
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        doc="Owner of the category (nullable for system categories)"
    )
    
    parent_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=True,
        doc="Parent category for subcategories"
    )
    
    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="categories"
    )
    
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="category"
    )
    
    parent: Mapped[Optional["Category"]] = relationship(
        "Category",
        remote_side=[id],
        back_populates="subcategories"
    )
    
    subcategories: Mapped[List["Category"]] = relationship(
        "Category",
        back_populates="parent",
        cascade="all, delete-orphan"
    )
    
    budgets: Mapped[List["Budget"]] = relationship(
        "Budget",
        back_populates="category"
    )
    
    def __repr__(self) -> str:
        return f"<Category(id='{self.id}', name='{self.name}', is_system={self.is_system})>"
    
    @property
    def full_name(self) -> str:
        """Get the full category name including parent."""
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name
    
    @property
    def is_subcategory(self) -> bool:
        """Check if this is a subcategory."""
        return self.parent_id is not None
    
    def can_be_deleted_by_user(self, user_id: str) -> bool:
        """Check if this category can be deleted by the given user."""
        if self.is_system:
            return False
        return self.user_id == user_id
