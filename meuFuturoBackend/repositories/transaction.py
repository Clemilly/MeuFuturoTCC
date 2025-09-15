"""
Transaction repository for transaction-specific database operations.

Extends BaseRepository with transaction-specific methods.
"""

from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import select, func, and_, or_, desc, extract
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.transaction import Transaction, TransactionType
from models.category import Category
from repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    """Repository for Transaction model with specific transaction operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Transaction, db)
    
    async def get_by_id(self, id: str) -> Optional[Transaction]:
        """
        Get a single transaction by ID with relationships loaded.
        
        Args:
            id: Transaction ID
            
        Returns:
            Transaction instance or None if not found
        """
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.id == id)
        )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_user_transactions(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        transaction_type: Optional[TransactionType] = None,
        category_id: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        search: Optional[str] = None,
    ) -> List[Transaction]:
        """
        Get user's transactions with filtering.
        
        Args:
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            transaction_type: Filter by transaction type
            category_id: Filter by category
            start_date: Start date for date range filter
            end_date: End date for date range filter
            min_amount: Minimum amount filter
            max_amount: Maximum amount filter
            search: Search in description and notes
            
        Returns:
            List of matching transactions
        """
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.user_id == user_id)
        )
        
        # Apply filters
        if transaction_type:
            query = query.where(Transaction.type == transaction_type)
        
        if category_id:
            query = query.where(Transaction.category_id == category_id)
        
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        if min_amount:
            query = query.where(Transaction.amount >= min_amount)
        
        if max_amount:
            query = query.where(Transaction.amount <= max_amount)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Transaction.description.ilike(search_pattern),
                    Transaction.notes.ilike(search_pattern)
                )
            )
        
        # Order by transaction date (most recent first)
        query = query.order_by(desc(Transaction.transaction_date))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def count_user_transactions(
        self,
        user_id: str,
        transaction_type: Optional[TransactionType] = None,
        category_id: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        search: Optional[str] = None,
    ) -> int:
        """
        Count user's transactions with filtering.
        
        Args:
            user_id: User ID
            transaction_type: Filter by transaction type
            category_id: Filter by category
            start_date: Start date for date range filter
            end_date: End date for date range filter
            min_amount: Minimum amount filter
            max_amount: Maximum amount filter
            search: Search in description and notes
            
        Returns:
            Number of matching transactions
        """
        query = select(func.count(Transaction.id)).where(Transaction.user_id == user_id)
        
        # Apply same filters as get_user_transactions
        if transaction_type:
            query = query.where(Transaction.type == transaction_type)
        
        if category_id:
            query = query.where(Transaction.category_id == category_id)
        
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        if min_amount:
            query = query.where(Transaction.amount >= min_amount)
        
        if max_amount:
            query = query.where(Transaction.amount <= max_amount)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Transaction.description.ilike(search_pattern),
                    Transaction.notes.ilike(search_pattern)
                )
            )
        
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def get_transaction_summary(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Get transaction summary for a user.
        
        Args:
            user_id: User ID
            start_date: Start date for calculation
            end_date: End date for calculation
            
        Returns:
            Dictionary with summary statistics
        """
        query = select(
            func.sum(
                func.case(
                    (Transaction.type == TransactionType.INCOME, Transaction.amount),
                    else_=0
                )
            ).label("total_income"),
            func.sum(
                func.case(
                    (Transaction.type == TransactionType.EXPENSE, Transaction.amount),
                    else_=0
                )
            ).label("total_expenses"),
            func.count(Transaction.id).label("transaction_count"),
            func.count(
                func.case(
                    (Transaction.type == TransactionType.INCOME, Transaction.id),
                    else_=None
                )
            ).label("income_count"),
            func.count(
                func.case(
                    (Transaction.type == TransactionType.EXPENSE, Transaction.id),
                    else_=None
                )
            ).label("expense_count"),
            func.avg(Transaction.amount).label("average_transaction"),
            func.max(
                func.case(
                    (Transaction.type == TransactionType.INCOME, Transaction.amount),
                    else_=0
                )
            ).label("largest_income"),
            func.max(
                func.case(
                    (Transaction.type == TransactionType.EXPENSE, Transaction.amount),
                    else_=0
                )
            ).label("largest_expense"),
        ).where(Transaction.user_id == user_id)
        
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        result = await self.db.execute(query)
        row = result.first()
        
        total_income = row.total_income or Decimal("0.00")
        total_expenses = row.total_expenses or Decimal("0.00")
        net_amount = total_income - total_expenses
        
        return {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_amount": net_amount,
            "transaction_count": row.transaction_count or 0,
            "income_count": row.income_count or 0,
            "expense_count": row.expense_count or 0,
            "average_transaction": row.average_transaction or Decimal("0.00"),
            "largest_income": row.largest_income or Decimal("0.00"),
            "largest_expense": row.largest_expense or Decimal("0.00"),
        }
    
    async def get_category_summary(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[TransactionType] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get category-wise transaction summary.
        
        Args:
            user_id: User ID
            start_date: Start date for calculation
            end_date: End date for calculation
            transaction_type: Filter by transaction type
            
        Returns:
            List of category summaries
        """
        query = (
            select(
                Transaction.category_id,
                Category.name.label("category_name"),
                func.sum(Transaction.amount).label("total_amount"),
                func.count(Transaction.id).label("transaction_count"),
            )
            .outerjoin(Category, Transaction.category_id == Category.id)
            .where(Transaction.user_id == user_id)
            .group_by(Transaction.category_id, Category.name)
            .order_by(func.sum(Transaction.amount).desc())
        )
        
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        if transaction_type:
            query = query.where(Transaction.type == transaction_type)
        
        result = await self.db.execute(query)
        rows = result.all()
        
        # Calculate total for percentage calculation
        total_amount = sum(row.total_amount for row in rows if row.total_amount)
        
        summaries = []
        for row in rows:
            amount = row.total_amount or Decimal("0.00")
            percentage = float(amount / total_amount * 100) if total_amount > 0 else 0.0
            
            summaries.append({
                "category_id": row.category_id,
                "category_name": row.category_name or "Sem categoria",
                "total_amount": amount,
                "transaction_count": row.transaction_count or 0,
                "percentage": round(percentage, 2),
            })
        
        return summaries
    
    async def get_monthly_summary(
        self,
        user_id: str,
        year: int,
        month: int,
    ) -> Dict[str, Any]:
        """
        Get monthly transaction summary.
        
        Args:
            user_id: User ID
            year: Year
            month: Month (1-12)
            
        Returns:
            Monthly summary with category breakdown
        """
        # Get basic summary for the month
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
        
        summary = await self.get_transaction_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Get category breakdown
        categories = await self.get_category_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            transaction_type=TransactionType.EXPENSE
        )
        
        return {
            "year": year,
            "month": month,
            "total_income": summary["total_income"],
            "total_expenses": summary["total_expenses"],
            "net_amount": summary["net_amount"],
            "transaction_count": summary["transaction_count"],
            "categories": categories,
        }
    
    async def get_recent_transactions(
        self,
        user_id: str,
        limit: int = 10,
    ) -> List[Transaction]:
        """
        Get user's most recent transactions.
        
        Args:
            user_id: User ID
            limit: Number of transactions to return
            
        Returns:
            List of recent transactions
        """
        return await self.get_user_transactions(
            user_id=user_id,
            skip=0,
            limit=limit
        )
    
    async def get_transactions_by_date_range(
        self,
        user_id: str,
        start_date: date,
        end_date: date,
    ) -> List[Transaction]:
        """
        Get all transactions within a date range.
        
        Args:
            user_id: User ID
            start_date: Start date
            end_date: End date
            
        Returns:
            List of transactions in date range
        """
        result = await self.db.execute(
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.transaction_date >= start_date,
                    Transaction.transaction_date <= end_date
                )
            )
            .order_by(desc(Transaction.transaction_date))
        )
        
        return list(result.scalars().all())
    
    async def delete_user_transactions(self, user_id: str) -> int:
        """
        Delete all transactions for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Number of deleted transactions
        """
        result = await self.db.execute(
            select(Transaction.id).where(Transaction.user_id == user_id)
        )
        transaction_ids = [row[0] for row in result.all()]
        
        if transaction_ids:
            return await self.bulk_delete(transaction_ids)
        
        return 0
