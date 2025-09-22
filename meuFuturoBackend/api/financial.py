"""
Financial API endpoints.

Handles transactions, categories, and financial reporting.
"""

from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Response
import structlog

from api.dependencies import (
    get_financial_service,
    get_current_user,
    PaginationParams,
    get_pagination_params,
    get_db_session,
)
from services.financial_service import FinancialService
from schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionFilter,
    TransactionSummary,
    TransactionStats,
    PaginatedTransactionResponse,
    CategorySummary,
    MonthlySummary,
)
from schemas.report import (
    AnalyticsData,
    ComparativeReport,
    TrendAnalysis,
)
from schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithSubcategories,
)
from schemas.common import PaginatedResponse, SuccessResponse
from schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalProgressUpdate
from schemas.alert import AlertCreate, AlertUpdate, AlertResponse
from services.goal_service import GoalService
from services.alert_service import AlertService
from models.user import User
from models.transaction import TransactionType

logger = structlog.get_logger()

router = APIRouter()


# Dependency functions
async def get_goal_service(db = Depends(get_db_session)) -> GoalService:
    """Get goal service dependency."""
    return GoalService(db)


async def get_alert_service(db = Depends(get_db_session)) -> AlertService:
    """Get alert service dependency."""
    return AlertService(db)


# Transaction Endpoints

