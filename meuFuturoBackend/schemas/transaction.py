"""
Transaction-related Pydantic schemas for request/response validation.

Includes schemas for transaction management, filtering, and summaries.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from models.transaction import TransactionType


class TransactionBase(BaseModel):
    """Base transaction schema with common fields."""
    
    type: TransactionType = Field(..., description="Transaction type (income/expense)")
    amount: Decimal = Field(..., gt=0, description="Transaction amount (positive value)")
    description: str = Field(..., min_length=1, max_length=255, description="Transaction description")
    transaction_date: date = Field(..., description="Date when transaction occurred")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional additional notes")
    category_id: Optional[str] = Field(None, description="Category ID")


class TransactionCreate(TransactionBase):
    """Schema for transaction creation."""
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "type": "expense",
                "amount": 150.00,
                "description": "Compra no supermercado",
                "transaction_date": "2025-01-24",
                "notes": "Compras da semana",
                "category_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }
    )


class TransactionUpdate(BaseModel):
    """Schema for transaction updates."""
    
    type: Optional[TransactionType] = Field(None, description="Transaction type")
    amount: Optional[Decimal] = Field(None, gt=0, description="Transaction amount")
    description: Optional[str] = Field(None, min_length=1, max_length=255, description="Transaction description")
    transaction_date: Optional[date] = Field(None, description="Transaction date")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")
    category_id: Optional[str] = Field(None, description="Category ID")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "amount": 180.00,
                "description": "Compra no supermercado - atualizada",
                "notes": "Compras da semana + produtos de limpeza"
            }
        }
    )


class CategoryInfo(BaseModel):
    """Schema for category information in transaction response."""
    
    id: str = Field(..., description="Category ID")
    name: str = Field(..., description="Category name")
    color: Optional[str] = Field(None, description="Category color")
    type: Optional[str] = Field(None, description="Category type")
    
    model_config = ConfigDict(from_attributes=True)


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""
    
    id: str = Field(..., description="Unique transaction identifier")
    user_id: str = Field(..., description="Owner of the transaction")
    category: Optional[CategoryInfo] = Field(None, description="Category information")
    category_name: Optional[str] = Field(None, description="Category name (deprecated, use category.name)")
    signed_amount: Decimal = Field(..., description="Signed amount (negative for expenses)")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "type": "expense",
                "amount": 150.00,
                "signed_amount": -150.00,
                "description": "Compra no supermercado",
                "transaction_date": "2025-01-24",
                "notes": "Compras da semana",
                "category_id": "456e7890-e89b-12d3-a456-426614174000",
                "category": {
                    "id": "456e7890-e89b-12d3-a456-426614174000",
                    "name": "Alimentação",
                    "color": "#ef4444",
                    "type": "expense"
                },
                "category_name": "Alimentação",
                "user_id": "789e0123-e89b-12d3-a456-426614174000",
                "created_at": "2025-01-24T10:00:00Z",
                "updated_at": "2025-01-24T10:00:00Z"
            }
        }
    )


class TransactionFilter(BaseModel):
    """Schema for transaction filtering."""
    
    type: Optional[TransactionType] = Field(None, description="Filter by transaction type")
    category_id: Optional[str] = Field(None, description="Filter by category")
    start_date: Optional[date] = Field(None, description="Start date for date range")
    end_date: Optional[date] = Field(None, description="End date for date range")
    min_amount: Optional[Decimal] = Field(None, ge=0, description="Minimum amount")
    max_amount: Optional[Decimal] = Field(None, ge=0, description="Maximum amount")
    search: Optional[str] = Field(None, max_length=255, description="Search in description and notes")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "type": "expense",
                "category_id": "456e7890-e89b-12d3-a456-426614174000",
                "start_date": "2025-01-01",
                "end_date": "2025-01-31",
                "min_amount": 50.00,
                "max_amount": 500.00,
                "search": "supermercado"
            }
        }
    )


class TransactionSummary(BaseModel):
    """Schema for transaction summary/statistics."""
    
    total_income: Decimal = Field(..., description="Total income amount")
    total_expenses: Decimal = Field(..., description="Total expenses amount")
    net_amount: Decimal = Field(..., description="Net amount (income - expenses)")
    transaction_count: int = Field(..., ge=0, description="Total number of transactions")
    income_count: int = Field(..., ge=0, description="Number of income transactions")
    expense_count: int = Field(..., ge=0, description="Number of expense transactions")
    average_transaction: Decimal = Field(..., description="Average transaction amount")
    largest_income: Optional[Decimal] = Field(None, description="Largest income transaction")
    largest_expense: Optional[Decimal] = Field(None, description="Largest expense transaction")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_income": 5000.00,
                "total_expenses": 3200.00,
                "net_amount": 1800.00,
                "transaction_count": 45,
                "income_count": 3,
                "expense_count": 42,
                "average_transaction": 182.22,
                "largest_income": 4000.00,
                "largest_expense": 800.00
            }
        }
    )


class TransactionStats(BaseModel):
    """Schema for transaction statistics (frontend format)."""
    
    total_income: float = Field(..., description="Total income amount")
    total_expenses: float = Field(..., description="Total expenses amount")
    net_amount: float = Field(..., description="Net amount (income - expenses)")
    transaction_count: int = Field(..., ge=0, description="Total number of transactions")
    average_transaction: float = Field(..., description="Average transaction amount")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_income": 5000.00,
                "total_expenses": 3200.00,
                "net_amount": 1800.00,
                "transaction_count": 45,
                "average_transaction": 182.22
            }
        }
    )


class PaginationInfo(BaseModel):
    """Schema for pagination information."""
    
    current_page: int = Field(..., ge=1, description="Current page number")
    page_size: int = Field(..., ge=1, le=100, description="Number of items per page")
    total_items: int = Field(..., ge=0, description="Total number of items")
    total_pages: int = Field(..., ge=0, description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_previous: bool = Field(..., description="Whether there is a previous page")
    next_page: Optional[int] = Field(None, description="Next page number")
    previous_page: Optional[int] = Field(None, description="Previous page number")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "current_page": 1,
                "page_size": 20,
                "total_items": 100,
                "total_pages": 5,
                "has_next": True,
                "has_previous": False,
                "next_page": 2,
                "previous_page": None
            }
        }
    )


class PaginatedTransactionResponse(BaseModel):
    """Schema for paginated transaction response."""
    
    items: List[TransactionResponse] = Field(..., description="List of transactions")
    total: int = Field(..., ge=0, description="Total number of transactions")
    page: int = Field(..., ge=1, description="Current page number")
    size: int = Field(..., ge=1, le=100, description="Number of items per page")
    pages: int = Field(..., ge=0, description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_previous: bool = Field(..., description="Whether there is a previous page")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [],
                "total": 100,
                "page": 1,
                "size": 20,
                "pages": 5,
                "has_next": True,
                "has_previous": False
            }
        }
    )


class CategorySummary(BaseModel):
    """Schema for category-wise transaction summary."""
    
    category_id: Optional[str] = Field(None, description="Category ID")
    category_name: str = Field(..., description="Category name")
    total_amount: Decimal = Field(..., description="Total amount for this category")
    transaction_count: int = Field(..., ge=0, description="Number of transactions")
    percentage: float = Field(..., ge=0, le=100, description="Percentage of total expenses")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "category_id": "456e7890-e89b-12d3-a456-426614174000",
                "category_name": "Alimentação",
                "total_amount": 1200.00,
                "transaction_count": 15,
                "percentage": 37.5
            }
        }
    )


class MonthlySummary(BaseModel):
    """Schema for monthly transaction summary."""
    
    year: int = Field(..., description="Year")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    total_income: Decimal = Field(..., description="Total income for the month")
    total_expenses: Decimal = Field(..., description="Total expenses for the month")
    net_amount: Decimal = Field(..., description="Net amount for the month")
    transaction_count: int = Field(..., ge=0, description="Number of transactions")
    categories: List[CategorySummary] = Field(..., description="Category breakdown")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "year": 2025,
                "month": 1,
                "total_income": 5000.00,
                "total_expenses": 3200.00,
                "net_amount": 1800.00,
                "transaction_count": 45,
                "categories": [
                    {
                        "category_id": "456e7890-e89b-12d3-a456-426614174000",
                        "category_name": "Alimentação",
                        "total_amount": 1200.00,
                        "transaction_count": 15,
                        "percentage": 37.5
                    }
                ]
            }
        }
    )


class TransactionImport(BaseModel):
    """Schema for bulk transaction import."""
    
    file_format: str = Field(..., description="File format (csv, xlsx, ofx)")
    transactions: List[TransactionCreate] = Field(..., description="List of transactions to import")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "file_format": "csv",
                "transactions": [
                    {
                        "type": "expense",
                        "amount": 150.00,
                        "description": "Compra no supermercado",
                        "transaction_date": "2025-01-24",
                        "category_id": "456e7890-e89b-12d3-a456-426614174000"
                    }
                ]
            }
        }
    )


class TransactionExport(BaseModel):
    """Schema for transaction export parameters."""
    
    format: str = Field("csv", description="Export format (csv, xlsx, pdf)")
    filters: Optional[TransactionFilter] = Field(None, description="Filters to apply")
    include_categories: bool = Field(True, description="Include category information")
    include_summary: bool = Field(True, description="Include summary statistics")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "format": "xlsx",
                "filters": {
                    "start_date": "2025-01-01",
                    "end_date": "2025-01-31"
                },
                "include_categories": True,
                "include_summary": True
            }
        }
    )
