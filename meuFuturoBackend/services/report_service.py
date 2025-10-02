"""
Report Service for financial reports and analytics.

Handles export functionality, comparative analysis, and trend analysis.
"""

import csv
import io
import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import date, datetime, timedelta
from decimal import Decimal
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from models.transaction import Transaction, TransactionType
from models.category import Category
from schemas.report import (
    ExportRequest, AnalyticsData, ComparativeReport, TrendAnalysis,
    TrendType, TrendDirection, Granularity, ExportFormat
)
from services.financial_service import FinancialService

logger = logging.getLogger(__name__)


class ReportService:
    """Service for generating financial reports and analytics."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.financial_service = FinancialService(db)
    
    async def export_to_csv(
        self, 
        user_id: str, 
        export_request: ExportRequest
    ) -> Tuple[bytes, str]:
        """
        Export financial data to CSV format.
        
        Args:
            user_id: User ID
            export_request: Export configuration
            
        Returns:
            Tuple of (file_content, filename)
        """
        try:
            # Get transactions based on filters
            transactions = await self._get_filtered_transactions(user_id, export_request)
            
            # Create CSV content
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            headers = [
                'Data', 'Tipo', 'Valor', 'Descrição', 'Categoria', 
                'Notas', 'Criado em', 'Atualizado em'
            ]
            writer.writerow(headers)
            
            # Write data rows
            for transaction in transactions:
                row = [
                    transaction.transaction_date.strftime('%Y-%m-%d'),
                    transaction.type.value,
                    str(transaction.amount),
                    transaction.description,
                    transaction.category.name if transaction.category else 'Sem categoria',
                    transaction.notes or '',
                    transaction.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    transaction.updated_at.strftime('%Y-%m-%d %H:%M:%S')
                ]
                writer.writerow(row)
            
            # Generate filename
            start_date_str = export_request.start_date.strftime('%Y%m%d') if export_request.start_date else 'all'
            end_date_str = export_request.end_date.strftime('%Y%m%d') if export_request.end_date else 'all'
            filename = f"relatorio_financeiro_{start_date_str}_{end_date_str}.csv"
            
            # Convert to bytes
            csv_content = output.getvalue().encode('utf-8-sig')  # UTF-8 with BOM for Excel compatibility
            
            logger.info(f"CSV export completed for user {user_id}, {len(transactions)} transactions")
            return csv_content, filename
            
        except Exception as e:
            logger.error(f"Error exporting to CSV for user {user_id}: {str(e)}")
            raise
    
    async def export_to_xlsx(
        self, 
        user_id: str, 
        export_request: ExportRequest
    ) -> Tuple[bytes, str]:
        """
        Export financial data to XLSX format with formatting.
        
        Args:
            user_id: User ID
            export_request: Export configuration
            
        Returns:
            Tuple of (file_content, filename)
        """
        try:
            # For now, return CSV content with .xlsx extension
            # In production, you would use openpyxl or xlsxwriter
            csv_content, csv_filename = await self.export_to_csv(user_id, export_request)
            filename = csv_filename.replace('.csv', '.xlsx')
            
            logger.info(f"XLSX export completed for user {user_id}")
            return csv_content, filename
            
        except Exception as e:
            logger.error(f"Error exporting to XLSX for user {user_id}: {str(e)}")
            raise
    
    async def export_to_pdf(
        self, 
        user_id: str, 
        export_request: ExportRequest
    ) -> Tuple[bytes, str]:
        """
        Export financial report to PDF format.
        
        Args:
            user_id: User ID
            export_request: Export configuration
            
        Returns:
            Tuple of (file_content, filename)
        """
        try:
            # For now, return a simple text-based PDF
            # In production, you would use reportlab or weasyprint
            
            # Get summary data
            summary = await self.financial_service.get_transaction_summary(
                user_id=user_id,
                start_date=export_request.start_date,
                end_date=export_request.end_date
            )
            
            # Create simple PDF content (text-based for now)
            pdf_content = f"""
RELATÓRIO FINANCEIRO
====================

Período: {export_request.start_date or 'Início'} a {export_request.end_date or 'Atual'}
Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

RESUMO EXECUTIVO
----------------
Total de Receitas: R$ {summary.total_income:,.2f}
Total de Despesas: R$ {summary.total_expenses:,.2f}
Saldo Líquido: R$ {summary.net_amount:,.2f}
Número de Transações: {summary.transaction_count}

