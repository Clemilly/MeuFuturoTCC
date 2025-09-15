"""
Application constants and configuration values.

Centralizes all magic numbers, strings, and configuration values.
"""

from enum import Enum
from typing import Final

# HTTP Status Codes
class HTTPStatus:
    """HTTP status codes used throughout the application."""
    OK: int = 200
    CREATED: int = 201
    NO_CONTENT: int = 204
    BAD_REQUEST: int = 400
    UNAUTHORIZED: int = 401
    FORBIDDEN: int = 403
    NOT_FOUND: int = 404
    CONFLICT: int = 409
    UNPROCESSABLE_ENTITY: int = 422
    INTERNAL_SERVER_ERROR: int = 500

# Error Messages
class ErrorMessages:
    """Standardized error messages."""
    # Authentication
    INVALID_CREDENTIALS: str = "Email ou senha incorretos"
    TOKEN_INVALID: str = "Token inválido ou expirado"
    TOKEN_MISSING: str = "Token de autenticação necessário"
    USER_NOT_FOUND: str = "Usuário não encontrado"
    USER_INACTIVE: str = "Conta de usuário inativa"
    EMAIL_NOT_VERIFIED: str = "Email não verificado. Verifique seu email antes de continuar."
    EMAIL_ALREADY_EXISTS: str = "Email já está em uso"
    
    # Authorization
    ACCESS_DENIED: str = "Acesso negado a este recurso"
    INSUFFICIENT_PERMISSIONS: str = "Permissões insuficientes"
    
    # Validation
    INVALID_INPUT: str = "Dados de entrada inválidos"
    REQUIRED_FIELD: str = "Campo obrigatório"
    INVALID_EMAIL: str = "Email inválido"
    WEAK_PASSWORD: str = "Senha muito fraca"
    PASSWORDS_DONT_MATCH: str = "Senhas não coincidem"
    
    # Resources
    RESOURCE_NOT_FOUND: str = "Recurso não encontrado"
    RESOURCE_ALREADY_EXISTS: str = "Recurso já existe"
    RESOURCE_CONFLICT: str = "Conflito de recursos"
    
    # System
    INTERNAL_ERROR: str = "Erro interno do servidor"
    DATABASE_ERROR: str = "Erro de banco de dados"
    EXTERNAL_SERVICE_ERROR: str = "Erro em serviço externo"
    RATE_LIMIT_EXCEEDED: str = "Limite de requisições excedido"

# Success Messages
class SuccessMessages:
    """Standardized success messages."""
    USER_CREATED: str = "Usuário criado com sucesso"
    USER_UPDATED: str = "Usuário atualizado com sucesso"
    USER_DELETED: str = "Usuário removido com sucesso"
    LOGIN_SUCCESS: str = "Login realizado com sucesso"
    LOGOUT_SUCCESS: str = "Logout realizado com sucesso"
    PASSWORD_CHANGED: str = "Senha alterada com sucesso"
    EMAIL_VERIFIED: str = "Email verificado com sucesso"
    TWO_FA_ENABLED: str = "Autenticação de duas etapas habilitada"
    TWO_FA_DISABLED: str = "Autenticação de duas etapas desabilitada"

# Validation Constants
class ValidationLimits:
    """Validation limits and constraints."""
    # User
    MIN_PASSWORD_LENGTH: int = 8
    MAX_PASSWORD_LENGTH: int = 128
    MIN_NAME_LENGTH: int = 2
    MAX_NAME_LENGTH: int = 100
    MAX_EMAIL_LENGTH: int = 255
    
    # Transaction
    MIN_AMOUNT: float = 0.01
    MAX_AMOUNT: float = 1000000.00
    MAX_DESCRIPTION_LENGTH: int = 500
    
    # Category
    MIN_CATEGORY_NAME_LENGTH: int = 2
    MAX_CATEGORY_NAME_LENGTH: int = 100
    MAX_CATEGORY_DESCRIPTION_LENGTH: int = 500
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    MIN_PAGE_SIZE: int = 1
    
    # Search
    MIN_SEARCH_LENGTH: int = 1
    MAX_SEARCH_LENGTH: int = 255
    
    # 2FA
    TOTP_SECRET_LENGTH: int = 32
    TOTP_TOKEN_LENGTH: int = 6
    TOTP_WINDOW: int = 1  # ±30 seconds

# Database Constants
class DatabaseConstants:
    """Database-related constants."""
    UUID_LENGTH: int = 36
    MAX_RETRIES: int = 3
    RETRY_DELAY: float = 0.1
    BATCH_SIZE: int = 1000

# Security Constants
class SecurityConstants:
    """Security-related constants."""
    # JWT
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 1
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    
    # Password
    PASSWORD_HASH_ROUNDS: int = 12
    PASSWORD_MIN_SPECIAL_CHARS: int = 1
    PASSWORD_MIN_UPPERCASE: int = 1
    PASSWORD_MIN_LOWERCASE: int = 1
    PASSWORD_MIN_DIGITS: int = 1
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    RATE_LIMIT_BURST: int = 10

# Cache Constants
class CacheConstants:
    """Cache-related constants."""
    DEFAULT_TTL: int = 300  # 5 minutes
    USER_CACHE_TTL: int = 600  # 10 minutes
    STATS_CACHE_TTL: int = 1800  # 30 minutes
    MAX_CACHE_SIZE: int = 1000

# Logging Constants
class LoggingConstants:
    """Logging-related constants."""
    LOG_FORMAT: str = "json"
    LOG_LEVEL: str = "INFO"
    MAX_LOG_SIZE: int = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT: int = 5

# API Constants
class APIConstants:
    """API-related constants."""
    API_VERSION: str = "v1"
    API_PREFIX: str = f"/api/{API_VERSION}"
    OPENAPI_URL: str = f"{API_PREFIX}/openapi.json"
    DOCS_URL: str = f"{API_PREFIX}/docs"
    REDOC_URL: str = f"{API_PREFIX}/redoc"
    
    # Headers
    CONTENT_TYPE_JSON: str = "application/json"
    CONTENT_TYPE_FORM: str = "application/x-www-form-urlencoded"
    
    # CORS
    ALLOWED_METHODS: list[str] = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    ALLOWED_HEADERS: list[str] = ["*"]
    MAX_AGE: int = 3600

# Enums
class TransactionType(str, Enum):
    """Transaction type enumeration."""
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"

class TransactionStatus(str, Enum):
    """Transaction status enumeration."""
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class UserRole(str, Enum):
    """User role enumeration."""
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class UserStatus(str, Enum):
    """User status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"

# Environment Constants
class Environment:
    """Environment-related constants."""
    DEVELOPMENT: str = "development"
    STAGING: str = "staging"
    PRODUCTION: str = "production"
    TESTING: str = "testing"

# File Constants
class FileConstants:
    """File-related constants."""
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    ALLOWED_DOCUMENT_TYPES: list[str] = ["application/pdf", "text/plain", "application/msword"]
    UPLOAD_DIRECTORY: str = "uploads"
    TEMP_DIRECTORY: str = "temp"
