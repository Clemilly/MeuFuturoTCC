"""
Alert schemas for financial alerts management.
"""

from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import date, datetime
from typing import Optional
from models.alert import AlertType, AlertPriority, AlertStatus


class AlertCreate(BaseModel):
    """Schema for creating a financial alert."""
    type: AlertType = Field(..., description="Alert type")
    title: str = Field(..., min_length=1, max_length=255, description="Alert title")
    description: str = Field(..., min_length=1, max_length=1000, description="Alert description")
    amount: Optional[Decimal] = Field(None, ge=0, description="Optional amount associated with alert")
    due_date: Optional[date] = Field(None, description="Optional due date")
    priority: AlertPriority = Field(AlertPriority.MEDIUM, description="Alert priority level")
    is_recurring: bool = Field(False, description="Whether this is a recurring alert")

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "bill",
                "title": "Conta de Internet",
                "description": "Vencimento da conta de internet",
                "amount": 89.90,
                "due_date": "2025-01-31",
                "priority": "high",
                "is_recurring": True
            }
        }
    }


class AlertUpdate(BaseModel):
    """Schema for updating a financial alert."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    amount: Optional[Decimal] = Field(None, ge=0)
    due_date: Optional[date] = None
    priority: Optional[AlertPriority] = None
    status: Optional[AlertStatus] = None
    is_recurring: Optional[bool] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Conta de Internet Atualizada",
                "description": "Vencimento da conta de internet atualizada",
                "amount": 95.90,
                "priority": "medium",
                "status": "active"
            }
        }
    }


class AlertResponse(BaseModel):
    """Schema for alert response."""
    id: str
    type: AlertType
    title: str
    description: str
    amount: Optional[Decimal]
    due_date: Optional[date]
    priority: AlertPriority
    status: AlertStatus
    is_recurring: bool
    days_until_due: Optional[int]
    is_overdue: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "type": "bill",
                "title": "Conta de Internet",
                "description": "Vencimento da conta de internet",
                "amount": 89.90,
                "due_date": "2025-01-31",
                "priority": "high",
                "status": "active",
                "is_recurring": True,
                "days_until_due": 5,
                "is_overdue": False,
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-15T10:30:00Z"
            }
        }
    }