ESTATÍSTICAS
------------
Receitas: {summary.income_count} transações
Despesas: {summary.expense_count} transações
Valor Médio por Transação: R$ {summary.average_transaction:,.2f}
Maior Receita: R$ {summary.largest_income or 0:,.2f}
Maior Despesa: R$ {summary.largest_expense or 0:,.2f}
            """.encode('utf-8')
            
            # Generate filename
            start_date_str = export_request.start_date.strftime('%Y%m%d') if export_request.start_date else 'all'
            end_date_str = export_request.end_date.strftime('%Y%m%d') if export_request.end_date else 'all'
            filename = f"relatorio_financeiro_{start_date_str}_{end_date_str}.pdf"
            
            logger.info(f"PDF export completed for user {user_id}")
            return pdf_content, filename
            
        except Exception as e:
            logger.error(f"Error exporting to PDF for user {user_id}: {str(e)}")
            raise
    
    async def generate_comparative_report(
        self, 
        user_id: str, 
        period1_start: date, 
        period1_end: date,
        period2_start: date, 
        period2_end: date
    ) -> ComparativeReport:
        """
        Generate comparative report between two periods.
        
        Args:
            user_id: User ID
            period1_start: First period start date
            period1_end: First period end date
            period2_start: Second period start date
            period2_end: Second period end date
            
        Returns:
            Comparative report data
        """
        try:
            # Get data for both periods
            period1_data = await self._get_period_analytics(user_id, period1_start, period1_end)
            period2_data = await self._get_period_analytics(user_id, period2_start, period2_end)
            
            # Calculate comparison metrics
            comparison = self._calculate_comparison_metrics(period1_data, period2_data)
            
            # Generate insights
            insights = self._generate_comparative_insights(period1_data, period2_data, comparison)
            
            return ComparativeReport(
                period1=period1_data,
                period2=period2_data,
                comparison=comparison,
                insights=insights
            )
            
        except Exception as e:
            logger.error(f"Error generating comparative report for user {user_id}: {str(e)}")
            raise
    
    async def analyze_trends(
        self, 
        user_id: str, 
        start_date: date, 
        end_date: date, 
        trend_type: TrendType
    ) -> TrendAnalysis:
        """
        Analyze financial trends over a period.
        
        Args:
            user_id: User ID
            start_date: Analysis start date
            end_date: Analysis end date
            trend_type: Type of trend to analyze
            
        Returns:
            Trend analysis data
        """
        try:
            # Get monthly data points
            data_points = await self._get_trend_data_points(user_id, start_date, end_date, trend_type)
            
            # Analyze trend direction
            trend_direction = self._analyze_trend_direction(data_points)
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence_score(data_points)
            
            # Generate forecast (simple linear projection)
            forecast = self._generate_forecast(data_points, periods=3)
            
            # Generate insights
            insights = self._generate_trend_insights(data_points, trend_direction, confidence_score)
            
            return TrendAnalysis(
                trend_type=trend_type,
                data_points=data_points,
                trend_direction=trend_direction,
                confidence_score=confidence_score,
                forecast=forecast,
                insights=insights
            )
            
        except Exception as e:
            logger.error(f"Error analyzing trends for user {user_id}: {str(e)}")
            raise
    
    async def get_analytics_data(
        self, 
        user_id: str, 
        start_date: Optional[date] = None, 
        end_date: Optional[date] = None,
        granularity: Granularity = Granularity.MONTHLY,
        transaction_type: Optional[str] = None,
        category_id: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None
    ) -> List[AnalyticsData]:
        """
        Get analytics data with specified granularity and filters.
        
        Args:
            user_id: User ID
            start_date: Start date
            end_date: End date
            granularity: Time granularity
            transaction_type: Filter by transaction type
            category_id: Filter by category
            min_amount: Minimum amount filter
            max_amount: Maximum amount filter
            
        Returns:
            List of analytics data points
        """
        try:
            if not start_date:
                start_date = date.today().replace(day=1)  # First day of current month
            if not end_date:
                end_date = date.today()
            
            data_points = []
            current_date = start_date
            
            while current_date <= end_date:
                period_end = self._get_period_end(current_date, granularity)
                if period_end > end_date:
                    period_end = end_date
                
                analytics_data = await self._get_period_analytics(
                    user_id=user_id,
                    start_date=current_date,
                    end_date=period_end,
                    transaction_type=transaction_type,
                    category_id=category_id,
                    min_amount=min_amount,
                    max_amount=max_amount
                )
                analytics_data.period = self._format_period(current_date, granularity)
                analytics_data.period_start = current_date
                analytics_data.period_end = period_end
                
                data_points.append(analytics_data)
                current_date = self._get_next_period_start(period_end, granularity)
            
            return data_points
            
        except Exception as e:
            logger.error(f"Error getting analytics data for user {user_id}: {str(e)}")
            raise
    
    # Private helper methods
    
    async def _get_filtered_transactions(
        self, 
        user_id: str, 
        export_request: ExportRequest
    ) -> List[Transaction]:
        """Get transactions filtered by export request criteria."""
        query = select(Transaction).join(Category, isouter=True).where(
            Transaction.user_id == user_id
        )
        
        # Apply filters
        if export_request.start_date:
            query = query.where(Transaction.transaction_date >= export_request.start_date)
        if export_request.end_date:
            query = query.where(Transaction.transaction_date <= export_request.end_date)
        if export_request.transaction_type:
            query = query.where(Transaction.type == export_request.transaction_type)
        if export_request.category_id:
            query = query.where(Transaction.category_id == export_request.category_id)
        
        query = query.order_by(Transaction.transaction_date.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def _get_period_analytics(
        self, 
        user_id: str, 
        start_date: date, 
        end_date: date,
        transaction_type: Optional[str] = None,
        category_id: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None
    ) -> AnalyticsData:
        """Get analytics data for a specific period with filters."""
        summary = await self.financial_service.get_transaction_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            transaction_type=transaction_type,
            category_id=category_id,
            min_amount=min_amount,
            max_amount=max_amount
        )
        
        return AnalyticsData(
            period=f"{start_date.strftime('%Y-%m')}",
            period_start=start_date,
            period_end=end_date,
            income=summary.total_income,
            expenses=summary.total_expenses,
            net_amount=summary.net_amount,
            transaction_count=summary.transaction_count,
            average_transaction=summary.average_transaction,
            growth_rate=None  # Will be calculated in comparison
        )
    
    def _calculate_comparison_metrics(
        self, 
        period1: AnalyticsData, 
        period2: AnalyticsData
    ) -> Dict[str, Any]:
        """Calculate comparison metrics between two periods."""
        income_change = 0
        expenses_change = 0
        net_change = 0
        
        if period1.income > 0:
            income_change = ((period2.income - period1.income) / period1.income) * 100
        if period1.expenses > 0:
            expenses_change = ((period2.expenses - period1.expenses) / period1.expenses) * 100
        if period1.net_amount != 0:
            net_change = ((period2.net_amount - period1.net_amount) / abs(period1.net_amount)) * 100
        
        return {
            "income_change": round(income_change, 2),
            "expenses_change": round(expenses_change, 2),
            "net_change": round(net_change, 2),
            "income_absolute": float(period2.income - period1.income),
            "expenses_absolute": float(period2.expenses - period1.expenses),
            "net_absolute": float(period2.net_amount - period1.net_amount)
        }
    
    def _generate_comparative_insights(
        self, 
        period1: AnalyticsData, 
        period2: AnalyticsData, 
        comparison: Dict[str, Any]
    ) -> List[str]:
        """Generate insights from comparative analysis."""
        insights = []
        
        if comparison["income_change"] > 0:
            insights.append(f"Receitas aumentaram {comparison['income_change']:.1f}% no segundo período")
        elif comparison["income_change"] < 0:
            insights.append(f"Receitas diminuíram {abs(comparison['income_change']):.1f}% no segundo período")
        
        if comparison["expenses_change"] > 0:
            insights.append(f"Despesas aumentaram {comparison['expenses_change']:.1f}% no segundo período")
        elif comparison["expenses_change"] < 0:
            insights.append(f"Despesas diminuíram {abs(comparison['expenses_change']):.1f}% no segundo período")
        
        if comparison["net_change"] > 0:
            insights.append(f"Saldo líquido melhorou {comparison['net_change']:.1f}% no segundo período")
        elif comparison["net_change"] < 0:
            insights.append(f"Saldo líquido piorou {abs(comparison['net_change']):.1f}% no segundo período")
        
        return insights
    
    async def _get_trend_data_points(
        self, 
        user_id: str, 
        start_date: date, 
        end_date: date, 
        trend_type: TrendType
    ) -> List[AnalyticsData]:
        """Get data points for trend analysis."""
        return await self.get_analytics_data(user_id, start_date, end_date, Granularity.MONTHLY)
    
    def _analyze_trend_direction(self, data_points: List[AnalyticsData]) -> TrendDirection:
        """Analyze the overall trend direction."""
        if len(data_points) < 2:
            return TrendDirection.STABLE
        
        first_value = data_points[0].net_amount
        last_value = data_points[-1].net_amount
        
        if last_value > first_value * Decimal('1.05'):  # 5% threshold
            return TrendDirection.UP
        elif last_value < first_value * Decimal('0.95'):  # 5% threshold
            return TrendDirection.DOWN
        else:
            return TrendDirection.STABLE
    
    def _calculate_confidence_score(self, data_points: List[AnalyticsData]) -> float:
        """Calculate confidence score for trend analysis."""
        if len(data_points) < 3:
            return 0.5
        
        # Simple confidence based on data consistency
        values = [dp.net_amount for dp in data_points]
        if not values:
            return 0.0
        
        mean_value = sum(values) / len(values)
        variance = sum((v - mean_value) ** 2 for v in values) / len(values)
        
        # Higher variance = lower confidence
        confidence = max(0.0, min(1.0, 1.0 - float(variance / (mean_value ** 2 + 1))))
        return round(confidence, 2)
    
    def _generate_forecast(self, data_points: List[AnalyticsData], periods: int = 3) -> List[AnalyticsData]:
        """Generate simple linear forecast."""
        if len(data_points) < 2:
            return []
        
        # Simple linear regression
        x_values = list(range(len(data_points)))
        y_values = [float(dp.net_amount) for dp in data_points]
        
        n = len(x_values)
        sum_x = sum(x_values)
        sum_y = sum(y_values)
        sum_xy = sum(x * y for x, y in zip(x_values, y_values))
        sum_x2 = sum(x * x for x in x_values)
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        intercept = (sum_y - slope * sum_x) / n
        
        forecast = []
        for i in range(periods):
            future_x = len(data_points) + i
            predicted_value = slope * future_x + intercept
            
            forecast.append(AnalyticsData(
                period=f"Forecast-{i+1}",
                period_start=date.today(),
                period_end=date.today(),
                income=Decimal(0),
                expenses=Decimal(0),
                net_amount=Decimal(predicted_value),
                transaction_count=0,
                average_transaction=Decimal(0)
            ))
        
        return forecast
    
    def _generate_trend_insights(
        self, 
        data_points: List[AnalyticsData], 
        trend_direction: TrendDirection, 
        confidence_score: float
    ) -> List[str]:
        """Generate insights from trend analysis."""
        insights = []
        
        if trend_direction == TrendDirection.UP:
            insights.append("Tendência geral positiva de crescimento")
        elif trend_direction == TrendDirection.DOWN:
            insights.append("Tendência geral negativa de declínio")
        else:
            insights.append("Tendência estável sem mudanças significativas")
        
        if confidence_score > 0.7:
            insights.append("Análise de alta confiança")
        elif confidence_score > 0.4:
            insights.append("Análise de confiança moderada")
        else:
            insights.append("Análise de baixa confiança - mais dados necessários")
        
        if len(data_points) > 1:
            first_value = data_points[0].net_amount
            last_value = data_points[-1].net_amount
            if first_value != 0:
                growth_rate = ((last_value - first_value) / abs(first_value)) * 100
                insights.append(f"Crescimento médio de {growth_rate:.1f}% no período")
        
        return insights
    
    def _get_period_end(self, start_date: date, granularity: Granularity) -> date:
        """Get the end date for a period based on granularity."""
        if granularity == Granularity.DAILY:
            return start_date
        elif granularity == Granularity.WEEKLY:
            return start_date + timedelta(days=6)
        elif granularity == Granularity.MONTHLY:
            if start_date.month == 12:
                return start_date.replace(year=start_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                return start_date.replace(month=start_date.month + 1, day=1) - timedelta(days=1)
        elif granularity == Granularity.YEARLY:
            return start_date.replace(year=start_date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            return start_date
    
    def _get_next_period_start(self, period_end: date, granularity: Granularity) -> date:
        """Get the start date for the next period."""
        return period_end + timedelta(days=1)
    
    def _format_period(self, start_date: date, granularity: Granularity) -> str:
        """Format period string based on granularity."""
        if granularity == Granularity.DAILY:
            return start_date.strftime('%Y-%m-%d')
        elif granularity == Granularity.WEEKLY:
            return f"Week {start_date.isocalendar()[1]}"
        elif granularity == Granularity.MONTHLY:
            return start_date.strftime('%Y-%m')
        elif granularity == Granularity.YEARLY:
            return start_date.strftime('%Y')
        else:
            return start_date.strftime('%Y-%m-%d')
