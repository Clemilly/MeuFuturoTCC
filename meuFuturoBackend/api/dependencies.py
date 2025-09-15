"""
FastAPI dependencies for the MeuFuturo API.

Common dependencies used across different API endpoints.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db_session
from core.security import get_current_user_id
from services.auth_service import AuthService
from services.financial_service import FinancialService
from services.ai_service import AIService
from services.platform_service import PlatformService
from services.progress_service import ProgressService
from services.accessibility_service import AccessibilityService
from services.feedback_service import FeedbackService
from models.user import User


# Database Dependencies

async def get_auth_service(db: AsyncSession = Depends(get_db_session)) -> AuthService:
    """Get AuthService instance with database session."""
    return AuthService(db)


async def get_financial_service(db: AsyncSession = Depends(get_db_session)) -> FinancialService:
    """Get FinancialService instance with database session."""
    return FinancialService(db)


async def get_ai_service(db: AsyncSession = Depends(get_db_session)) -> AIService:
    """Get AIService instance with database session."""
    return AIService(db)


async def get_platform_service(db: AsyncSession = Depends(get_db_session)) -> PlatformService:
    """Get PlatformService instance with database session."""
    return PlatformService(db)


async def get_progress_service(db: AsyncSession = Depends(get_db_session)) -> ProgressService:
    """Get ProgressService instance with database session."""
    return ProgressService(db)


async def get_accessibility_service(db: AsyncSession = Depends(get_db_session)) -> AccessibilityService:
    """Get AccessibilityService instance with database session."""
    return AccessibilityService(db)


async def get_feedback_service(db: AsyncSession = Depends(get_db_session)) -> FeedbackService:
    """Get FeedbackService instance with database session."""
    return FeedbackService(db)


# Authentication Dependencies

async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """
    Get the current authenticated user.
    
    Args:
        user_id: Current user ID from JWT token
        auth_service: AuthService instance
        
    Returns:
        Current user instance
        
    Raises:
        HTTPException: If user not found or inactive
    """
    user = await auth_service.get_user_profile(user_id)
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta de usuário inativa"
        )
    
    return user


async def get_verified_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current user, ensuring they are email verified.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        Verified user instance
        
    Raises:
        HTTPException: If user email is not verified
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email não verificado. Verifique seu email antes de continuar."
        )
    
    return current_user


# Pagination Dependencies

class PaginationParams:
    """Pagination parameters for list endpoints."""
    
    def __init__(self, page: int, size: int):
        self.page = page
        self.size = size
        self.skip = (page - 1) * size
        self.limit = size


def get_pagination_params(
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(20, ge=1, le=100, description="Itens por página"),
) -> PaginationParams:
    """Get pagination parameters from query string."""
    return PaginationParams(page, size)


# Common Query Parameters

def get_optional_date_range(
    start_date: Optional[str] = Query(None, description="Data de início (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Data de fim (YYYY-MM-DD)"),
) -> tuple[Optional[str], Optional[str]]:
    """
    Get optional date range parameters.
    
    Args:
        start_date: Start date string
        end_date: End date string
        
    Returns:
        Tuple of (start_date, end_date)
    """
    return start_date, end_date


def get_search_params(
    search: Optional[str] = Query(None, min_length=1, max_length=255, description="Termo de busca"),
) -> Optional[str]:
    """
    Get search parameter.
    
    Args:
        search: Search term
        
    Returns:
        Search term or None
    """
    return search


# Permission Helpers

def require_resource_owner(resource_user_id: str, current_user_id: str) -> None:
    """
    Ensure the current user owns the resource.
    
    Args:
        resource_user_id: User ID of resource owner
        current_user_id: Current user ID
        
    Raises:
        HTTPException: If user doesn't own the resource
    """
    if resource_user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a este recurso"
        )


# Utility Dependencies

async def validate_user_exists(
    user_id: str,
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """
    Validate that a user exists and return the user.
    
    Args:
        user_id: User ID to validate
        auth_service: AuthService instance
        
    Returns:
        User instance
        
    Raises:
        HTTPException: If user not found
    """
    try:
        return await auth_service.get_user_profile(user_id)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