@router.post(
    "/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar transação",
    description="Cria uma nova transação financeira",
)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Criar uma nova transação.
    
    - **type**: Tipo da transação (income/expense)
    - **amount**: Valor da transação (sempre positivo)
    - **description**: Descrição da transação
    - **transaction_date**: Data da transação
    - **notes**: Observações opcionais
    - **category_id**: ID da categoria (opcional)
    """
    transaction = await financial_service.create_transaction(
        current_user.id, transaction_data
    )
    
    logger.info(
        "Transaction created via API",
        user_id=current_user.id,
        transaction_id=transaction.id
    )
    
    return transaction


@router.get(
    "/transactions",
    response_model=PaginatedTransactionResponse,
    summary="Listar transações",
    description="Lista as transações do usuário com filtros e paginação",
)
async def get_transactions(
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(20, ge=1, le=100, description="Itens por página"),
    transaction_type: Optional[TransactionType] = Query(None, description="Filtrar por tipo"),
    category_id: Optional[str] = Query(None, description="Filtrar por categoria"),
    start_date: Optional[date] = Query(None, description="Data de início"),
    end_date: Optional[date] = Query(None, description="Data de fim"),
    min_amount: Optional[float] = Query(None, ge=0, description="Valor mínimo"),
    max_amount: Optional[float] = Query(None, ge=0, description="Valor máximo"),
    search: Optional[str] = Query(None, min_length=1, description="Buscar na descrição"),
    sort_by: str = Query("transaction_date", description="Campo para ordenação"),
    sort_order: str = Query("desc", description="Ordem da ordenação (asc/desc)"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Listar transações do usuário.
    
    Suporte a filtros e paginação para facilitar a busca e navegação.
    """
    # Build filters
    filters = TransactionFilter(
        type=transaction_type,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        search=search,
    )
    
    # Get paginated transactions
    result = await financial_service.get_paginated_transactions(
        user_id=current_user.id,
        page=page,
        size=size,
        filters=filters,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    
    return PaginatedTransactionResponse(**result)


@router.get(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
    summary="Obter transação",
    description="Obtém uma transação específica por ID",
)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Obter uma transação específica.
    
    - **transaction_id**: ID da transação
    """
    transaction = await financial_service.get_transaction_by_id(
        current_user.id, transaction_id
    )
    
    return transaction


@router.put(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
    summary="Atualizar transação",
    description="Atualiza uma transação existente",
)
async def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Atualizar uma transação.
    
    - **transaction_id**: ID da transação
    - Campos opcionais para atualização
    """
    transaction = await financial_service.update_transaction(
        current_user.id, transaction_id, transaction_data
    )
    
    logger.info(
        "Transaction updated via API",
        user_id=current_user.id,
        transaction_id=transaction_id
    )
    
    return transaction


@router.delete(
    "/transactions/{transaction_id}",
    response_model=SuccessResponse,
    summary="Excluir transação",
    description="Exclui uma transação existente",
)
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Excluir uma transação.
    
    - **transaction_id**: ID da transação
    """
    deleted = await financial_service.delete_transaction(
        current_user.id, transaction_id
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada"
        )
    
    logger.info(
        "Transaction deleted via API",
        user_id=current_user.id,
        transaction_id=transaction_id
    )
    
    return SuccessResponse(
        message="Transação excluída com sucesso"
    )


# Category Endpoints

@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar categoria",
    description="Cria uma nova categoria personalizada",
)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Criar uma nova categoria.
    
    - **name**: Nome da categoria
    - **description**: Descrição opcional
    - **color**: Cor em hexadecimal (#RRGGBB)
    - **icon**: Identificador do ícone
    - **parent_id**: ID da categoria pai (para subcategorias)
    """
    category = await financial_service.create_category(
        current_user.id, category_data
    )
    
    logger.info(
        "Category created via API",
        user_id=current_user.id,
        category_id=category.id
    )
    
    return category




@router.put(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="Atualizar categoria",
    description="Atualiza uma categoria personalizada",
)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Atualizar uma categoria.
    
    - **category_id**: ID da categoria
    - Campos opcionais para atualização
    """
    category = await financial_service.update_category(
        current_user.id, category_id, category_data
    )
    
    logger.info(
        "Category updated via API",
        user_id=current_user.id,
        category_id=category_id
    )
    
    return category


@router.delete(
    "/categories/{category_id}",
    response_model=SuccessResponse,
    summary="Excluir categoria",
    description="Exclui uma categoria personalizada",
)
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Excluir uma categoria.
    
    - **category_id**: ID da categoria
    
    Nota: Não é possível excluir categorias que possuem transações associadas.
    """
    deleted = await financial_service.delete_category(
        current_user.id, category_id
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    logger.info(
        "Category deleted via API",
        user_id=current_user.id,
        category_id=category_id
    )
    
    return SuccessResponse(
        message="Categoria excluída com sucesso"
    )


# Financial Reports and Analysis

@router.get(
    "/summary",
    response_model=TransactionSummary,
    summary="Resumo financeiro",
    description="Obtém resumo das transações com totais e estatísticas",
)
async def get_transaction_summary(
    start_date: Optional[date] = Query(None, description="Data de início"),
    end_date: Optional[date] = Query(None, description="Data de fim"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Obter resumo financeiro.
    
    Calcula totais de receitas, despesas e estatísticas gerais.
    """
    summary = await financial_service.get_transaction_summary(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
    )
    
    return summary


@router.get(
    "/summary/categories",
    response_model=List[CategorySummary],
    summary="Resumo por categoria",
    description="Obtém resumo de gastos por categoria",
)
async def get_category_summary(
    transaction_type: Optional[TransactionType] = Query(
        TransactionType.EXPENSE, 
        description="Tipo de transação para análise"
    ),
    start_date: Optional[date] = Query(None, description="Data de início"),
    end_date: Optional[date] = Query(None, description="Data de fim"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Obter resumo por categoria.
    
    Analisa gastos ou receitas agrupados por categoria com percentuais.
    """
    summary = await financial_service.get_category_summary(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
    )
    
    return summary


@router.get(
    "/summary/monthly/{year}/{month}",
    response_model=MonthlySummary,
    summary="Resumo mensal",
    description="Obtém resumo financeiro de um mês específico",
)
async def get_monthly_summary(
    year: int = Path(..., ge=2020, le=2030, description="Ano"),
    month: int = Path(..., ge=1, le=12, description="Mês (1-12)"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Obter resumo mensal.
    
    Análise completa das finanças de um mês específico com breakdown por categoria.
    """
    summary = await financial_service.get_monthly_summary(
        user_id=current_user.id,
        year=year,
        month=month,
    )
    
    return summary


@router.get(
    "/overview",
    summary="Visão geral financeira",
    description="Obtém visão geral completa para o dashboard",
)
async def get_financial_overview(
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Obter visão geral financeira.
    
    Dados consolidados para exibição no dashboard principal.
    """
    try:
        overview = await financial_service.get_financial_overview(current_user.id)
        return overview
    except Exception as e:
        logger.error(f"Error in financial overview: {e}")
        # Return a basic overview structure
        return {
            "current_balance": 0,
            "monthly_income": 0,
            "monthly_expenses": 0,
            "savings": 0,
            "health_score": 0,
            "health_label": "Indisponível",
            "recent_transactions": [],
            "financial_goals": [],
            "alerts": [],
            "insights": {
                "health_score": 0,
                "health_label": "Indisponível",
                "risk_level": "low",
                "monthly_trend": "stable",
                "recommendations": []
            },
            "trends": {
                "income_trend": "stable",
                "expense_trend": "stable",
                "savings_trend": "stable"
            }
        }


@router.get(
    "/transactions/advanced",
    summary="Listar transações com filtros avançados",
    description="Endpoint robusto para o frontend com todos os dados necessários para filtros e paginação",
)
async def get_transactions_advanced(
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(20, ge=1, le=100, description="Itens por página"),
    transaction_type: Optional[TransactionType] = Query(None, description="Filtrar por tipo"),
    category_id: Optional[str] = Query(None, description="Filtrar por categoria"),
    search: Optional[str] = Query(None, min_length=1, description="Buscar na descrição"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Endpoint simplificado para listar transações com filtros.
    """
    try:
        # Build filters
        filters = TransactionFilter(
            type=transaction_type,
            category_id=category_id,
            search=search,
        )
        
        # Calculate pagination
        skip = (page - 1) * size
        
        # Get transactions with filters
        transactions, total_count = await financial_service.get_user_transactions(
            user_id=current_user.id,
            filters=filters,
            skip=skip,
            limit=size,
        )
        
        # Calculate pagination info
        total_pages = (total_count + size - 1) // size
        has_next = page < total_pages
        has_previous = page > 1
        
        # Calculate totals for filtered data
        total_income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
        total_expenses = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)
        net_amount = total_income - total_expenses
        
        # Get all categories for filter dropdown
        all_categories = await financial_service.get_user_categories(
            user_id=current_user.id,
            include_system=True,
            include_subcategories=True,
        )
        
        # Build response
        response = {
            "success": True,
            "data": {
                "transactions": transactions,
                "pagination": {
                    "current_page": page,
                    "page_size": size,
                    "total_items": total_count,
                    "total_pages": total_pages,
                    "has_next": has_next,
                    "has_previous": has_previous,
                    "next_page": page + 1 if has_next else None,
                    "previous_page": page - 1 if has_previous else None,
                },
                "totals": {
                    "income": float(total_income),
                    "expenses": float(total_expenses),
                    "net_amount": float(net_amount),
                },
                "available_categories": all_categories,
                "filters_applied": {
                    "transaction_type": transaction_type,
                    "category_id": category_id,
                    "search": search,
                },
                "metadata": {
                    "generated_at": "2025-09-15T02:00:00Z",
                    "api_version": "1.0.0",
                    "user_id": current_user.id,
                }
            }
        }
        
        return response
        
    except Exception as e:
        logger.error(
            "Error in advanced transactions query",
            user_id=current_user.id,
            error=str(e),
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao processar consulta de transações"
        )


# Statistics Endpoints

@router.get(
    "/transactions/stats",
    response_model=TransactionStats,
    summary="Estatísticas de transações",
    description="Obtém estatísticas das transações do usuário",
)
async def get_transaction_stats(
    start_date: Optional[date] = Query(None, description="Data de início"),
    end_date: Optional[date] = Query(None, description="Data de fim"),
    transaction_type: Optional[TransactionType] = Query(None, description="Filtrar por tipo"),
    category_id: Optional[str] = Query(None, description="Filtrar por categoria"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Obter estatísticas das transações do usuário.
    
    Retorna totais de receitas, despesas, saldo líquido e outras métricas.
    """
    # Build filters
    filters = TransactionFilter(
        type=transaction_type,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
    )
    
    stats = await financial_service.get_transaction_stats(
        user_id=current_user.id,
        filters=filters,
    )
    
    return TransactionStats(**stats)


# Category Endpoints

@router.get(
    "/categories",
    response_model=List[CategoryResponse],
    summary="Listar categorias",
    description="Lista as categorias disponíveis para o usuário",
)
async def get_categories(
    include_system: bool = Query(True, description="Incluir categorias do sistema"),
    include_subcategories: bool = Query(False, description="Incluir subcategorias"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Listar categorias disponíveis para o usuário.
    
    Inclui categorias do sistema e categorias personalizadas do usuário.
    """
    categories = await financial_service.get_user_categories(
        user_id=current_user.id,
        include_system=include_system,
        include_subcategories=include_subcategories,
    )
    
    return categories


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar categoria",
    description="Cria uma nova categoria personalizada",
)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Criar uma nova categoria personalizada.
    
    - **name**: Nome da categoria
    - **description**: Descrição opcional
    - **color**: Cor em hexadecimal
    - **icon**: Ícone opcional
    - **parent_id**: ID da categoria pai (para subcategorias)
    """
    category = await financial_service.create_category(
        user_id=current_user.id,
        category_data=category_data,
    )
    
    logger.info(
        "Category created via API",
        user_id=current_user.id,
        category_id=category.id
    )
    
    return category


@router.get(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="Obter categoria",
    description="Obtém uma categoria específica",
)
async def get_category(
    category_id: str = Path(..., description="ID da categoria"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Obter uma categoria específica.
    """
    category = await financial_service.get_category_by_id(
        user_id=current_user.id,
        category_id=category_id,
    )
    
    return category


@router.put(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="Atualizar categoria",
    description="Atualiza uma categoria existente",
)
async def update_category(
    category_id: str = Path(..., description="ID da categoria"),
    category_data: CategoryUpdate = ...,
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Atualizar uma categoria existente.
    """
    category = await financial_service.update_category(
        user_id=current_user.id,
        category_id=category_id,
        update_data=category_data,
    )
    
    logger.info(
        "Category updated via API",
        user_id=current_user.id,
        category_id=category_id
    )
    
    return category


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir categoria",
    description="Exclui uma categoria personalizada",
)
async def delete_category(
    category_id: str = Path(..., description="ID da categoria"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Excluir uma categoria personalizada.
    
    Apenas categorias personalizadas podem ser excluídas.
    """
    await financial_service.delete_category(
        user_id=current_user.id,
        category_id=category_id,
    )
    
    logger.info(
        "Category deleted via API",
        user_id=current_user.id,
        category_id=category_id
    )


# Financial Reports and Analytics Endpoints

@router.get(
    "/reports/export",
    summary="Exportar relatório financeiro",
    description="Exporta dados financeiros em diferentes formatos (CSV, XLSX, PDF)",
)
async def export_financial_report(
    format: str = Query(..., regex="^(csv|xlsx|pdf)$", description="Formato de exportação"),
    start_date: Optional[date] = Query(None, description="Data de início"),
    end_date: Optional[date] = Query(None, description="Data de fim"),
    transaction_type: Optional[TransactionType] = Query(None, description="Tipo de transação"),
    category_id: Optional[str] = Query(None, description="ID da categoria"),
    include_charts: bool = Query(False, description="Incluir gráficos no PDF"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Exportar relatório financeiro em diferentes formatos.
    
    Suporta exportação em CSV, XLSX e PDF com filtros opcionais.
    """
    from services.report_service import ReportService
    from schemas.report import ExportRequest, ExportFormat
    
    # Create export request
    export_request = ExportRequest(
        format=ExportFormat(format),
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        category_id=category_id,
        include_charts=include_charts
    )
    
    # Initialize report service
    report_service = ReportService(financial_service.db)
    
    # Export based on format
    if format == "csv":
        content, filename = await report_service.export_to_csv(current_user.id, export_request)
        media_type = "text/csv"
    elif format == "xlsx":
        content, filename = await report_service.export_to_xlsx(current_user.id, export_request)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif format == "pdf":
        content, filename = await report_service.export_to_pdf(current_user.id, export_request)
        media_type = "application/pdf"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de exportação não suportado"
        )
    
    logger.info(f"Report exported for user {current_user.id}, format: {format}")
    
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
    "/reports/analytics",
    response_model=List[AnalyticsData],
    summary="Dados analíticos financeiros",
    description="Obtém dados analíticos para gráficos avançados",
)
async def get_financial_analytics(
    start_date: Optional[date] = Query(None, description="Data de início"),
    end_date: Optional[date] = Query(None, description="Data de fim"),
    granularity: str = Query("monthly", regex="^(daily|weekly|monthly|yearly)$", description="Granularidade temporal"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Obter dados analíticos para gráficos avançados.
    
    Retorna dados agregados por período com granularidade configurável.
    """
    from services.report_service import ReportService
    from schemas.report import Granularity
    
    report_service = ReportService(financial_service.db)
    
    analytics_data = await report_service.get_analytics_data(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        granularity=Granularity(granularity)
    )
    
    logger.info(f"Analytics data retrieved for user {current_user.id}, granularity: {granularity}")
    return analytics_data


@router.get(
    "/reports/comparative",
    response_model=ComparativeReport,
    summary="Relatório comparativo",
    description="Compara dados financeiros entre dois períodos",
)
async def get_comparative_report(
    period1_start: date = Query(..., description="Data de início do período 1"),
    period1_end: date = Query(..., description="Data de fim do período 1"),
    period2_start: date = Query(..., description="Data de início do período 2"),
    period2_end: date = Query(..., description="Data de fim do período 2"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Gerar relatório comparativo entre dois períodos.
    
    Compara métricas financeiras e gera insights automáticos.
    """
    from services.report_service import ReportService
    
    report_service = ReportService(financial_service.db)
    
    comparative_report = await report_service.generate_comparative_report(
        user_id=current_user.id,
        period1_start=period1_start,
        period1_end=period1_end,
        period2_start=period2_start,
        period2_end=period2_end
    )
    
    logger.info(f"Comparative report generated for user {current_user.id}")
    return comparative_report


@router.get(
    "/reports/trends",
    response_model=TrendAnalysis,
    summary="Análise de tendências",
    description="Analisa tendências financeiras com previsões",
)
async def get_financial_trends(
    start_date: Optional[date] = Query(None, description="Data de início"),
    end_date: Optional[date] = Query(None, description="Data de fim"),
    trend_type: str = Query("net_worth", regex="^(net_worth|income|expenses|savings)$", description="Tipo de tendência"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Analisar tendências financeiras com previsões.
    
    Retorna análise de tendências com direção, confiança e previsões.
    """
    from services.report_service import ReportService
    from schemas.report import TrendType
    from datetime import timedelta
    
    # Set default date range if not provided
    if not start_date:
        start_date = date.today().replace(day=1) - timedelta(days=365)  # Last year
    if not end_date:
        end_date = date.today()
    
    report_service = ReportService(financial_service.db)
    
    trend_analysis = await report_service.analyze_trends(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        trend_type=TrendType(trend_type)
    )
    
    logger.info(f"Trend analysis completed for user {current_user.id}, type: {trend_type}")
    return trend_analysis


# Financial Goals Endpoints

@router.get(
    "/goals",
    response_model=List[GoalResponse],
    summary="Listar metas financeiras",
    description="Lista todas as metas financeiras do usuário",
)
async def get_financial_goals(
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
):
    """Obter metas financeiras do usuário."""
    goals = await goal_service.get_user_goals(current_user.id)
    return goals


@router.post(
    "/goals",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar meta financeira",
    description="Cria uma nova meta financeira",
)
async def create_financial_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
):
    """Criar nova meta financeira."""
    goal = await goal_service.create_goal(current_user.id, goal_data)
    return goal


@router.put(
    "/goals/{goal_id}",
    response_model=GoalResponse,
    summary="Atualizar meta financeira",
    description="Atualiza uma meta financeira existente",
)
async def update_financial_goal(
    goal_id: str,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
):
    """Atualizar meta financeira."""
    goal = await goal_service.update_goal(current_user.id, goal_id, goal_data)
    return goal


@router.delete(
    "/goals/{goal_id}",
    response_model=SuccessResponse,
    summary="Excluir meta financeira",
    description="Exclui uma meta financeira",
)
async def delete_financial_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
):
    """Excluir meta financeira."""
    await goal_service.delete_goal(current_user.id, goal_id)
    return SuccessResponse(message="Meta excluída com sucesso")


@router.put(
    "/goals/{goal_id}/progress",
    response_model=GoalResponse,
    summary="Atualizar progresso da meta",
    description="Atualiza o progresso de uma meta financeira",
)
async def update_goal_progress(
    goal_id: str,
    progress_data: GoalProgressUpdate,
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
):
    """Atualizar progresso da meta."""
    goal = await goal_service.update_goal_progress(
        current_user.id, goal_id, progress_data
    )
    return goal


# Financial Alerts Endpoints

@router.get(
    "/alerts",
    response_model=List[AlertResponse],
    summary="Listar alertas financeiros",
    description="Lista todos os alertas financeiros do usuário",
)
async def get_financial_alerts(
    current_user: User = Depends(get_current_user),
    alert_service: AlertService = Depends(get_alert_service),
):
    """Obter alertas financeiros do usuário."""
    alerts = await alert_service.get_user_alerts(current_user.id)
    return alerts


@router.post(
    "/alerts",
    response_model=AlertResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar alerta financeiro",
    description="Cria um novo alerta financeiro",
)
async def create_financial_alert(
    alert_data: AlertCreate,
    current_user: User = Depends(get_current_user),
    alert_service: AlertService = Depends(get_alert_service),
):
    """Criar novo alerta financeiro."""
    alert = await alert_service.create_alert(current_user.id, alert_data)
    return alert


@router.put(
    "/alerts/{alert_id}",
    response_model=AlertResponse,
    summary="Atualizar alerta financeiro",
    description="Atualiza um alerta financeiro existente",
)
async def update_financial_alert(
    alert_id: str,
    alert_data: AlertUpdate,
    current_user: User = Depends(get_current_user),
    alert_service: AlertService = Depends(get_alert_service),
):
    """Atualizar alerta financeiro."""
    alert = await alert_service.update_alert(current_user.id, alert_id, alert_data)
    return alert


@router.delete(
    "/alerts/{alert_id}",
    response_model=SuccessResponse,
    summary="Excluir alerta financeiro",
    description="Exclui um alerta financeiro",
)
async def delete_financial_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    alert_service: AlertService = Depends(get_alert_service),
):
    """Excluir alerta financeiro."""
    await alert_service.delete_alert(current_user.id, alert_id)
    return SuccessResponse(message="Alerta excluído com sucesso")


@router.put(
    "/alerts/{alert_id}/dismiss",
    response_model=AlertResponse,
    summary="Dispensar alerta",
    description="Dispensa um alerta financeiro",
)
async def dismiss_financial_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    alert_service: AlertService = Depends(get_alert_service),
):
    """Dispensar alerta financeiro."""
    alert = await alert_service.dismiss_alert(current_user.id, alert_id)
    return alert


@router.post(
    "/alerts/generate",
    response_model=List[AlertResponse],
    summary="Gerar alertas inteligentes",
    description="Gera alertas inteligentes baseados nos dados do usuário",
)
async def generate_smart_alerts(
    current_user: User = Depends(get_current_user),
    alert_service: AlertService = Depends(get_alert_service),
):
    """Gerar alertas inteligentes."""
    alerts = await alert_service.generate_smart_alerts(current_user.id)
    return alerts


