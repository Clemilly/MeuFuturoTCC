"""
Report-related Pydantic schemas for financial reports and analytics.

Includes schemas for export requests, analytics data, comparative reports, and trend analysis.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from models.transaction import TransactionType


class ExportFormat(str, Enum):
    """Supported export formats."""
    CSV = "csv"
    XLSX = "xlsx"
    PDF = "pdf"


class Granularity(str, Enum):
    """Time granularity for analytics."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class TrendType(str, Enum):
    """Types of financial trends."""
    NET_WORTH = "net_worth"
    INCOME = "income"
    EXPENSES = "expenses"
    SAVINGS = "savings"


class TrendDirection(str, Enum):
    """Trend direction indicators."""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class ExportRequest(BaseModel):
    """Schema for export request."""
    
    format: ExportFormat = Field(..., description="Export format")
    start_date: Optional[date] = Field(None, description="Start date for data range")
    end_date: Optional[date] = Field(None, description="End date for data range")
    transaction_type: Optional[TransactionType] = Field(None, description="Filter by transaction type")
    category_id: Optional[str] = Field(None, description="Filter by category ID")
    include_charts: bool = Field(False, description="Include charts in PDF export")
    include_summary: bool = Field(True, description="Include summary statistics")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "format": "xlsx",
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "transaction_type": "expense",
                "category_id": "123e4567-e89b-12d3-a456-426614174000",
                "include_charts": True,
                "include_summary": True
            }
        }
    )


class AnalyticsData(BaseModel):
    """Schema for analytics data point."""
    
    period: str = Field(..., description="Time period identifier")
    period_start: date = Field(..., description="Period start date")
    period_end: date = Field(..., description="Period end date")
    income: Decimal = Field(..., description="Total income for period")
    expenses: Decimal = Field(..., description="Total expenses for period")
    net_amount: Decimal = Field(..., description="Net amount (income - expenses)")
    transaction_count: int = Field(..., ge=0, description="Number of transactions")
    average_transaction: Decimal = Field(..., description="Average transaction amount")
    growth_rate: Optional[float] = Field(None, description="Growth rate compared to previous period")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "period": "2024-01",
                "period_start": "2024-01-01",
                "period_end": "2024-01-31",
                "income": 5000.00,
                "expenses": 3200.00,
                "net_amount": 1800.00,
                "transaction_count": 45,
                "average_transaction": 111.11,
                "growth_rate": 5.2
            }
        }
    )


class ComparativeReport(BaseModel):
    """Schema for comparative report between two periods."""
    
    period1: AnalyticsData = Field(..., description="First period data")
    period2: AnalyticsData = Field(..., description="Second period data")
    comparison: Dict[str, Any] = Field(..., description="Comparison metrics")
    insights: List[str] = Field(..., description="Generated insights")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "period1": {
                    "period": "2024-01",
                    "income": 5000.00,
                    "expenses": 3200.00,
                    "net_amount": 1800.00
                },
                "period2": {
                    "period": "2024-02",
                    "income": 5200.00,
                    "expenses": 3100.00,
                    "net_amount": 2100.00
                },
                "comparison": {
                    "income_change": 4.0,
                    "expenses_change": -3.1,
                    "net_change": 16.7
                },
                "insights": [
                    "Receitas aumentaram 4% em fevereiro",
                    "Despesas diminuíram 3.1% em fevereiro",
                    "Saldo líquido melhorou 16.7%"
                ]
            }
        }
    )


class TrendAnalysis(BaseModel):
    """Schema for trend analysis."""
    
    trend_type: TrendType = Field(..., description="Type of trend analyzed")
    data_points: List[AnalyticsData] = Field(..., description="Historical data points")
    trend_direction: TrendDirection = Field(..., description="Overall trend direction")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence in trend analysis")
    forecast: Optional[List[AnalyticsData]] = Field(None, description="Forecasted data points")
    insights: List[str] = Field(..., description="Trend insights")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "trend_type": "net_worth",
                "data_points": [
                    {"period": "2024-01", "net_amount": 1800.00},
                    {"period": "2024-02", "net_amount": 2100.00},
                    {"period": "2024-03", "net_amount": 1950.00}
                ],
                "trend_direction": "up",
                "confidence_score": 0.75,
                "forecast": [
                    {"period": "2024-04", "net_amount": 2200.00},
                    {"period": "2024-05", "net_amount": 2350.00}
                ],
                "insights": [
                    "Tendência geral positiva de crescimento",
                    "Crescimento médio de 8.3% ao mês"
                ]
            }
        }
    )


class ReportFilters(BaseModel):
    """Schema for report filtering options."""
    
    start_date: Optional[date] = Field(None, description="Start date filter")
    end_date: Optional[date] = Field(None, description="End date filter")
    transaction_type: Optional[TransactionType] = Field(None, description="Transaction type filter")
    category_ids: Optional[List[str]] = Field(None, description="Category IDs filter")
    min_amount: Optional[Decimal] = Field(None, description="Minimum amount filter")
    max_amount: Optional[Decimal] = Field(None, description="Maximum amount filter")
    granularity: Granularity = Field(Granularity.MONTHLY, description="Time granularity")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "transaction_type": "expense",
                "category_ids": ["cat1", "cat2"],
                "min_amount": 10.00,
                "max_amount": 1000.00,
                "granularity": "monthly"
            }
        }
    )


class ExportResponse(BaseModel):
    """Schema for export response."""
    
    filename: str = Field(..., description="Generated filename")
    content_type: str = Field(..., description="MIME type of exported file")
    size_bytes: int = Field(..., description="File size in bytes")
    download_url: Optional[str] = Field(None, description="Temporary download URL")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "filename": "financial_report_2024.xlsx",
                "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "size_bytes": 245760,
                "download_url": "/api/v1/financial/reports/download/temp_token_123"
            }
        }
    )

