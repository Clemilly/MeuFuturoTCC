"""
Custom exceptions for the MeuFuturo API.

Provides structured exception handling with proper HTTP status codes and logging.
"""

from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import structlog

from core.constants import ErrorMessages, HTTPStatus

logger = structlog.get_logger()


class MeuFuturoException(Exception):
    """Base exception for MeuFuturo API."""
    
    def __init__(
        self,
        message: str,
        status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
        log_level: str = "error"
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        self.log_level = log_level
        super().__init__(self.message)
        
        # Log the exception
        self._log_exception()
    
    def _log_exception(self) -> None:
        """Log the exception with appropriate level."""
        log_data = {
            "exception_type": self.__class__.__name__,
            "message": self.message,
            "status_code": self.status_code,
            "details": self.details
        }
        
        if self.log_level == "warning":
            logger.warning("API Warning", **log_data)
        elif self.log_level == "info":
            logger.info("API Info", **log_data)
        else:
            logger.error("API Error", **log_data)
    
    def to_http_exception(self) -> HTTPException:
        """Convert to FastAPI HTTPException."""
        return HTTPException(
            status_code=self.status_code,
            detail={
                "error": True,
                "message": self.message,
                "status_code": self.status_code,
                "details": self.details
            }
        )


class AuthenticationError(MeuFuturoException):
    """Authentication-related exceptions."""
    
    def __init__(
        self,
        message: str = ErrorMessages.INVALID_CREDENTIALS,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=HTTPStatus.UNAUTHORIZED,
            details=details,
            log_level="warning"
        )


class AuthorizationError(MeuFuturoException):
    """Authorization-related exceptions."""
    
    def __init__(
        self,
        message: str = ErrorMessages.ACCESS_DENIED,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=HTTPStatus.FORBIDDEN,
            details=details,
            log_level="warning"
        )


class ValidationError(MeuFuturoException):
    """Validation-related exceptions."""
    
    def __init__(
        self,
        message: str = ErrorMessages.INVALID_INPUT,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=HTTPStatus.UNPROCESSABLE_ENTITY,
            details=details,
            log_level="warning"
        )


class ResourceNotFoundError(MeuFuturoException):
    """Resource not found exceptions."""
    
    def __init__(
        self,
        resource_type: str = "Resource",
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        message = f"{resource_type} não encontrado"
        if resource_id:
            message += f" (ID: {resource_id})"
        
        super().__init__(
            message=message,
            status_code=HTTPStatus.NOT_FOUND,
            details=details,
            log_level="info"
        )


class ResourceConflictError(MeuFuturoException):
    """Resource conflict exceptions."""
    
    def __init__(
        self,
        message: str = ErrorMessages.RESOURCE_CONFLICT,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=HTTPStatus.CONFLICT,
            details=details,
            log_level="warning"
        )


class DatabaseError(MeuFuturoException):
    """Database-related exceptions."""
    
    def __init__(
        self,
        message: str = ErrorMessages.DATABASE_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            details=details,
            log_level="error"
        )


class ExternalServiceError(MeuFuturoException):
    """External service-related exceptions."""
    
    def __init__(
        self,
        service_name: str,
        message: str = ErrorMessages.EXTERNAL_SERVICE_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        full_message = f"{message} (Service: {service_name})"
        super().__init__(
            message=full_message,
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            details=details,
            log_level="error"
        )


class RateLimitError(MeuFuturoException):
    """Rate limiting exceptions."""
    
    def __init__(
        self,
        message: str = ErrorMessages.RATE_LIMIT_EXCEEDED,
        retry_after: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if retry_after:
            details = details or {}
            details["retry_after"] = retry_after
        
        super().__init__(
            message=message,
            status_code=429,  # Too Many Requests
            details=details,
            log_level="warning"
        )


class BusinessLogicError(MeuFuturoException):
    """Business logic-related exceptions."""
    
    def __init__(
        self,
        message: str,
        status_code: int = HTTPStatus.BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=status_code,
            details=details,
            log_level="warning"
        )


# Specific business exceptions
class UserNotFoundError(ResourceNotFoundError):
    """User not found exception."""
    
    def __init__(self, user_id: Optional[str] = None, email: Optional[str] = None):
        details = {}
        if user_id:
            details["user_id"] = user_id
        if email:
            details["email"] = email
        
        super().__init__(
            resource_type="Usuário",
            resource_id=user_id,
            details=details
        )


class EmailAlreadyExistsError(ResourceConflictError):
    """Email already exists exception."""
    
    def __init__(self, email: str):
        super().__init__(
            message=ErrorMessages.EMAIL_ALREADY_EXISTS,
            details={"email": email}
        )


class InvalidCredentialsError(AuthenticationError):
    """Invalid credentials exception."""
    
    def __init__(self, email: Optional[str] = None):
        details = {}
        if email:
            details["email"] = email
        
        super().__init__(
            message=ErrorMessages.INVALID_CREDENTIALS,
            details=details
        )


class InsufficientPermissionsError(AuthorizationError):
    """Insufficient permissions exception."""
    
    def __init__(self, required_permission: Optional[str] = None):
        details = {}
        if required_permission:
            details["required_permission"] = required_permission
        
        super().__init__(
            message=ErrorMessages.INSUFFICIENT_PERMISSIONS,
            details=details
        )


class TransactionNotFoundError(ResourceNotFoundError):
    """Transaction not found exception."""
    
    def __init__(self, transaction_id: Optional[str] = None):
        super().__init__(
            resource_type="Transação",
            resource_id=transaction_id
        )


class CategoryNotFoundError(ResourceNotFoundError):
    """Category not found exception."""
    
    def __init__(self, category_id: Optional[str] = None):
        super().__init__(
            resource_type="Categoria",
            resource_id=category_id
        )


class InvalidAmountError(ValidationError):
    """Invalid amount exception."""
    
    def __init__(self, amount: float, min_amount: float, max_amount: float):
        super().__init__(
            message=f"Valor inválido: {amount}. Deve estar entre {min_amount} e {max_amount}",
            details={
                "amount": amount,
                "min_amount": min_amount,
                "max_amount": max_amount
            }
        )


class InvalidDateRangeError(ValidationError):
    """Invalid date range exception."""
    
    def __init__(self, start_date: str, end_date: str):
        super().__init__(
            message="Intervalo de datas inválido",
            details={
                "start_date": start_date,
                "end_date": end_date
            }
        )


class TwoFactorRequiredError(AuthenticationError):
    """Two-factor authentication required exception."""
    
    def __init__(self, user_id: str):
        super().__init__(
            message="Autenticação de duas etapas necessária",
            details={"user_id": user_id}
        )


class InvalidTwoFactorTokenError(AuthenticationError):
    """Invalid two-factor token exception."""
    
    def __init__(self):
        super().__init__(
            message="Código de verificação inválido",
            details={}
        )


class EmailNotVerifiedError(AuthorizationError):
    """Email not verified exception."""
    
    def __init__(self, email: str):
        super().__init__(
            message=ErrorMessages.EMAIL_NOT_VERIFIED,
            details={"email": email}
        )


class UserInactiveError(AuthorizationError):
    """User inactive exception."""
    
    def __init__(self, user_id: str):
        super().__init__(
            message=ErrorMessages.USER_INACTIVE,
            details={"user_id": user_id}
        )
