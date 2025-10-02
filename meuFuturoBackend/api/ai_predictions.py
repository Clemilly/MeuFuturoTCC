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
from core.database import get_db_session
from services.ai_service import AIService
from services.simulation_service import SimulationService
from services.pattern_analysis_service import PatternAnalysisService
from services.recommendation_service import RecommendationService
from services.report_generator_service import ReportGeneratorService
from schemas.ai_prediction import (
    PredictionRequest,
    AIPredictionResponse,
    FinancialInsights,
    FinancialSimulation,
    SimulationResult,
    PatternAnalysisAdvanced,
    SeasonalPattern,
    AnomalyDetection,
    PersonalizedRecommendation,
    AdvancedMetrics,
    MonthlyAIReport,
    AdvancedDashboard,
    AIFeedback,
)
from schemas.common import PaginatedResponse, SuccessResponse
from models.user import User
from models.ai_prediction import PredictionType, PredictionStatus
from sqlalchemy.ext.asyncio import AsyncSession

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


# Advanced AI Endpoints

@router.get(
    "/dashboard/advanced",
    response_model=AdvancedDashboard,
    summary="Dashboard avançado de IA",
    description="Obtém dashboard completo com métricas avançadas de IA",
)
async def get_advanced_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Obter dashboard avançado com todas as funcionalidades de IA.
    
    Inclui:
    - Score de saúde financeira e métricas avançadas
    - Predições de fluxo de caixa (3, 6, 12 meses)
    - Padrões sazonais e anomalias
    - Análise avançada de padrões
    - Recomendações personalizadas
    - Projeções de metas
    - Projeções de poupança
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    # Initialize services
    ai_service = AIService(db)
    pattern_service = PatternAnalysisService(db)
    recommendation_service = RecommendationService(db)
    
    # Get basic insights
    insights = await ai_service.get_financial_insights(current_user.id)
    
    # Get advanced metrics
    advanced_metrics = await recommendation_service.calculate_advanced_metrics(
        current_user.id
    )
    
    # Get cash flow predictions
    # TODO: Implement proper time-series predictions
    cash_flow_predictions = []
    
    # Get seasonal patterns
    seasonal_patterns = await pattern_service.detect_seasonal_patterns(
        current_user.id
    )
    
    # Get recent anomalies
    anomalies = await pattern_service.detect_anomalies(
        current_user.id,
        days=30
    )
    
    # Get pattern analysis
    pattern_analysis = await pattern_service.analyze_patterns(
        current_user.id
    )
    
    # Get personalized recommendations
    recommendations = await recommendation_service.generate_recommendations(
        current_user.id,
        max_recommendations=10
    )
    
    # Get goal projections (from existing insights)
    goal_projections = []
    
    return AdvancedDashboard(
        health_score=insights.health_score,
        health_label=insights.health_label,
        risk_level=insights.risk_level,
        monthly_trend=insights.monthly_trend,
        advanced_metrics=advanced_metrics,
        cash_flow_predictions=cash_flow_predictions,
        seasonal_patterns=seasonal_patterns,
        anomalies=anomalies,
        spending_patterns=insights.spending_patterns,
        pattern_analysis=pattern_analysis,
        recommendations=recommendations,
        goal_projections=goal_projections,
        savings_projection=insights.savings_projection,
    )


