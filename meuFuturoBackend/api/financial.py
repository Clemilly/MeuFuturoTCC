"""
Financial API endpoints.

Handles transactions, categories, and financial reporting.
"""

from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
import structlog

from api.dependencies import (
    get_financial_service,
    get_current_user,
    PaginationParams,
    get_pagination_params,
)
from services.financial_service import FinancialService
from schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionFilter,
    TransactionSummary,
    CategorySummary,
    MonthlySummary,
)
from schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithSubcategories,
)
from schemas.common import PaginatedResponse, SuccessResponse
from models.user import User
from models.transaction import TransactionType

logger = structlog.get_logger()

router = APIRouter()


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
    response_model=PaginatedResponse[TransactionResponse],
    summary="Listar transações",
    description="Lista as transações do usuário com filtros e paginação",
)
async def get_transactions(
    pagination: PaginationParams = Depends(get_pagination_params),
    transaction_type: Optional[TransactionType] = Query(None, description="Filtrar por tipo"),
    category_id: Optional[str] = Query(None, description="Filtrar por categoria"),
    start_date: Optional[date] = Query(None, description="Data de início"),
    end_date: Optional[date] = Query(None, description="Data de fim"),
    min_amount: Optional[float] = Query(None, ge=0, description="Valor mínimo"),
    max_amount: Optional[float] = Query(None, ge=0, description="Valor máximo"),
    search: Optional[str] = Query(None, min_length=1, description="Buscar na descrição"),
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
    
    transactions, total_count = await financial_service.get_user_transactions(
        user_id=current_user.id,
        filters=filters,
        skip=pagination.skip,
        limit=pagination.limit,
    )
    
    # Calculate pagination info
    total_pages = (total_count + pagination.size - 1) // pagination.size
    has_next = pagination.page < total_pages
    has_previous = pagination.page > 1
    
    return PaginatedResponse(
        items=transactions,
        total=total_count,
        page=pagination.page,
        size=pagination.size,
        pages=total_pages,
        has_next=has_next,
        has_previous=has_previous,
    )


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


@router.get(
    "/categories",
    response_model=List[CategoryWithSubcategories],
    summary="Listar categorias",
    description="Lista todas as categorias disponíveis para o usuário",
)
async def get_categories(
    include_system: bool = Query(True, description="Incluir categorias do sistema"),
    include_subcategories: bool = Query(True, description="Incluir subcategorias"),
    current_user: User = Depends(get_current_user),
    financial_service: FinancialService = Depends(get_financial_service),
):
    """
    Listar categorias disponíveis.
    
    Inclui categorias do sistema e categorias personalizadas do usuário.
    """
    categories = await financial_service.get_user_categories(
        user_id=current_user.id,
        include_system=include_system,
        include_subcategories=include_subcategories,
    )
    
    return categories


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
    overview = await financial_service.get_financial_overview(current_user.id)
    
    return overview


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


