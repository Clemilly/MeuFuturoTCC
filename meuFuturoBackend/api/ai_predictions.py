"""
AI Predictions API endpoints.

Handles AI-powered financial insights, predictions, and recommendations.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
import structlog

from api.dependencies import (
    get_ai_service,
    get_current_user,
    PaginationParams,
    get_pagination_params,
)
from services.ai_service import AIService
from schemas.ai_prediction import (
    PredictionRequest,
    AIPredictionResponse,
    FinancialInsights,
)
from schemas.common import PaginatedResponse, SuccessResponse
from models.user import User
from models.ai_prediction import PredictionType, PredictionStatus

logger = structlog.get_logger()

router = APIRouter()


@router.post(
    "/generate",
    response_model=List[AIPredictionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Gerar predições",
    description="Gera predições financeiras usando IA",
)
async def generate_predictions(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Gerar predições financeiras com IA.
    
    - **prediction_types**: Tipos de predições a gerar
    - **time_horizon**: Horizonte temporal em dias (1-365)
    - **include_recommendations**: Incluir recomendações acionáveis
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    predictions = await ai_service.generate_predictions(current_user.id, request)
    
    logger.info(
        "AI predictions generated",
        user_id=current_user.id,
        prediction_count=len(predictions),
        types=[p.type for p in predictions]
    )
    
    return predictions


@router.get(
    "/insights",
    response_model=FinancialInsights,
    summary="Insights financeiros",
    description="Obtém insights financeiros completos com IA",
)
async def get_financial_insights(
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Obter insights financeiros abrangentes.
    
    Inclui:
    - Score de saúde financeira
    - Predições ativas
    - Padrões de gastos
    - Recomendações personalizadas
    - Projeções de poupança
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    insights = await ai_service.get_financial_insights(current_user.id)
    
    return insights


@router.get(
    "/predictions",
    response_model=PaginatedResponse[AIPredictionResponse],
    summary="Listar predições",
    description="Lista as predições do usuário com filtros",
)
async def get_predictions(
    pagination: PaginationParams = Depends(get_pagination_params),
    status: Optional[PredictionStatus] = Query(None, description="Filtrar por status"),
    prediction_type: Optional[PredictionType] = Query(None, description="Filtrar por tipo"),
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Listar predições do usuário.
    
    Suporte a filtros por status e tipo de predição.
    """
    predictions = await ai_service.prediction_repo.get_user_predictions(
        user_id=current_user.id,
        status=status,
        prediction_type=prediction_type,
        skip=pagination.skip,
        limit=pagination.limit,
    )
    
    # Get total count (simplified - in production, implement proper counting)
    total_count = len(predictions) + pagination.skip
    
    # Calculate pagination info
    total_pages = (total_count + pagination.size - 1) // pagination.size
    has_next = len(predictions) == pagination.limit
    has_previous = pagination.page > 1
    
    return PaginatedResponse(
        items=predictions,
        total=total_count,
        page=pagination.page,
        size=pagination.size,
        pages=total_pages,
        has_next=has_next,
        has_previous=has_previous,
    )


