"""
Accessibility settings model.

Stores user-specific accessibility preferences and configurations.
"""

from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from .base import Base, TimestampMixin


class AccessibilitySettings(Base, TimestampMixin):
    """User accessibility settings and preferences."""
    
    __tablename__ = "accessibility_settings"
    
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, 
        unique=True
    )
    
    # Visual settings
    high_contrast: Mapped[bool] = mapped_column(Boolean, default=False)
    font_size: Mapped[str] = mapped_column(
        String(20), 
        default="medium"
    )  # small, medium, large, extra-large
    color_scheme: Mapped[str] = mapped_column(
        String(20), 
        default="default"
    )  # default, dark, light, high-contrast
    
    # Navigation settings
    keyboard_navigation: Mapped[bool] = mapped_column(Boolean, default=True)
    skip_links: Mapped[bool] = mapped_column(Boolean, default=True)
    focus_indicators: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Screen reader settings
    screen_reader_optimized: Mapped[bool] = mapped_column(Boolean, default=False)
    alt_text_detailed: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Audio settings
    audio_descriptions: Mapped[bool] = mapped_column(Boolean, default=False)
    sound_effects: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Motor settings
    large_click_targets: Mapped[bool] = mapped_column(Boolean, default=False)
    gesture_controls: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="accessibility_settings")
    
    def __repr__(self) -> str:
        return f"<AccessibilitySettings(id={self.id}, user_id={self.user_id})>"
