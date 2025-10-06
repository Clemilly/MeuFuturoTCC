"""
Application configuration using Pydantic BaseSettings.

All configuration is loaded from environment variables with sensible defaults.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator
import secrets

from core.constants import (
    SecurityConstants, 
    LoggingConstants, 
    APIConstants, 
    Environment,
    ValidationLimits
)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    PROJECT_NAME: str = "MeuFuturo API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Sistema de gestão financeira pessoal com foco em acessibilidade"
    API_V1_PREFIX: str = APIConstants.API_PREFIX
    
    # Environment
    ENVIRONMENT: str = Environment.DEVELOPMENT
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = SecurityConstants.JWT_ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES: int = SecurityConstants.ACCESS_TOKEN_EXPIRE_MINUTES
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:meufuturo123@localhost:5432/meufuturo"
    TEST_DATABASE_URL: Optional[str] = None
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,*"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from string."""
        return [i.strip() for i in self.ALLOWED_ORIGINS.split(",")]
    
    # External APIs
    OPENAI_API_KEY: Optional[str] = None
    EXCHANGE_RATE_API_KEY: Optional[str] = None
    
    # Email Configuration
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Logging
    LOG_LEVEL: str = LoggingConstants.LOG_LEVEL
    LOG_FORMAT: str = LoggingConstants.LOG_FORMAT
    
    # AI/ML Configuration
    AI_PREDICTION_ENABLED: bool = True
    AI_CONFIDENCE_THRESHOLD: float = 0.7
    
    # Financial Constants
    DEFAULT_CURRENCY: str = "BRL"
    MAX_TRANSACTION_AMOUNT: float = ValidationLimits.MAX_AMOUNT
    MIN_TRANSACTION_AMOUNT: float = ValidationLimits.MIN_AMOUNT
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = ValidationLimits.DEFAULT_PAGE_SIZE
    MAX_PAGE_SIZE: int = ValidationLimits.MAX_PAGE_SIZE
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = SecurityConstants.RATE_LIMIT_PER_MINUTE
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()
