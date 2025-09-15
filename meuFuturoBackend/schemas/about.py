"""
Schemas for About page functionality.

Includes platform stats, user progress, accessibility settings, and feedback.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

from models.user_feedback import FeedbackType, FeedbackStatus


# Platform Statistics Schemas
class PlatformStatsResponse(BaseModel):
    """Platform statistics response."""
    total_users: int
    total_transactions: int
    total_categories: int
    total_goals: int
    total_budgets: int
    total_ai_predictions: int
    total_alerts: int
    platform_uptime: float
    last_updated: datetime

    class Config:
        from_attributes = True


# User Progress Schemas
class UserProgressResponse(BaseModel):
    """User progress and achievements response."""
    total_income: Decimal
    total_expenses: Decimal
    total_savings: Decimal
    goals_achieved: int
    budgets_respected: int
    days_active: int
    transactions_created: int
    categories_used: int
    ai_insights_viewed: int
    achievements: List[str]
    current_streak: int

    class Config:
        from_attributes = True


# Accessibility Settings Schemas
class AccessibilitySettingsResponse(BaseModel):
    """User accessibility settings response."""
    high_contrast: bool
    font_size: str
    color_scheme: str
    keyboard_navigation: bool
    skip_links: bool
    focus_indicators: bool
    screen_reader_optimized: bool
    alt_text_detailed: bool
    audio_descriptions: bool
    sound_effects: bool
    large_click_targets: bool
    gesture_controls: bool

    class Config:
        from_attributes = True


class AccessibilitySettingsUpdate(BaseModel):
    """Update accessibility settings request."""
    high_contrast: Optional[bool] = None
    font_size: Optional[str] = Field(None, pattern="^(small|medium|large|extra-large)$")
    color_scheme: Optional[str] = Field(None, pattern="^(default|dark|light|high-contrast)$")
    keyboard_navigation: Optional[bool] = None
    skip_links: Optional[bool] = None
    focus_indicators: Optional[bool] = None
    screen_reader_optimized: Optional[bool] = None
    alt_text_detailed: Optional[bool] = None
    audio_descriptions: Optional[bool] = None
    sound_effects: Optional[bool] = None
    large_click_targets: Optional[bool] = None
    gesture_controls: Optional[bool] = None


# User Feedback Schemas
class UserFeedbackCreate(BaseModel):
    """Create user feedback request."""
    feedback_type: FeedbackType
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating from 1 to 5 stars")
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=2000)
    is_anonymous: bool = False

    class Config:
        use_enum_values = True


class UserFeedbackResponse(BaseModel):
    """User feedback response."""
    id: str
    feedback_type: FeedbackType
    rating: Optional[int]
    title: str
    description: str
    is_anonymous: bool
    status: FeedbackStatus
    created_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


# About Page Data Schema
class AboutPageDataResponse(BaseModel):
    """Complete About page data response."""
    platform_stats: PlatformStatsResponse
    user_progress: Optional[UserProgressResponse]
    accessibility_settings: Optional[AccessibilitySettingsResponse]
    user_features: List[str] = Field(default_factory=list, description="Features unlocked by user")
    recommendations: List[str] = Field(default_factory=list, description="Personalized recommendations")

    class Config:
        from_attributes = True


# Achievement Schemas
class AchievementResponse(BaseModel):
    """User achievement response."""
    id: str
    name: str
    description: str
    icon: str
    unlocked_at: Optional[datetime]
    is_unlocked: bool

    class Config:
        from_attributes = True


# Recommendation Schemas
class RecommendationResponse(BaseModel):
    """Personalized recommendation response."""
    id: str
    type: str  # "category", "goal", "budget", "tip"
    title: str
    description: str
    priority: int  # 1-5, higher is more important
    action_url: Optional[str] = None

    class Config:
        from_attributes = True
