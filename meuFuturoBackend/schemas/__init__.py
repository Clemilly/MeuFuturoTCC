"""Pydantic schemas for request/response validation."""

from schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserLogin,
    UserProfile,
    AccessibilityPreferences,
    FinancialProfile,
)
from schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionFilter,
    TransactionSummary,
)
from schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)
from schemas.ai_prediction import (
    AIPredictionResponse,
    PredictionRequest,
    FinancialInsights,
)
from schemas.common import (
    PaginatedResponse,
    SuccessResponse,
    ErrorResponse,
)

__all__ = [
    # User schemas
    "UserCreate",
    "UserUpdate", 
    "UserResponse",
    "UserLogin",
    "UserProfile",
    "AccessibilityPreferences",
    "FinancialProfile",
    # Transaction schemas
    "TransactionCreate",
    "TransactionUpdate",
    "TransactionResponse",
    "TransactionFilter",
    "TransactionSummary",
    # Category schemas
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    # AI schemas
    "AIPredictionResponse",
    "PredictionRequest",
    "FinancialInsights",
    # Common schemas
    "PaginatedResponse",
    "SuccessResponse",
    "ErrorResponse",
]