@router.post(
    "/simulations",
    response_model=SimulationResult,
    summary="Simular cenário financeiro",
    description="Executa simulação de cenário 'e se' para planejamento financeiro",
)
async def run_financial_simulation(
    simulation: FinancialSimulation,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Executar simulação financeira.
    
    Permite testar diferentes cenários:
    - E se eu economizasse X% mais?
    - E se eu aumentasse minha renda?
    - E se eu reduzisse gastos em Y%?
    
    Retorna projeção detalhada do impacto ao longo do tempo.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    simulation_service = SimulationService(db)
    
    result = await simulation_service.run_simulation(
        user_id=current_user.id,
        simulation=simulation
    )
    
    logger.info(
        "Financial simulation completed",
        user_id=current_user.id,
        scenario=simulation.scenario_name
    )
    
    return result


@router.get(
    "/patterns/advanced",
    response_model=PatternAnalysisAdvanced,
    summary="Análise avançada de padrões",
    description="Obtém análise detalhada de padrões de gastos",
)
async def get_advanced_patterns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Obter análise avançada de padrões.
    
    Inclui:
    - Padrões temporais (dia da semana, mês)
    - Correlações entre categorias
    - Score de gastos impulsivos
    - Insights comportamentais
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    pattern_service = PatternAnalysisService(db)
    
    patterns = await pattern_service.analyze_patterns(current_user.id)
    
    return patterns


@router.get(
    "/patterns/seasonal",
    response_model=List[SeasonalPattern],
    summary="Padrões sazonais",
    description="Detecta padrões sazonais de gastos",
)
async def get_seasonal_patterns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Detectar padrões sazonais de gastos.
    
    Identifica categorias com variações sazonais significativas
    e sugere planejamento para picos de gastos.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    pattern_service = PatternAnalysisService(db)
    
    patterns = await pattern_service.detect_seasonal_patterns(current_user.id)
    
    return patterns


@router.get(
    "/anomalies",
    response_model=List[AnomalyDetection],
    summary="Detectar anomalias",
    description="Detecta gastos anômalos ou fora do padrão",
)
async def detect_anomalies(
    days: int = Query(30, ge=7, le=90, description="Período em dias para análise"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Detectar anomalias em gastos.
    
    Identifica transações significativamente diferentes do padrão
    habitual do usuário, ajudando a detectar gastos impulsivos
    ou não planejados.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    pattern_service = PatternAnalysisService(db)
    
    anomalies = await pattern_service.detect_anomalies(
        user_id=current_user.id,
        days=days
    )
    
    return anomalies


@router.get(
    "/recommendations/personalized",
    response_model=List[PersonalizedRecommendation],
    summary="Recomendações personalizadas",
    description="Obtém recomendações personalizadas baseadas em IA",
)
async def get_personalized_recommendations(
    max_count: int = Query(5, ge=1, le=20, description="Número máximo de recomendações"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Obter recomendações personalizadas.
    
    Gera recomendações específicas baseadas em:
    - Padrões de gastos do usuário
    - Metas financeiras
    - Oportunidades de economia
    - Otimizações de orçamento
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    recommendation_service = RecommendationService(db)
    
    recommendations = await recommendation_service.generate_recommendations(
        user_id=current_user.id,
        max_recommendations=max_count
    )
    
    return recommendations


@router.get(
    "/metrics/advanced",
    response_model=AdvancedMetrics,
    summary="Métricas avançadas",
    description="Obtém métricas financeiras avançadas",
)
async def get_advanced_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Obter métricas financeiras avançadas.
    
    Inclui:
    - Taxa de poupança atual e ideal
    - Score de liquidez
    - Score de diversificação
    - Índice de estabilidade
    - Volatilidade de despesas
    - Consistência de receita
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    recommendation_service = RecommendationService(db)
    
    metrics = await recommendation_service.calculate_advanced_metrics(
        user_id=current_user.id
    )
    
    return metrics


@router.get(
    "/reports/monthly",
    response_model=MonthlyAIReport,
    summary="Relatório mensal de IA",
    description="Gera relatório mensal completo com análise de IA",
)
async def get_monthly_report(
    month: str = Query(..., description="Mês de referência (YYYY-MM)", regex=r"^\d{4}-\d{2}$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Gerar relatório mensal completo.
    
    Inclui:
    - Sumário executivo em linguagem natural
    - Métricas financeiras do mês
    - Insights e conquistas
    - Áreas para melhoria
    - Predição para próximo mês
    - Recomendações prioritárias
    - Progresso em metas
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email deve ser verificado para usar recursos de IA"
        )
    
    report_service = ReportGeneratorService(db)
    
    report = await report_service.generate_monthly_report(
        user_id=current_user.id,
        reference_month=month
    )
    
    logger.info(
        "Monthly AI report generated",
        user_id=current_user.id,
        month=month
    )
    
    return report


@router.post(
    "/feedback",
    response_model=SuccessResponse,
    summary="Enviar feedback sobre IA",
    description="Envia feedback sobre recomendações ou predições de IA",
)
async def submit_ai_feedback(
    feedback: AIFeedback,
    current_user: User = Depends(get_current_user),
):
    """
    Enviar feedback sobre recursos de IA.
    
    Permite que usuários avaliem:
    - Recomendações
    - Predições
    - Relatórios
    
    O feedback é usado para melhorar os algoritmos de IA.
    """
    logger.info(
        "AI feedback received",
        user_id=current_user.id,
        feedback_type=feedback.feedback_type,
        item_id=feedback.item_id,
        rating=feedback.rating,
        was_helpful=feedback.was_helpful
    )
    
    # In a real implementation, this would store feedback in the database
    # for analysis and model improvement
    
    return SuccessResponse(
        message="Feedback recebido com sucesso. Obrigado!"
    )
