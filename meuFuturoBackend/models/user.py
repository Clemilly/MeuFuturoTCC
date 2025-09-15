"""
User model for authentication and profile management.

Includes support for 2FA and accessibility preferences.
"""

from typing import List, Optional
from sqlalchemy import String, Boolean, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from core.database import Base
from models.base import TimestampMixin


class User(Base, TimestampMixin):
    """
    User model for the application.
    
    Attributes:
        id: Unique user identifier (UUID)
        email: User's email address (unique)
        name: User's display name
        hashed_password: Bcrypt hashed password
        is_active: Whether the user account is active
        is_verified: Whether the email is verified
        two_factor_enabled: Whether 2FA is enabled
        two_factor_secret: TOTP secret for 2FA (nullable)
        accessibility_preferences: JSON field for accessibility settings
        financial_profile: JSON field for financial preferences
    """
    
    __tablename__ = "users"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="Unique user identifier"
    )
    
    # Authentication fields
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        doc="User's email address"
    )
    
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="User's display name"
    )
    
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Bcrypt hashed password"
    )
    
    # Account status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Whether the user account is active"
    )
    
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether the email is verified"
    )
    
    # Two-factor authentication
    two_factor_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether 2FA is enabled"
    )
    
    two_factor_secret: Mapped[Optional[str]] = mapped_column(
        String(32),
        nullable=True,
        doc="TOTP secret for 2FA"
    )
    
    # User preferences (JSON fields for flexibility)
    accessibility_preferences: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        doc="Accessibility settings (theme, font size, etc.)"
    )
    
    financial_profile: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        doc="Financial preferences and settings"
    )
    
    # Profile information
    bio: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="User biography/description"
    )
    
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="URL to user's avatar image"
    )
    
    # Relationships
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan",
        doc="User's financial transactions"
    )
    
    categories: Mapped[List["Category"]] = relationship(
        "Category",
        back_populates="user",
        cascade="all, delete-orphan",
        doc="User's custom categories"
    )
    
    predictions: Mapped[List["AIPrediction"]] = relationship(
        "AIPrediction",
        back_populates="user",
        cascade="all, delete-orphan",
        doc="AI predictions for this user"
    )
    
    goals: Mapped[List["Goal"]] = relationship(
        "Goal",
        back_populates="user",
        cascade="all, delete-orphan",
        doc="User's financial goals"
    )
    
    alerts: Mapped[List["Alert"]] = relationship(
        "Alert",
        back_populates="user",
        cascade="all, delete-orphan",
        doc="User's alerts and notifications"
    )
    
    budgets: Mapped[List["Budget"]] = relationship(
        "Budget",
        back_populates="user",
        cascade="all, delete-orphan",
        doc="User's budgets"
    )
    
    # New relationships for About page features
    feedbacks: Mapped[List["UserFeedback"]] = relationship(
        "UserFeedback",
        back_populates="user",
        cascade="all, delete-orphan",
        doc="User's feedback submissions"
    )
    
    accessibility_settings: Mapped[Optional["AccessibilitySettings"]] = relationship(
        "AccessibilitySettings",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
        doc="User's accessibility settings"
    )
    
    progress: Mapped[Optional["UserProgress"]] = relationship(
        "UserProgress",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
        doc="User's progress and achievements"
    )
    
    def __repr__(self) -> str:
        return f"<User(id='{self.id}', email='{self.email}', name='{self.name}')>"
    
    @property
    def is_2fa_enabled(self) -> bool:
        """Check if 2FA is properly configured."""
        return self.two_factor_enabled and self.two_factor_secret is not None
    
    def get_accessibility_preference(self, key: str, default=None):
        """Get a specific accessibility preference."""
        if not self.accessibility_preferences:
            return default
        return self.accessibility_preferences.get(key, default)
    
    def set_accessibility_preference(self, key: str, value) -> None:
        """Set a specific accessibility preference."""
        if not self.accessibility_preferences:
            self.accessibility_preferences = {}
        self.accessibility_preferences[key] = value
    
    def get_financial_preference(self, key: str, default=None):
        """Get a specific financial preference."""
        if not self.financial_profile:
            return default
        return self.financial_profile.get(key, default)
    
    def set_financial_preference(self, key: str, value) -> None:
        """Set a specific financial preference."""
        if not self.financial_profile:
            self.financial_profile = {}
        self.financial_profile[key] = value
