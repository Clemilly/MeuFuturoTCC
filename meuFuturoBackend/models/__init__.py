"""SQLAlchemy models for the MeuFuturo API."""

from models.base import TimestampMixin
from models.user import User
from models.transaction import Transaction
from models.category import Category
from models.ai_prediction import AIPrediction
from models.goal import Goal
from models.alert import Alert
from models.budget import Budget
from models.platform_stats import PlatformStats
from models.user_feedback import UserFeedback, FeedbackType, FeedbackStatus
from models.accessibility_settings import AccessibilitySettings
from models.user_progress import UserProgress

__all__ = [
    "TimestampMixin",
    "User",
    "Transaction", 
    "Category",
    "AIPrediction",
    "Goal",
    "Alert",
    "Budget",
    "PlatformStats",
    "UserFeedback",
    "FeedbackType",
    "FeedbackStatus",
    "AccessibilitySettings",
    "UserProgress",
]
