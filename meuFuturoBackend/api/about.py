"""
About page API endpoints.

Handles platform statistics, user progress, accessibility settings, and feedback.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
import structlog

from api.dependencies import get_current_user, get_db_session
from services.platform_service import PlatformService
from services.progress_service import ProgressService
from services.accessibility_service import AccessibilityService
from services.feedback_service import FeedbackService
from schemas.about import (
    AboutPageDataResponse,
    PlatformStatsResponse,
    UserProgressResponse,
    AccessibilitySettingsResponse,
    AccessibilitySettingsUpdate,
    UserFeedbackCreate,
    UserFeedbackResponse,
    FeedbackType,
    FeedbackStatus
)
from schemas.common import SuccessResponse
from models.user import User

logger = structlog.get_logger()

router = APIRouter()


# Dependency functions for services
async def get_platform_service(db = Depends(get_db_session)) -> PlatformService:
    """Get PlatformService instance."""
    return PlatformService(db)


async def get_progress_service(db = Depends(get_db_session)) -> ProgressService:
    """Get ProgressService instance."""
    return ProgressService(db)


async def get_accessibility_service(db = Depends(get_db_session)) -> AccessibilityService:
    """Get AccessibilityService instance."""
    return AccessibilityService(db)


async def get_feedback_service(db = Depends(get_db_session)) -> FeedbackService:
    """Get FeedbackService instance."""
    return FeedbackService(db)


# About Page Data Endpoint
@router.get(
    "/about/data",
    response_model=AboutPageDataResponse,
    summary="Dados da página About",
    description="Retorna dados personalizados para a página About"
)
async def get_about_page_data(
    current_user: User = Depends(get_current_user),
    platform_service: PlatformService = Depends(get_platform_service),
    progress_service: ProgressService = Depends(get_progress_service),
    accessibility_service: AccessibilityService = Depends(get_accessibility_service)
):
    """Get personalized data for About page."""
    try:
        # Get platform statistics
        platform_stats = await platform_service.get_platform_stats()
        
        # Get user progress
        user_progress = await progress_service.get_user_progress(current_user.id)
        
        # Get accessibility settings
        accessibility_settings = await accessibility_service.get_user_accessibility_settings(current_user.id)
        
        # Get user features (simplified for now)
        user_features = []
        if user_progress:
            if user_progress.transactions_created > 0:
                user_features.append("transactions")
            if user_progress.goals_achieved > 0:
                user_features.append("goals")
            if user_progress.budgets_respected > 0:
                user_features.append("budgets")
            if user_progress.ai_insights_viewed > 0:
                user_features.append("ai_insights")
        
        # Get recommendations (simplified for now)
        recommendations = []
        if user_progress:
            if user_progress.total_savings < user_progress.total_income * 0.1:
                recommendations.append("Considere economizar pelo menos 10% da sua renda")
            if user_progress.goals_achieved == 0:
                recommendations.append("Crie sua primeira meta financeira")
            if user_progress.transactions_created < 5:
                recommendations.append("Registre mais transações para ter insights melhores")
        
        return AboutPageDataResponse(
            platform_stats=platform_stats,
            user_progress=user_progress,
            accessibility_settings=accessibility_settings,
            user_features=user_features,
            recommendations=recommendations
        )
    except Exception as e:
        logger.error("Error getting about page data", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


# Platform Statistics Endpoints
@router.get(
    "/platform/stats",
    response_model=PlatformStatsResponse,
    summary="Estatísticas da plataforma",
    description="Retorna estatísticas gerais da plataforma"
)
async def get_platform_stats(
    platform_service: PlatformService = Depends(get_platform_service)
):
    """Get platform statistics."""
    try:
        return await platform_service.get_platform_stats()
    except Exception as e:
        logger.error("Error getting platform stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post(
    "/platform/stats/update",
    response_model=SuccessResponse,
    summary="Atualizar estatísticas da plataforma",
    description="Atualiza as estatísticas da plataforma"
)
async def update_platform_stats(
    platform_service: PlatformService = Depends(get_platform_service)
):
    """Update platform statistics."""
    try:
        await platform_service.update_platform_stats()
        return SuccessResponse(message="Estatísticas atualizadas com sucesso")
    except Exception as e:
        logger.error("Error updating platform stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


# User Progress Endpoints
@router.get(
    "/user/progress",
    response_model=UserProgressResponse,
    summary="Progresso do usuário",
    description="Retorna progresso e conquistas do usuário"
)
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service)
):
    """Get user progress and achievements."""
    try:
        progress = await progress_service.get_user_progress(current_user.id)
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Progresso do usuário não encontrado"
            )
        return progress
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting user progress", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


# Accessibility Settings Endpoints
@router.get(
    "/accessibility/settings",
    response_model=AccessibilitySettingsResponse,
    summary="Configurações de acessibilidade",
    description="Retorna configurações de acessibilidade do usuário"
)
async def get_accessibility_settings(
    current_user: User = Depends(get_current_user),
    accessibility_service: AccessibilityService = Depends(get_accessibility_service)
):
    """Get user accessibility settings."""
    try:
        settings = await accessibility_service.get_user_accessibility_settings(current_user.id)
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configurações de acessibilidade não encontradas"
            )
        return settings
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting accessibility settings", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.put(
    "/accessibility/settings",
    response_model=AccessibilitySettingsResponse,
    summary="Atualizar configurações de acessibilidade",
    description="Atualiza configurações de acessibilidade do usuário"
)
async def update_accessibility_settings(
    settings: AccessibilitySettingsUpdate,
    current_user: User = Depends(get_current_user),
    accessibility_service: AccessibilityService = Depends(get_accessibility_service)
):
    """Update user accessibility settings."""
    try:
        return await accessibility_service.update_accessibility_settings(
            current_user.id, 
            settings
        )
    except Exception as e:
        logger.error(
            "Error updating accessibility settings",
            error=str(e),
            user_id=current_user.id,
            settings=settings.dict()
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post(
    "/accessibility/settings/reset",
    response_model=AccessibilitySettingsResponse,
    summary="Resetar configurações de acessibilidade",
    description="Reseta configurações de acessibilidade para padrões"
)
async def reset_accessibility_settings(
    current_user: User = Depends(get_current_user),
    accessibility_service: AccessibilityService = Depends(get_accessibility_service)
):
    """Reset user accessibility settings to defaults."""
    try:
        return await accessibility_service.reset_to_defaults(current_user.id)
    except Exception as e:
        logger.error("Error resetting accessibility settings", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


# Feedback Endpoints
@router.post(
    "/feedback",
    response_model=UserFeedbackResponse,
    summary="Enviar feedback",
    description="Envia feedback do usuário sobre a plataforma"
)
async def submit_feedback(
    feedback: UserFeedbackCreate,
    current_user: User = Depends(get_current_user),
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    """Submit user feedback."""
    try:
        return await feedback_service.submit_feedback(current_user.id, feedback)
    except Exception as e:
        logger.error(
            "Error submitting feedback",
            error=str(e),
            user_id=current_user.id,
            feedback=feedback.dict()
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get(
    "/feedback",
    response_model=List[UserFeedbackResponse],
    summary="Listar feedback do usuário",
    description="Lista feedback enviado pelo usuário"
)
async def get_user_feedback(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    """Get user's feedback submissions."""
    try:
        return await feedback_service.get_user_feedback(current_user.id, skip, limit)
    except Exception as e:
        logger.error("Error getting user feedback", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get(
    "/feedback/stats",
    response_model=dict,
    summary="Estatísticas de feedback",
    description="Retorna estatísticas de feedback da plataforma"
)
async def get_feedback_stats(
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    """Get feedback statistics."""
    try:
        return await feedback_service.get_rating_stats()
    except Exception as e:
        logger.error("Error getting feedback stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
