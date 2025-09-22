"""
Goal schemas for financial goals management.
"""

from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import date, datetime
from typing import Optional
from models.goal import GoalType, GoalStatus


class GoalCreate(BaseModel):
    """Schema for creating a financial goal."""
    name: str = Field(..., min_length=1, max_length=255, description="Goal name")
    description: Optional[str] = Field(None, max_length=1000, description="Goal description")
    type: GoalType = Field(..., description="Goal type")
    target_amount: Decimal = Field(..., gt=0, description="Target amount to achieve")
    start_date: date = Field(..., description="When the goal started")
    target_date: Optional[date] = Field(None, description="When the goal should be completed")
    is_recurring: bool = Field(False, description="Whether this is a recurring goal")

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Reserva de Emergência",
                "description": "Meta para criar uma reserva de emergência de 6 meses",
                "type": "savings",
                "target_amount": 10000.00,
                "start_date": "2025-01-01",
                "target_date": "2025-12-31",
                "is_recurring": False
            }
        }
    }


class GoalUpdate(BaseModel):
    """Schema for updating a financial goal."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    target_amount: Optional[Decimal] = Field(None, gt=0)
    target_date: Optional[date] = None
    status: Optional[GoalStatus] = None
    is_recurring: Optional[bool] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Reserva de Emergência Atualizada",
                "description": "Meta atualizada para reserva de emergência",
                "target_amount": 15000.00,
                "target_date": "2025-12-31",
                "status": "active"
            }
        }
    }


class GoalResponse(BaseModel):
    """Schema for goal response."""
    id: str
    name: str
    description: Optional[str]
    type: GoalType
    target_amount: Decimal
    current_amount: Decimal
    start_date: date
    target_date: Optional[date]
    status: GoalStatus
    is_recurring: bool
    progress_percentage: float
    remaining_amount: Decimal
    days_remaining: Optional[int]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Reserva de Emergência",
                "description": "Meta para criar uma reserva de emergência",
                "type": "savings",
                "target_amount": 10000.00,
                "current_amount": 2500.00,
                "start_date": "2025-01-01",
                "target_date": "2025-12-31",
                "status": "active",
                "is_recurring": False,
                "progress_percentage": 25.0,
                "remaining_amount": 7500.00,
                "days_remaining": 300,
                "is_completed": False,
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-15T10:30:00Z"
            }
        }
    }


class GoalProgressUpdate(BaseModel):
    """Schema for updating goal progress."""
    current_amount: Decimal = Field(..., ge=0, description="Current amount achieved")

    model_config = {
        "json_schema_extra": {
            "example": {
                "current_amount": 3000.00
            }
        }
    }


