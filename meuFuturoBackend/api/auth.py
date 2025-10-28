"""
Authentication API endpoints.

Handles user registration, login, 2FA, and profile management.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
import structlog

from api.dependencies import get_auth_service, get_current_user
from services.auth_service import AuthService
from schemas.user import (
    UserCreate,
    UserUpdate,
    UserLogin,
    UserResponse,
    UserProfile,
    AccessibilityPreferences,
    FinancialProfile,
    PasswordChange,
)
from schemas.common import TokenResponse, SuccessResponse, MessageResponse
from models.user import User

logger = structlog.get_logger()

router = APIRouter()
security = HTTPBearer()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar novo usuário",
    description="Cria uma nova conta de usuário no sistema",
    dependencies=[],  # Explicitly no authentication required
)
async def register(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Registrar um novo usuário.
    
    - **email**: Email único do usuário
    - **name**: Nome completo do usuário
    - **password**: Senha (mínimo 8 caracteres)
    """
    user = await auth_service.register_user(user_data)
    
    logger.info("User registered via API", user_id=user.id)
    
    return user


@router.post(
    "/login",
    summary="Fazer login",
    description="Autentica o usuário e retorna token de acesso",
    dependencies=[],  # Explicitly no authentication required
)
async def login(
    login_data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Fazer login no sistema.
    
    - **email**: Email do usuário
    - **password**: Senha do usuário
    
    Retorna token de acesso ou solicita código 2FA se habilitado.
    """
    result = await auth_service.login(login_data)
    
    return {
        "access_token": result["access_token"],
        "token_type": result["token_type"],
        "expires_in": result["expires_in"],
        "user": result["user"],
        "requiresTwoFactor": False
    }


@router.get(
    "/profile",
    response_model=UserProfile,
    summary="Obter perfil do usuário",
    description="Retorna o perfil completo do usuário autenticado",
)
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Obter perfil do usuário autenticado.
    
    Inclui informações pessoais, preferências de acessibilidade e perfil financeiro.
    """
    return current_user


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Atualizar perfil",
    description="Atualiza as informações do perfil do usuário",
)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Atualizar perfil do usuário.
    
    - **name**: Nome do usuário (opcional)
    - **bio**: Biografia do usuário (opcional)
    - **avatar_url**: URL do avatar (opcional)
    """
    updated_user = await auth_service.update_user_profile(
        current_user.id, profile_data
    )
    
    return updated_user


@router.post(
    "/change-password",
    response_model=SuccessResponse,
    summary="Alterar senha",
    description="Altera a senha do usuário autenticado",
)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Alterar senha do usuário.
    
    - **current_password**: Senha atual
    - **new_password**: Nova senha (mínimo 8 caracteres)
    """
    await auth_service.change_password(
        current_user.id,
        password_data.current_password,
        password_data.new_password,
    )
    
    return SuccessResponse(
        message="Senha alterada com sucesso"
    )

@router.put(
    "/preferences/accessibility",
    response_model=UserResponse,
    summary="Atualizar preferências de acessibilidade",
    description="Atualiza as configurações de acessibilidade do usuário",
)
async def update_accessibility_preferences(
    preferences: AccessibilityPreferences,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Atualizar preferências de acessibilidade.
    
    - **theme**: Tema (light/dark/auto)
    - **font_size**: Tamanho da fonte (small/medium/large)
    - **high_contrast**: Contraste alto
    - **reduce_motion**: Reduzir animações
    - **screen_reader**: Otimizações para leitor de tela
    - **keyboard_navigation**: Navegação aprimorada por teclado
    - **voice_commands**: Suporte a comandos de voz
    """
    updated_user = await auth_service.update_accessibility_preferences(
        current_user.id, preferences.model_dump(exclude_none=True)
    )
    
    return updated_user


@router.put(
    "/preferences/financial",
    response_model=UserResponse,
    summary="Atualizar perfil financeiro",
    description="Atualiza o perfil e preferências financeiras do usuário",
)
async def update_financial_profile(
    profile: FinancialProfile,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Atualizar perfil financeiro.
    
    - **default_currency**: Moeda padrão
    - **monthly_income**: Renda mensal
    - **monthly_budget**: Orçamento mensal
    - **financial_goals**: Metas financeiras
    - **risk_tolerance**: Tolerância ao risco
    - **investment_experience**: Experiência com investimentos
    """
    updated_user = await auth_service.update_financial_profile(
        current_user.id, profile.model_dump(exclude_none=True)
    )
    
    return updated_user


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Informações básicas do usuário",
    description="Retorna informações básicas do usuário autenticado",
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Obter informações básicas do usuário autenticado.
    
    Endpoint simplificado para obter dados básicos do usuário.
    """
    return current_user


@router.post(
    "/logout",
    response_model=SuccessResponse,
    summary="Fazer logout",
    description="Encerra a sessão do usuário",
)
async def logout(
    current_user: User = Depends(get_current_user),
):
    """
    Fazer logout do sistema.
    
    Encerra a sessão do usuário atual. Em um sistema JWT stateless,
    o logout é feito no lado do cliente removendo o token.
    """
    logger.info("User logged out via API", user_id=current_user.id)
    
    return SuccessResponse(
        message="Logout realizado com sucesso"
    )