"""
User repository for user-specific database operations.

Extends BaseRepository with user-specific methods.
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model with specific user operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email address.
        
        Args:
            email: User's email address
            
        Returns:
            User instance or None if not found
        """
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def email_exists(self, email: str, exclude_user_id: Optional[str] = None) -> bool:
        """
        Check if email already exists in the database.
        
        Args:
            email: Email to check
            exclude_user_id: User ID to exclude from check (for updates)
            
        Returns:
            True if email exists, False otherwise
        """
        query = select(User).where(User.email == email)
        
        if exclude_user_id:
            query = query.where(User.id != exclude_user_id)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None
    
    async def get_active_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """
        Get all active users.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of active users
        """
        return await self.get_all(
            skip=skip,
            limit=limit,
            filters={"is_active": True}
        )
    
    async def get_verified_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """
        Get all verified users.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of verified users
        """
        return await self.get_all(
            skip=skip,
            limit=limit,
            filters={"is_verified": True}
        )
    
    async def update_last_login(self, user_id: str) -> Optional[User]:
        """
        Update user's last login timestamp.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated user instance or None if not found
        """
        from datetime import datetime
        return await self.update(user_id, last_login=datetime.utcnow())
    
    async def activate_user(self, user_id: str) -> Optional[User]:
        """
        Activate a user account.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated user instance or None if not found
        """
        return await self.update(user_id, is_active=True)
    
    async def deactivate_user(self, user_id: str) -> Optional[User]:
        """
        Deactivate a user account.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated user instance or None if not found
        """
        return await self.update(user_id, is_active=False)
    
    async def verify_email(self, user_id: str) -> Optional[User]:
        """
        Mark user's email as verified.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated user instance or None if not found
        """
        return await self.update(user_id, is_verified=True)
    
    async def update_accessibility_preferences(
        self, 
        user_id: str, 
        preferences: dict
    ) -> Optional[User]:
        """
        Update user's accessibility preferences.
        
        Args:
            user_id: User ID
            preferences: Accessibility preferences dictionary
            
        Returns:
            Updated user instance or None if not found
        """
        return await self.update(user_id, accessibility_preferences=preferences)
    
    async def update_financial_profile(
        self, 
        user_id: str, 
        profile: dict
    ) -> Optional[User]:
        """
        Update user's financial profile.
        
        Args:
            user_id: User ID
            profile: Financial profile dictionary
            
        Returns:
            Updated user instance or None if not found
        """
        return await self.update(user_id, financial_profile=profile)
    
    async def search_users(self, search_term: str, limit: int = 50) -> list[User]:
        """
        Search users by name or email.
        
        Args:
            search_term: Search term to match against name and email
            limit: Maximum number of results
            
        Returns:
            List of matching users
        """
        search_pattern = f"%{search_term}%"
        
        result = await self.db.execute(
            select(User)
            .where(
                (User.name.ilike(search_pattern)) |
                (User.email.ilike(search_pattern))
            )
            .where(User.is_active == True)
            .limit(limit)
        )
        
        return list(result.scalars().all())
