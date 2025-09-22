"""
Category-related Pydantic schemas for request/response validation.

Includes schemas for category management and hierarchical categories.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class CategoryBase(BaseModel):
    """Base category schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    description: Optional[str] = Field(None, max_length=1000, description="Category description")
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Hex color code")
    icon: Optional[str] = Field(None, max_length=50, description="Icon identifier")
    type: Optional[str] = Field(None, description="Category type (income/expense)")


class CategoryCreate(CategoryBase):
    """Schema for category creation."""
    
    parent_id: Optional[str] = Field(None, description="Parent category ID for subcategories")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Alimentação",
                "description": "Gastos com comida e bebida",
                "color": "#FF6B6B",
                "icon": "utensils",
                "parent_id": None
            }
        }
    )


class CategoryUpdate(BaseModel):
    """Schema for category updates."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Category name")
    description: Optional[str] = Field(None, max_length=1000, description="Category description")
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Hex color code")
    icon: Optional[str] = Field(None, max_length=50, description="Icon identifier")
    is_active: Optional[bool] = Field(None, description="Whether category is active")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Alimentação e Bebidas",
                "description": "Todos os gastos relacionados a comida e bebida",
                "color": "#FF5722",
                "is_active": True
            }
        }
    )


class CategoryResponse(CategoryBase):
    """Schema for category response."""
    
    id: str = Field(..., description="Unique category identifier")
    is_system: bool = Field(..., description="Whether this is a system category")
    is_active: bool = Field(..., description="Whether category is active")
    user_id: Optional[str] = Field(None, description="Owner user ID (null for system categories)")
    parent_id: Optional[str] = Field(None, description="Parent category ID")
    full_name: str = Field(..., description="Full category name with parent")
    is_subcategory: bool = Field(..., description="Whether this is a subcategory")
    transaction_count: Optional[int] = Field(None, description="Number of transactions in this category")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Restaurantes",
                "description": "Gastos em restaurantes e delivery",
                "color": "#FF6B6B",
                "icon": "restaurant",
                "is_system": False,
                "is_active": True,
                "user_id": "789e0123-e89b-12d3-a456-426614174000",
                "parent_id": "456e7890-e89b-12d3-a456-426614174000",
                "full_name": "Alimentação > Restaurantes",
                "is_subcategory": True,
                "transaction_count": 15,
                "created_at": "2025-01-24T10:00:00Z",
                "updated_at": "2025-01-24T10:00:00Z"
            }
        }
    )


class CategoryWithSubcategories(CategoryResponse):
    """Schema for category response with subcategories."""
    
    subcategories: List["CategoryResponse"] = Field(default_factory=list, description="Subcategories")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "456e7890-e89b-12d3-a456-426614174000",
                "name": "Alimentação",
                "description": "Todos os gastos com comida",
                "color": "#4CAF50",
                "icon": "utensils",
                "is_system": True,
                "is_active": True,
                "user_id": None,
                "parent_id": None,
                "full_name": "Alimentação",
                "is_subcategory": False,
                "transaction_count": 45,
                "subcategories": [
                    {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "name": "Restaurantes",
                        "full_name": "Alimentação > Restaurantes",
                        "is_subcategory": True
                    }
                ],
                "created_at": "2025-01-24T10:00:00Z",
                "updated_at": "2025-01-24T10:00:00Z"
            }
        }
    )


class CategoryStats(BaseModel):
    """Schema for category statistics."""
    
    category_id: str = Field(..., description="Category ID")
    category_name: str = Field(..., description="Category name")
    total_transactions: int = Field(..., ge=0, description="Total number of transactions")
    total_amount: float = Field(..., description="Total amount in this category")
    average_amount: float = Field(..., description="Average transaction amount")
    last_transaction_date: Optional[datetime] = Field(None, description="Date of last transaction")
    percentage_of_total: float = Field(..., ge=0, le=100, description="Percentage of total expenses")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "category_id": "123e4567-e89b-12d3-a456-426614174000",
                "category_name": "Alimentação",
                "total_transactions": 25,
                "total_amount": 1500.00,
                "average_amount": 60.00,
                "last_transaction_date": "2025-01-24T10:00:00Z",
                "percentage_of_total": 35.5
            }
        }
    )


class CategoryBulkOperation(BaseModel):
    """Schema for bulk category operations."""
    
    category_ids: List[str] = Field(..., min_items=1, description="List of category IDs")
    operation: str = Field(..., description="Operation to perform (activate, deactivate, delete)")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "category_ids": [
                    "123e4567-e89b-12d3-a456-426614174000",
                    "456e7890-e89b-12d3-a456-426614174000"
                ],
                "operation": "deactivate"
            }
        }
    )


class SystemCategoriesResponse(BaseModel):
    """Schema for system categories response."""
    
    income_categories: List[CategoryResponse] = Field(..., description="System income categories")
    expense_categories: List[CategoryWithSubcategories] = Field(..., description="System expense categories")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "income_categories": [
                    {
                        "id": "income-salary",
                        "name": "Salário",
                        "description": "Receita de trabalho formal",
                        "is_system": True
                    }
                ],
                "expense_categories": [
                    {
                        "id": "expense-food",
                        "name": "Alimentação",
                        "description": "Gastos com comida",
                        "is_system": True,
                        "subcategories": []
                    }
                ]
            }
        }
    )


# Enable forward references for recursive model
CategoryWithSubcategories.model_rebuild()