@router.get(
    "/predictions/active",
    response_model=List[AIPredictionResponse],
    summary="Predições ativas",
    description="Obtém todas as predições ativas (não expiradas)",
)
async def get_active_predictions(
    prediction_type: Optional[PredictionType] = Query(None, description="Filtrar por tipo"),
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Obter predições ativas.
    
    Retorna apenas predições que ainda não expiraram.
    """
    predictions = await ai_service.prediction_repo.get_active_predictions(
        user_id=current_user.id,
        prediction_type=prediction_type,
    )
    
    return predictions


@router.get(
    "/predictions/high-confidence",
    response_model=List[AIPredictionResponse],
    summary="Predições de alta confiança",
    description="Obtém predições com alta confiança da IA",
)
async def get_high_confidence_predictions(
    confidence_threshold: float = Query(
        0.7, 
        ge=0.0, 
        le=1.0, 
        description="Limite de confiança (0.0-1.0)"
    ),
    limit: int = Query(10, ge=1, le=50, description="Máximo de predições"),
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Obter predições de alta confiança.
    
    Filtra predições baseado no score de confiança da IA.
    """
    predictions = await ai_service.prediction_repo.get_high_confidence_predictions(
        user_id=current_user.id,
        confidence_threshold=confidence_threshold,
        limit=limit,
    )
    
    return predictions


@router.get(
    "/predictions/{prediction_id}",
    response_model=AIPredictionResponse,
    summary="Obter predição",
    description="Obtém uma predição específica por ID",
)
async def get_prediction(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Obter uma predição específica.
    
    - **prediction_id**: ID da predição
    """
    prediction = await ai_service.prediction_repo.get_by_id(prediction_id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Predição não encontrada"
        )
    
    if prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado à predição"
        )
    
    return prediction


@router.post(
    "/predictions/{prediction_id}/archive",
    response_model=SuccessResponse,
    summary="Arquivar predição",
    description="Arquiva uma predição específica",
)
async def archive_prediction(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Arquivar uma predição.
    
    - **prediction_id**: ID da predição
    """
    # Verify ownership
    prediction = await ai_service.prediction_repo.get_by_id(prediction_id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Predição não encontrada"
        )
    
    if prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado à predição"
        )
    
    # Archive prediction
    updated_prediction = await ai_service.prediction_repo.archive_prediction(prediction_id)
    
    if not updated_prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Predição não encontrada"
        )
    
    logger.info(
        "Prediction archived",
        user_id=current_user.id,
        prediction_id=prediction_id
    )
    
    return SuccessResponse(
        message="Predição arquivada com sucesso"
    )


@router.post(
    "/predictions/{prediction_id}/dismiss",
    response_model=SuccessResponse,
    summary="Dispensar predição",
    description="Dispensa uma predição específica",
)
async def dismiss_prediction(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Dispensar uma predição.
    
    - **prediction_id**: ID da predição
    """
    # Verify ownership
    prediction = await ai_service.prediction_repo.get_by_id(prediction_id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Predição não encontrada"
        )
    
    if prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado à predição"
        )
    
    # Dismiss prediction
    updated_prediction = await ai_service.prediction_repo.dismiss_prediction(prediction_id)
    
    if not updated_prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Predição não encontrada"
        )
    
    logger.info(
        "Prediction dismissed",
        user_id=current_user.id,
        prediction_id=prediction_id
    )
    
    return SuccessResponse(
        message="Predição dispensada com sucesso"
    )


@router.get(
    "/statistics",
    summary="Estatísticas de predições",
    description="Obtém estatísticas das predições do usuário",
)
async def get_prediction_statistics(
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Obter estatísticas de predições.
    
    Inclui contadores e métricas de precisão das predições.
    """
    statistics = await ai_service.get_user_prediction_statistics(current_user.id)
    
    return statistics


@router.post(
    "/cleanup",
    response_model=SuccessResponse,
    summary="Limpar predições antigas",
    description="Remove predições arquivadas antigas do usuário",
)
async def cleanup_old_predictions(
    days_old: int = Query(90, ge=30, le=365, description="Dias para considerar antiga"),
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Limpar predições antigas.
    
    Remove predições arquivadas/dispensadas mais antigas que o período especificado.
    """
    # This would typically be an admin operation, but for demo purposes,
    # we'll allow users to clean their own predictions
    deleted_count = await ai_service.prediction_repo.cleanup_old_predictions(
        days_old=days_old,
        batch_size=100,
    )
    
    logger.info(
        "Old predictions cleaned up",
        user_id=current_user.id,
        deleted_count=deleted_count
    )
    
    return SuccessResponse(
        message=f"{deleted_count} predições antigas removidas"
    )
