"""
Category repository for category-specific database operations.

Extends BaseRepository with category-specific methods.
"""

from typing import Optional, List
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.category import Category
from repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    """Repository for Category model with specific category operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Category, db)
    
    async def get_system_categories(self) -> List[Category]:
        """
        Get all system-defined categories.
        
        Returns:
            List of system categories
        """
        return await self.get_all(
            filters={"is_system": True, "is_active": True},
            order_by="name"
        )
    
    async def get_user_categories(
        self,
        user_id: str,
        include_system: bool = True,
        include_inactive: bool = False,
    ) -> List[Category]:
        """
        Get categories available to a user.
        
        Args:
            user_id: User ID
            include_system: Whether to include system categories
            include_inactive: Whether to include inactive categories
            
        Returns:
            List of available categories
        """
        conditions = []
        
        if include_system:
            # User's own categories OR system categories
            conditions.append(
                or_(
                    Category.user_id == user_id,
                    Category.is_system == True
                )
            )
        else:
            # Only user's own categories
            conditions.append(Category.user_id == user_id)
        
        if not include_inactive:
            conditions.append(Category.is_active == True)
        
        filters = {}
        if conditions:
            # We'll use raw query for complex OR conditions
            query = (
                select(Category)
                .where(and_(*conditions))
                .order_by(Category.name)
            )
            
            result = await self.db.execute(query)
            return list(result.scalars().all())
        
        return await self.get_all(filters=filters, order_by="name")
    
    async def get_categories_with_subcategories(
        self,
        user_id: str,
        include_system: bool = True,
    ) -> List[Category]:
        """
        Get categories with their subcategories loaded.
        
        Args:
            user_id: User ID
            include_system: Whether to include system categories
            
        Returns:
            List of categories with subcategories
        """
        conditions = []
        
        if include_system:
            conditions.append(
                or_(
                    Category.user_id == user_id,
                    Category.is_system == True
                )
            )
        else:
            conditions.append(Category.user_id == user_id)
        
        # Only parent categories (no parent_id)
        conditions.append(Category.parent_id.is_(None))
        conditions.append(Category.is_active == True)
        
        query = (
            select(Category)
            .options(selectinload(Category.subcategories))
            .where(and_(*conditions))
            .order_by(Category.name)
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_subcategories(self, parent_id: str) -> List[Category]:
        """
        Get all subcategories of a parent category.
        
        Args:
            parent_id: Parent category ID
            
        Returns:
            List of subcategories
        """
        return await self.get_all(
            filters={"parent_id": parent_id, "is_active": True},
            order_by="name"
        )
    
    async def get_category_by_name(
        self,
        name: str,
        user_id: Optional[str] = None,
        is_system: Optional[bool] = None,
    ) -> Optional[Category]:
        """
        Get category by name.
        
        Args:
            name: Category name
            user_id: User ID (optional)
            is_system: Filter by system category (optional)
            
        Returns:
            Category instance or None if not found
        """
        conditions = [Category.name == name]
        
        if user_id is not None:
            conditions.append(Category.user_id == user_id)
        
        if is_system is not None:
            conditions.append(Category.is_system == is_system)
        
        query = select(Category).where(and_(*conditions))
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def category_name_exists(
        self,
        name: str,
        user_id: str,
        exclude_category_id: Optional[str] = None,
        parent_id: Optional[str] = None,
    ) -> bool:
        """
        Check if category name already exists for a user.
        
        Args:
            name: Category name to check
            user_id: User ID
            exclude_category_id: Category ID to exclude (for updates)
            parent_id: Parent category ID (for subcategories)
            
        Returns:
            True if name exists, False otherwise
        """
        conditions = [
            Category.name == name,
            or_(
                Category.user_id == user_id,
                Category.is_system == True
            )
        ]
        
        if parent_id:
            conditions.append(Category.parent_id == parent_id)
        else:
            conditions.append(Category.parent_id.is_(None))
        
        if exclude_category_id:
            conditions.append(Category.id != exclude_category_id)
        
        query = select(Category).where(and_(*conditions))
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None
    
    async def get_user_custom_categories(self, user_id: str) -> List[Category]:
        """
        Get only user's custom (non-system) categories.
        
        Args:
            user_id: User ID
            
        Returns:
            List of user's custom categories
        """
        return await self.get_all(
            filters={
                "user_id": user_id,
                "is_system": False,
                "is_active": True
            },
            order_by="name"
        )
    
    async def activate_category(self, category_id: str) -> Optional[Category]:
        """
        Activate a category.
        
        Args:
            category_id: Category ID
            
        Returns:
            Updated category instance or None if not found
        """
        return await self.update(category_id, is_active=True)
    
    async def deactivate_category(self, category_id: str) -> Optional[Category]:
        """
        Deactivate a category.
        
        Args:
            category_id: Category ID
            
        Returns:
            Updated category instance or None if not found
        """
        return await self.update(category_id, is_active=False)
    
    async def can_delete_category(self, category_id: str, user_id: str) -> bool:
        """
        Check if a category can be deleted by a user.
        
        Args:
            category_id: Category ID
            user_id: User ID
            
        Returns:
            True if category can be deleted, False otherwise
        """
        category = await self.get_by_id(category_id)
        
        if not category:
            return False
        
        # System categories cannot be deleted
        if category.is_system:
            return False
        
        # Only the owner can delete the category
        if category.user_id != user_id:
            return False
        
        return True
    
    async def search_categories(
        self,
        search_term: str,
        user_id: str,
        limit: int = 50,
    ) -> List[Category]:
        """
        Search categories by name or description.
        
        Args:
            search_term: Search term
            user_id: User ID
            limit: Maximum number of results
            
        Returns:
            List of matching categories
        """
        search_pattern = f"%{search_term}%"
        
        query = (
            select(Category)
            .where(
                and_(
                    or_(
                        Category.name.ilike(search_pattern),
                        Category.description.ilike(search_pattern)
                    ),
                    or_(
                        Category.user_id == user_id,
                        Category.is_system == True
                    ),
                    Category.is_active == True
                )
            )
            .order_by(Category.name)
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_categories_with_transaction_count(
        self,
        user_id: str,
    ) -> List[dict]:
        """
        Get categories with transaction count for the user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of dictionaries with category info and transaction count
        """
        from models.transaction import Transaction
        from sqlalchemy import func
        
        query = (
            select(
                Category,
                func.count(Transaction.id).label("transaction_count")
            )
            .outerjoin(
                Transaction,
                and_(
                    Transaction.category_id == Category.id,
                    Transaction.user_id == user_id
                )
            )
            .where(
                and_(
                    or_(
                        Category.user_id == user_id,
                        Category.is_system == True
                    ),
                    Category.is_active == True
                )
            )
            .group_by(Category.id)
            .order_by(Category.name)
        )
        
        result = await self.db.execute(query)
        rows = result.all()
        
        return [
            {
                "category": row[0],
                "transaction_count": row[1] or 0
            }
            for row in rows
        ]
