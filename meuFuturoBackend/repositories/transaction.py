"""
Transaction repository with fixed SQLAlchemy syntax.

This file contains the corrected version of the transaction repository
with proper func.case syntax for SQLAlchemy.
"""

from typing import Optional, List, Dict, Any
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload

from models.transaction import Transaction, TransactionType
from repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    """Repository for transaction operations with fixed SQLAlchemy syntax."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Transaction, db)
    
    async def get_transaction_summary(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[str] = None,
        category_id: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Get transaction summary for a user with filters.
        
        Args:
            user_id: User ID
            start_date: Start date for calculation
            end_date: End date for calculation
            transaction_type: Filter by transaction type
            category_id: Filter by category
            min_amount: Minimum amount filter
            max_amount: Maximum amount filter
            
        Returns:
            Dictionary with summary statistics
        """
        # Build base query
        base_query = select(Transaction).where(Transaction.user_id == user_id)
        
        # Add date filters if provided
        if start_date:
            base_query = base_query.where(Transaction.transaction_date >= start_date)
        if end_date:
            base_query = base_query.where(Transaction.transaction_date <= end_date)
        
        # Add additional filters
        if transaction_type:
            base_query = base_query.where(Transaction.type == transaction_type)
        if category_id:
            base_query = base_query.where(Transaction.category_id == category_id)
        if min_amount is not None:
            base_query = base_query.where(Transaction.amount >= min_amount)
        if max_amount is not None:
            base_query = base_query.where(Transaction.amount <= max_amount)
        
        # Get all transactions for the user
        result = await self.db.execute(base_query)
        transactions = result.scalars().all()
        
        # Calculate summary statistics
        total_income = float(sum(t.amount for t in transactions if t.type == TransactionType.INCOME))
        total_expenses = float(sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE))
        transaction_count = len(transactions)
        income_count = len([t for t in transactions if t.type == TransactionType.INCOME])
        expense_count = len([t for t in transactions if t.type == TransactionType.EXPENSE])
        
        # Calculate averages and max values
        average_transaction = (total_income + total_expenses) / transaction_count if transaction_count > 0 else 0.0
        
        income_transactions = [t for t in transactions if t.type == TransactionType.INCOME]
        expense_transactions = [t for t in transactions if t.type == TransactionType.EXPENSE]
        
        largest_income = float(max((t.amount for t in income_transactions), default=0))
        largest_expense = float(max((t.amount for t in expense_transactions), default=0))
        
        return {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_amount": total_income - total_expenses,
            "transaction_count": transaction_count,
            "income_count": income_count,
            "expense_count": expense_count,
            "average_transaction": average_transaction,
            "largest_income": largest_income,
            "largest_expense": largest_expense,
        }
    
    async def get_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        transaction_type: Optional[TransactionType] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[Transaction]:
        """
        Get transactions for a user with optional filters.
        
        Args:
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            transaction_type: Filter by transaction type
            start_date: Filter by start date
            end_date: Filter by end date
            
        Returns:
            List of transactions
        """
        query = select(Transaction).where(Transaction.user_id == user_id)
        
        if transaction_type:
            query = query.where(Transaction.type == transaction_type)
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        query = query.order_by(desc(Transaction.transaction_date)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_id(self, transaction_id: str, user_id: str) -> Optional[Transaction]:
        """
        Get a transaction by ID for a specific user with relationships loaded.
        
        Args:
            transaction_id: Transaction ID
            user_id: User ID
            
        Returns:
            Transaction if found, None otherwise
        """
        query = select(Transaction).options(
            selectinload(Transaction.category)
        ).where(
            and_(
                Transaction.id == transaction_id,
                Transaction.user_id == user_id
            )
        )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    # Using the base repository create method which accepts **kwargs
    
    async def update(self, transaction: Transaction) -> Transaction:
        """
        Update an existing transaction.
        
        Args:
            transaction: Transaction to update
            
        Returns:
            Updated transaction
        """
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction
    
    async def delete(self, transaction_id: str, user_id: str) -> bool:
        """
        Delete a transaction.
        
        Args:
            transaction_id: Transaction ID
            user_id: User ID
            
        Returns:
            True if deleted, False otherwise
        """
        query = select(Transaction).where(
            and_(
                Transaction.id == transaction_id,
                Transaction.user_id == user_id
            )
        )
        
        result = await self.db.execute(query)
        transaction = result.scalar_one_or_none()
        
        if transaction:
            await self.db.delete(transaction)
            await self.db.commit()
            return True
        
        return False
    
    async def get_category_summary(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get category summary for a user.
        
        Args:
            user_id: User ID
            start_date: Start date for calculation
            end_date: End date for calculation
            transaction_type: Filter by transaction type (income/expense)
            
        Returns:
            List of category summaries with amounts and counts
        """
        from models.category import Category
        
        # Build base query with joins
        query = (
            select(
                Category.id,
                Category.name,
                func.sum(Transaction.amount).label('total_amount'),
                func.count(Transaction.id).label('transaction_count'),
                func.avg(Transaction.amount).label('average_amount')
            )
            .select_from(Transaction)
            .join(Category, Transaction.category_id == Category.id)
            .where(Transaction.user_id == user_id)
        )
        
        # Add date filters if provided
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        # Add transaction type filter if provided
        if transaction_type:
            query = query.where(Transaction.type == TransactionType(transaction_type))
        
        # Group by category
        query = query.group_by(Category.id, Category.name)
        
        # Order by total amount descending
        query = query.order_by(desc('total_amount'))
        
        result = await self.db.execute(query)
        rows = result.fetchall()
        
        # Calculate total amount for percentage calculation
        total_amount = sum(float(row.total_amount or 0) for row in rows)
        
        # Convert to list of dictionaries
        category_summaries = []
        for row in rows:
            row_total = float(row.total_amount or 0)
            percentage = (row_total / total_amount * 100) if total_amount > 0 else 0.0
            
            category_summaries.append({
                'category_id': str(row.id),
                'category_name': row.name,
                'total_amount': row_total,
                'transaction_count': int(row.transaction_count or 0),
                'percentage': round(percentage, 2)
            })
        
        return category_summaries
    
    async def get_user_transactions(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[str] = None,
        category_id: Optional[str] = None,
        search: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        sort_by: str = "transaction_date",
        sort_order: str = "desc"
    ) -> List[Transaction]:
        """
        Get transactions for a user with pagination and filters.
        
        Args:
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            start_date: Start date filter
            end_date: End date filter
            transaction_type: Transaction type filter
            category_id: Category ID filter
            search: Search term for description
            min_amount: Minimum amount filter
            max_amount: Maximum amount filter
            sort_by: Field to sort by
            sort_order: Sort order (asc/desc)
            
        Returns:
            List of transactions
        """
        from models.category import Category
        
        # Build base query
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.user_id == user_id)
        )
        
        # Add filters
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        if transaction_type:
            query = query.where(Transaction.type == TransactionType(transaction_type))
        if category_id:
            print(f"🔍 DEBUG: Applying category filter: {category_id}")
            query = query.where(Transaction.category_id == category_id)
        if search:
            query = query.where(Transaction.description.ilike(f"%{search}%"))
        if min_amount is not None:
            query = query.where(Transaction.amount >= min_amount)
        if max_amount is not None:
            query = query.where(Transaction.amount <= max_amount)
        
        # Add sorting
        if sort_by == "amount":
            if sort_order == "asc":
                query = query.order_by(asc(Transaction.amount))
            else:
                query = query.order_by(desc(Transaction.amount))
        elif sort_by == "description":
            if sort_order == "asc":
                query = query.order_by(asc(Transaction.description))
            else:
                query = query.order_by(desc(Transaction.description))
        else:  # transaction_date
            if sort_order == "asc":
                query = query.order_by(asc(Transaction.transaction_date))
            else:
                query = query.order_by(desc(Transaction.transaction_date))
        
        # Add pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def count_user_transactions(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[str] = None,
        category_id: Optional[str] = None,
        search: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
    ) -> int:
        """
        Count transactions for a user with filters.
        
        Args:
            user_id: User ID
            start_date: Start date filter
            end_date: End date filter
            transaction_type: Transaction type filter
            category_id: Category ID filter
            search: Search term for description
            min_amount: Minimum amount filter
            max_amount: Maximum amount filter
            
        Returns:
            Number of transactions
        """
        # Build base query
        query = select(func.count(Transaction.id)).where(Transaction.user_id == user_id)
        
        # Add filters
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        if transaction_type:
            query = query.where(Transaction.type == TransactionType(transaction_type))
        if category_id:
            query = query.where(Transaction.category_id == category_id)
        if search:
            query = query.where(Transaction.description.ilike(f"%{search}%"))
        if min_amount is not None:
            query = query.where(Transaction.amount >= min_amount)
        if max_amount is not None:
            query = query.where(Transaction.amount <= max_amount)
        
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def get_monthly_summary(
        self,
        user_id: str,
        year: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get monthly summary for a user.
        
        Args:
            user_id: User ID
            year: Year to get summary for
            start_date: Start date filter
            end_date: End date filter
            
        Returns:
            List of monthly summaries
        """
        # Build base query
        query = (
            select(
                func.extract('month', Transaction.transaction_date).label('month'),
                func.sum(
                    func.case(
                        (Transaction.type == TransactionType.INCOME, Transaction.amount),
                        else_=0
                    )
                ).label('total_income'),
                func.sum(
                    func.case(
                        (Transaction.type == TransactionType.EXPENSE, Transaction.amount),
                        else_=0
                    )
                ).label('total_expenses'),
                func.count(Transaction.id).label('transaction_count')
            )
            .where(Transaction.user_id == user_id)
            .where(func.extract('year', Transaction.transaction_date) == year)
        )
        
        # Add date filters if provided
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        # Group by month
        query = query.group_by(func.extract('month', Transaction.transaction_date))
        
        # Order by month
        query = query.order_by('month')
        
        result = await self.db.execute(query)
        rows = result.fetchall()
        
        # Convert to list of dictionaries
        monthly_summaries = []
        for row in rows:
            monthly_summaries.append({
                'month': int(row.month),
                'total_income': float(row.total_income or 0),
                'total_expenses': float(row.total_expenses or 0),
                'net_amount': float(row.total_income or 0) - float(row.total_expenses or 0),
                'transaction_count': int(row.transaction_count or 0)
            })
        
        return monthly_summaries
    
    async def get_recent_transactions(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Transaction]:
        """
        Get recent transactions for a user.
        
        Args:
            user_id: User ID
            limit: Maximum number of transactions to return
            
        Returns:
            List of recent transactions
        """
        from models.category import Category
        
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.transaction_date), desc(Transaction.created_at))
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        return result.scalars().all()
