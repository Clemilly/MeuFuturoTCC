"""
Financial service for transaction and category management.

Handles financial operations, reporting, and analysis.
"""

from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import structlog

from repositories.transaction import TransactionRepository
from repositories.category import CategoryRepository
from repositories.user import UserRepository
from schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionFilter,
    TransactionSummary,
    CategorySummary,
    MonthlySummary,
)
from schemas.category import CategoryCreate, CategoryUpdate
from models.transaction import Transaction, TransactionType
from models.category import Category
from core.config import settings

logger = structlog.get_logger()


class FinancialService:
    """Service for financial operations and analysis."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_repo = TransactionRepository(db)
        self.category_repo = CategoryRepository(db)
        self.user_repo = UserRepository(db)
    
    # Transaction Operations
    
    async def create_transaction(
        self, 
        user_id: str, 
        transaction_data: TransactionCreate
    ) -> Transaction:
        """
        Create a new transaction.
        
        Args:
            user_id: User ID
            transaction_data: Transaction creation data
            
        Returns:
            Created transaction instance
            
        Raises:
            HTTPException: If validation fails
        """
        # Validate user exists
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Validate category if provided
        if transaction_data.category_id:
            logger.info(
                "Validating category for transaction creation",
                user_id=user_id,
                category_id=transaction_data.category_id
            )
            category = await self.category_repo.get_by_id(transaction_data.category_id)
            if not category:
                logger.warning(
                    "Category not found for transaction creation",
                    user_id=user_id,
                    category_id=transaction_data.category_id
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria não encontrada. Verifique se a categoria existe e está disponível."
                )
            logger.info(
                "Category validation successful",
                user_id=user_id,
                category_id=transaction_data.category_id,
                category_name=category.name
            )
            
            # Check if user has access to this category
            if not category.is_system and category.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Acesso negado à categoria"
                )
        
        # Validate amount limits
        if transaction_data.amount > settings.MAX_TRANSACTION_AMOUNT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Valor máximo permitido: {settings.MAX_TRANSACTION_AMOUNT}"
            )
        
        if transaction_data.amount < settings.MIN_TRANSACTION_AMOUNT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Valor mínimo permitido: {settings.MIN_TRANSACTION_AMOUNT}"
            )
        
        # Create transaction
        transaction = await self.transaction_repo.create(
            user_id=user_id,
            type=transaction_data.type,
            amount=transaction_data.amount,
            description=transaction_data.description,
            transaction_date=transaction_data.transaction_date,
            notes=transaction_data.notes,
            category_id=transaction_data.category_id,
        )
        
        # Commit the transaction
        await self.transaction_repo.db.commit()
        
        # Reload the transaction with its relationships to avoid DetachedInstanceError
        transaction = await self.transaction_repo.get_by_id(transaction.id, user_id)
        
        logger.info(
            "Transaction created",
            user_id=user_id,
            transaction_id=transaction.id,
            type=transaction.type,
            amount=float(transaction.amount)
        )
        
        return transaction
    
    async def get_user_transactions(
        self,
        user_id: str,
        filters: Optional[TransactionFilter] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[List[Transaction], int]:
        """
        Get user's transactions with filtering and pagination.
        
        Args:
            user_id: User ID
            filters: Transaction filters
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            Tuple of (transactions, total_count)
        """
        # Prepare filter parameters
        filter_params = {}
        if filters:
            print(f"DEBUG: Processing filters: {filters}")
            if filters.type:
                filter_params["transaction_type"] = filters.type
            if filters.category_id:
                print(f"DEBUG: Category filter found: {filters.category_id}")
                filter_params["category_id"] = filters.category_id
            if filters.start_date:
                filter_params["start_date"] = filters.start_date
            if filters.end_date:
                filter_params["end_date"] = filters.end_date
            if filters.min_amount:
                filter_params["min_amount"] = filters.min_amount
            if filters.max_amount:
                filter_params["max_amount"] = filters.max_amount
            if filters.search:
                filter_params["search"] = filters.search
        
        print(f"DEBUG: Final filter_params: {filter_params}")
        
        # Get transactions and count
        transactions = await self.transaction_repo.get_user_transactions(
            user_id=user_id,
            skip=skip,
            limit=limit,
            **filter_params
        )
        
        total_count = await self.transaction_repo.count_user_transactions(
            user_id=user_id,
            **filter_params
        )
        
        return transactions, total_count
    
    async def get_transaction_by_id(self, user_id: str, transaction_id: str) -> Transaction:
        """
        Get a specific transaction by ID.
        
        Args:
            user_id: User ID
            transaction_id: Transaction ID
            
        Returns:
            Transaction instance
            
        Raises:
            HTTPException: If transaction not found or access denied
        """
        transaction = await self.transaction_repo.get_by_id(transaction_id, user_id)
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transação não encontrada"
            )
        
        if transaction.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado à transação"
            )
        
        return transaction
    
    async def update_transaction(
        self,
        user_id: str,
        transaction_id: str,
        update_data: TransactionUpdate,
    ) -> Transaction:
        """
        Update a transaction.
        
        Args:
            user_id: User ID
            transaction_id: Transaction ID
            update_data: Update data
            
        Returns:
            Updated transaction instance
            
        Raises:
            HTTPException: If transaction not found or validation fails
        """
        # Get and validate transaction
        transaction = await self.get_transaction_by_id(user_id, transaction_id)
        
        # Validate category if provided
        if update_data.category_id:
            category = await self.category_repo.get_by_id(update_data.category_id)
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoria não encontrada"
                )
            
            if not category.is_system and category.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Acesso negado à categoria"
                )
        
        # Validate amount if provided
        if update_data.amount:
            if update_data.amount > settings.MAX_TRANSACTION_AMOUNT:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Valor máximo permitido: {settings.MAX_TRANSACTION_AMOUNT}"
                )
            
            if update_data.amount < settings.MIN_TRANSACTION_AMOUNT:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Valor mínimo permitido: {settings.MIN_TRANSACTION_AMOUNT}"
                )
        
        # Prepare update data
        update_fields = {}
        if update_data.type is not None:
            update_fields["type"] = update_data.type
        if update_data.amount is not None:
            update_fields["amount"] = update_data.amount
        if update_data.description is not None:
            update_fields["description"] = update_data.description
        if update_data.transaction_date is not None:
            update_fields["transaction_date"] = update_data.transaction_date
        if update_data.notes is not None:
            update_fields["notes"] = update_data.notes
        if update_data.category_id is not None:
            update_fields["category_id"] = update_data.category_id
        
        # Update transaction
        updated_transaction = await self.transaction_repo.update(
            transaction_id, **update_fields
        )
        
        logger.info(
            "Transaction updated",
            user_id=user_id,
            transaction_id=transaction_id,
            fields=list(update_fields.keys())
        )
        
        return updated_transaction
    
    async def delete_transaction(self, user_id: str, transaction_id: str) -> bool:
        """
        Delete a transaction.
        
        Args:
            user_id: User ID
            transaction_id: Transaction ID
            
        Returns:
            True if deleted successfully
            
        Raises:
            HTTPException: If transaction not found or access denied
        """
        # Get and validate transaction
        await self.get_transaction_by_id(user_id, transaction_id)
        
        # Delete transaction
        deleted = await self.transaction_repo.delete(transaction_id)
        
        if deleted:
            logger.info(
                "Transaction deleted",
                user_id=user_id,
                transaction_id=transaction_id
            )
        
        return deleted
    
    # Category Operations
    
    async def create_category(
        self, 
        user_id: str, 
        category_data: CategoryCreate
    ) -> Category:
        """
        Create a new category.
        
        Args:
            user_id: User ID
            category_data: Category creation data
            
        Returns:
            Created category instance
            
        Raises:
            HTTPException: If validation fails
        """
        # Check if category name already exists
        if await self.category_repo.category_name_exists(
            category_data.name, user_id, parent_id=category_data.parent_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categoria com este nome já existe"
            )
        
        # Validate parent category if provided
        if category_data.parent_id:
            parent_category = await self.category_repo.get_by_id(category_data.parent_id)
            if not parent_category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoria pai não encontrada"
                )
            
            # Check if user has access to parent category
            if not parent_category.is_system and parent_category.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Acesso negado à categoria pai"
                )
        
        # Create category
        category = await self.category_repo.create(
            user_id=user_id,
            name=category_data.name,
            description=category_data.description,
            color=category_data.color,
            icon=category_data.icon,
            parent_id=category_data.parent_id,
            is_system=False,
            is_active=True,
        )
        
        logger.info(
            "Category created",
            user_id=user_id,
            category_id=category.id,
            name=category.name
        )
        
        return category
    
    async def get_user_categories(
        self,
        user_id: str,
        include_system: bool = True,
        include_subcategories: bool = False,
    ) -> List[Category]:
        """
        Get categories available to a user.
        
        Args:
            user_id: User ID
            include_system: Whether to include system categories
            include_subcategories: Whether to load subcategories
            
        Returns:
            List of categories
        """
        if include_subcategories:
            return await self.category_repo.get_categories_with_subcategories(
                user_id, include_system
            )
        else:
            return await self.category_repo.get_user_categories(
                user_id, include_system
            )
    
    async def get_category_by_id(
        self,
        user_id: str,
        category_id: str,
    ) -> Category:
        """
        Get a specific category by ID.
        
        Args:
            user_id: User ID
            category_id: Category ID
            
        Returns:
            Category instance
            
        Raises:
            HTTPException: If category not found or access denied
        """
        category = await self.category_repo.get_by_id(category_id)
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )
        
        # Check if user has access to this category
        if not category.is_system and category.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado à categoria"
            )
        
        return category
    
    async def get_transaction_stats(
        self,
        user_id: str,
        filters: Optional[TransactionFilter] = None,
    ) -> Dict[str, Any]:
        """
        Get transaction statistics for a user.
        
        Args:
            user_id: User ID
            filters: Optional filters to apply
            
        Returns:
            Dictionary with transaction statistics
        """
        # Prepare filter parameters
        filter_params = {}
        if filters:
            if filters.type:
                filter_params["transaction_type"] = filters.type
            if filters.category_id:
                filter_params["category_id"] = filters.category_id
            if filters.start_date:
                filter_params["start_date"] = filters.start_date
            if filters.end_date:
                filter_params["end_date"] = filters.end_date
            if filters.min_amount:
                filter_params["min_amount"] = filters.min_amount
            if filters.max_amount:
                filter_params["max_amount"] = filters.max_amount
            if filters.search:
                filter_params["search"] = filters.search
        
        # Get summary from repository
        summary = await self.transaction_repo.get_transaction_summary(
            user_id=user_id,
            **filter_params
        )
        
        # Convert to frontend format
        return {
            "total_income": float(summary["total_income"]),
            "total_expenses": float(summary["total_expenses"]),
            "net_amount": float(summary["net_amount"]),
            "transaction_count": summary["transaction_count"],
            "average_transaction": float(summary["average_transaction"]),
        }
    
    async def get_paginated_transactions(
        self,
        user_id: str,
        page: int = 1,
        size: int = 20,
        filters: Optional[TransactionFilter] = None,
        sort_by: str = "transaction_date",
        sort_order: str = "desc",
    ) -> Dict[str, Any]:
        """
        Get paginated transactions for a user.
        
        Args:
            user_id: User ID
            page: Page number (1-based)
            size: Number of items per page
            filters: Optional filters to apply
            sort_by: Field to sort by
            sort_order: Sort order (asc/desc)
            
        Returns:
            Dictionary with paginated transactions and metadata
        """
        # Calculate skip
        skip = (page - 1) * size
        
        # Get transactions and count
        transactions, total_count = await self.get_user_transactions(
            user_id=user_id,
            filters=filters,
            skip=skip,
            limit=size
        )
        
        # Calculate pagination info
        total_pages = (total_count + size - 1) // size
        has_next = page < total_pages
        has_previous = page > 1
        
        return {
            "items": transactions,
            "total": total_count,
            "page": page,
            "size": size,
            "pages": total_pages,
            "has_next": has_next,
            "has_previous": has_previous,
        }
    
    async def update_category(
        self,
        user_id: str,
        category_id: str,
        update_data: CategoryUpdate,
    ) -> Category:
        """
        Update a category.
        
        Args:
            user_id: User ID
            category_id: Category ID
            update_data: Update data
            
        Returns:
            Updated category instance
            
        Raises:
            HTTPException: If category not found or validation fails
        """
        category = await self.category_repo.get_by_id(category_id)
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )
        
        # Check permissions
        if category.is_system:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não é possível editar categorias do sistema"
            )
        
        if category.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado à categoria"
            )
        
        # Check name uniqueness if name is being updated
        if update_data.name and update_data.name != category.name:
            if await self.category_repo.category_name_exists(
                update_data.name, user_id, exclude_category_id=category_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria com este nome já existe"
                )
        
        # Prepare update data
        update_fields = {}
        if update_data.name is not None:
            update_fields["name"] = update_data.name
        if update_data.description is not None:
            update_fields["description"] = update_data.description
        if update_data.color is not None:
            update_fields["color"] = update_data.color
        if update_data.icon is not None:
            update_fields["icon"] = update_data.icon
        if update_data.is_active is not None:
            update_fields["is_active"] = update_data.is_active
        
        # Update category
        updated_category = await self.category_repo.update(
            category_id, **update_fields
        )
        
        logger.info(
            "Category updated",
            user_id=user_id,
            category_id=category_id,
            fields=list(update_fields.keys())
        )
        
        return updated_category
    
    async def delete_category(self, user_id: str, category_id: str) -> bool:
        """
        Delete a category.
        
        Args:
            user_id: User ID
            category_id: Category ID
            
        Returns:
            True if deleted successfully
            
        Raises:
            HTTPException: If category cannot be deleted
        """
        if not await self.category_repo.can_delete_category(category_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não é possível excluir esta categoria"
            )
        
        # Check if category has transactions
        transaction_count = await self.transaction_repo.count_user_transactions(
            user_id=user_id,
            category_id=category_id
        )
        
        if transaction_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir categoria com transações associadas"
            )
        
        # Delete category
        deleted = await self.category_repo.delete(category_id)
        
        if deleted:
            logger.info(
                "Category deleted",
                user_id=user_id,
                category_id=category_id
            )
        
        return deleted
    
    # Financial Analysis and Reporting
    
    async def get_transaction_summary(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[str] = None,
        category_id: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None
    ) -> TransactionSummary:
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
            Transaction summary
        """
        summary_data = await self.transaction_repo.get_transaction_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            transaction_type=transaction_type,
            category_id=category_id,
            min_amount=min_amount,
            max_amount=max_amount
        )
        
        return TransactionSummary(**summary_data)
    
    async def get_category_summary(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[TransactionType] = None,
    ) -> List[CategorySummary]:
        """
        Get category-wise spending summary.
        
        Args:
            user_id: User ID
            start_date: Start date for calculation
            end_date: End date for calculation
            transaction_type: Filter by transaction type
            
        Returns:
            List of category summaries
        """
        summary_data = await self.transaction_repo.get_category_summary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            transaction_type=transaction_type
        )
        
        return [CategorySummary(**data) for data in summary_data]
    
    async def get_monthly_summary(
        self,
        user_id: str,
        year: int,
        month: int,
    ) -> MonthlySummary:
        """
        Get monthly financial summary.
        
        Args:
            user_id: User ID
            year: Year
            month: Month (1-12)
            
        Returns:
            Monthly summary
        """
        summary_data = await self.transaction_repo.get_monthly_summary(
            user_id=user_id,
            year=year,
            month=month
        )
        
        # Convert categories to CategorySummary objects
        categories = [CategorySummary(**cat) for cat in summary_data["categories"]]
        summary_data["categories"] = categories
        
        return MonthlySummary(**summary_data)
    
    async def get_financial_overview(self, user_id: str) -> Dict[str, Any]:
        """
        Get comprehensive financial overview for dashboard.
        
        Args:
            user_id: User ID
            
        Returns:
            Financial overview data
        """
        # Get current month summary
        today = date.today()
        current_month = await self.get_monthly_summary(
            user_id=user_id,
            year=today.year,
            month=today.month
        )
        
        # Get recent transactions
        recent_transactions = await self.transaction_repo.get_recent_transactions(
            user_id=user_id,
            limit=5
        )
        
        # Get overall summary
        overall_summary = await self.get_transaction_summary(user_id=user_id)
        
        # Get previous month for comparison
        from datetime import timedelta
        prev_month = today.replace(day=1) - timedelta(days=1)
        previous_month = await self.get_monthly_summary(
            user_id=user_id,
            year=prev_month.year,
            month=prev_month.month
        )
        
        # Get financial goals
        try:
            from services.goal_service import GoalService
            goal_service = GoalService(self.db)
            goals = await goal_service.get_user_goals(user_id)
        except Exception as e:
            logger.warning(f"Error loading goals: {e}")
            goals = []
        
        # Get financial alerts
        try:
            from services.alert_service import AlertService
            alert_service = AlertService(self.db)
            alerts = await alert_service.get_user_alerts(user_id)
        except Exception as e:
            logger.warning(f"Error loading alerts: {e}")
            alerts = []
        
        # Get AI insights
        try:
            from services.ai_service import AIService
            ai_service = AIService(self.db)
            insights = await ai_service.get_financial_insights(user_id)
        except Exception as e:
            logger.warning(f"Error loading AI insights: {e}")
            insights = {
                "health_score": 0,
                "health_label": "Indisponível",
                "risk_level": "low",
                "monthly_trend": "stable",
                "recommendations": []
            }
        
        # Calculate health score
        health_score = self._calculate_health_score(
            current_month, previous_month, goals, overall_summary
        )
        
        # Calculate trends
        trends = self._calculate_trends(current_month, previous_month)
        
        return {
            "current_balance": float(overall_summary.net_amount),
            "monthly_income": float(current_month.total_income),
            "monthly_expenses": float(current_month.total_expenses),
            "savings": float(current_month.net_amount),
            "health_score": health_score["score"],
            "health_label": health_score["label"],
            "recent_transactions": [
                {
                    "id": t.id,
                    "description": t.description,
                    "amount": float(t.amount),
                    "type": t.type.value,
                    "transaction_date": t.transaction_date.isoformat(),
                    "category": {
                        "name": t.category_name or "Sem categoria"
                    }
                }
                for t in recent_transactions
            ],
            "financial_goals": [
                {
                    "id": g.id,
                    "name": g.name,
                    "description": g.description,
                    "type": g.type.value,
                    "target_amount": float(g.target_amount),
                    "current_amount": float(g.current_amount),
                    "progress_percentage": g.progress_percentage,
                    "days_remaining": g.days_remaining,
                    "is_completed": g.is_completed,
                    "status": g.status.value
                }
                for g in goals
            ],
            "alerts": [
                {
                    "id": a.id,
                    "type": a.type.value,
                    "title": a.title,
                    "description": a.description,
                    "amount": float(a.amount) if a.amount else None,
                    "due_date": a.due_date.isoformat() if a.due_date else None,
                    "priority": a.priority.value,
                    "status": a.status.value,
                    "days_until_due": a.days_until_due,
                    "is_overdue": a.is_overdue
                }
                for a in alerts
            ],
            "insights": {
                "health_score": insights.health_score,
                "health_label": insights.health_label,
                "risk_level": insights.risk_level,
                "monthly_trend": insights.monthly_trend,
                "recommendations": insights.recommendations
            },
            "trends": trends
        }
    
    def _calculate_health_score(
        self, 
        current_month, 
        previous_month, 
        goals, 
        overall_summary
    ) -> Dict[str, Any]:
        """Calculate financial health score."""
        score = 0
        factors = []
        
        # Income vs Expenses ratio (40 points)
        if current_month.total_income > 0:
            ratio = float(current_month.total_expenses) / float(current_month.total_income)
            if ratio <= 0.5:
                score += 40
                factors.append("Excelente controle de gastos")
            elif ratio <= 0.7:
                score += 30
                factors.append("Bom controle de gastos")
            elif ratio <= 0.9:
                score += 20
                factors.append("Controle de gastos moderado")
            else:
                score += 10
                factors.append("Atenção aos gastos")
        
        # Savings rate (30 points)
        if current_month.total_income > 0:
            savings_rate = float(current_month.net_amount) / float(current_month.total_income)
            if savings_rate >= 0.2:
                score += 30
                factors.append("Excelente taxa de poupança")
            elif savings_rate >= 0.1:
                score += 20
                factors.append("Boa taxa de poupança")
            elif savings_rate > 0:
                score += 10
                factors.append("Taxa de poupança baixa")
        
        # Goals progress (20 points)
        if goals:
            completed_goals = sum(1 for g in goals if g.is_completed)
            total_goals = len(goals)
            goal_progress = completed_goals / total_goals
            score += int(20 * goal_progress)
            if goal_progress > 0.5:
                factors.append("Metas sendo cumpridas")
        
        # Transaction consistency (10 points)
        if current_month.transaction_count > 0:
            score += 10
            factors.append("Transações regulares")
        
        # Determine label
        if score >= 80:
            label = "Excelente"
        elif score >= 60:
            label = "Bom"
        elif score >= 40:
            label = "Regular"
        else:
            label = "Atenção"
        
        return {
            "score": min(score, 100),
            "label": label,
            "factors": factors
        }
    
    def _calculate_trends(self, current_month, previous_month) -> Dict[str, str]:
        """Calculate financial trends."""
        trends = {}
        
        # Income trend
        if previous_month.total_income > 0:
            income_change = (float(current_month.total_income) - float(previous_month.total_income)) / float(previous_month.total_income)
            if income_change > 0.05:
                trends["income_trend"] = "up"
            elif income_change < -0.05:
                trends["income_trend"] = "down"
            else:
                trends["income_trend"] = "stable"
        else:
            trends["income_trend"] = "stable"
        
        # Expense trend
        if previous_month.total_expenses > 0:
            expense_change = (float(current_month.total_expenses) - float(previous_month.total_expenses)) / float(previous_month.total_expenses)
            if expense_change > 0.05:
                trends["expense_trend"] = "up"
            elif expense_change < -0.05:
                trends["expense_trend"] = "down"
            else:
                trends["expense_trend"] = "stable"
        else:
            trends["expense_trend"] = "stable"
        
        # Savings trend
        if previous_month.net_amount != 0:
            savings_change = (float(current_month.net_amount) - float(previous_month.net_amount)) / abs(float(previous_month.net_amount))
            if savings_change > 0.05:
                trends["savings_trend"] = "up"
            elif savings_change < -0.05:
                trends["savings_trend"] = "down"
            else:
                trends["savings_trend"] = "stable"
        else:
            trends["savings_trend"] = "stable"
        
        return trends
