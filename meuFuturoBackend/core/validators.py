"""
Validation utilities for the MeuFuturo API.

Provides comprehensive input validation with proper error handling.
"""

import re
from typing import Any, Optional, List, Dict
from datetime import datetime, date
from decimal import Decimal, InvalidOperation
import structlog

from core.constants import ValidationLimits, ErrorMessages
from core.exceptions import ValidationError

logger = structlog.get_logger()


class BaseValidator:
    """Base validator class with common validation methods."""
    
    @staticmethod
    def validate_required(value: Any, field_name: str) -> None:
        """Validate that a required field is not None or empty."""
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ValidationError(
                message=f"{field_name} é obrigatório",
                details={"field": field_name, "value": value}
            )
    
    @staticmethod
    def validate_string_length(
        value: str, 
        field_name: str, 
        min_length: int, 
        max_length: int
    ) -> None:
        """Validate string length."""
        if not isinstance(value, str):
            raise ValidationError(
                message=f"{field_name} deve ser uma string",
                details={"field": field_name, "value": value, "type": type(value).__name__}
            )
        
        length = len(value.strip())
        if length < min_length:
            raise ValidationError(
                message=f"{field_name} deve ter pelo menos {min_length} caracteres",
                details={"field": field_name, "value": value, "min_length": min_length, "actual_length": length}
            )
        
        if length > max_length:
            raise ValidationError(
                message=f"{field_name} deve ter no máximo {max_length} caracteres",
                details={"field": field_name, "value": value, "max_length": max_length, "actual_length": length}
            )


class EmailValidator(BaseValidator):
    """Email validation utilities."""
    
    EMAIL_REGEX = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    @classmethod
    def validate_email(cls, email: str) -> str:
        """Validate email format and return normalized email."""
        cls.validate_required(email, "Email")
        cls.validate_string_length(
            email, "Email", 1, ValidationLimits.MAX_EMAIL_LENGTH
        )
        
        normalized_email = email.strip().lower()
        
        if not cls.EMAIL_REGEX.match(normalized_email):
            raise ValidationError(
                message=ErrorMessages.INVALID_EMAIL,
                details={"field": "email", "value": email}
            )
        
        return normalized_email


class PasswordValidator(BaseValidator):
    """Password validation utilities."""
    
    @classmethod
    def validate_password(cls, password: str) -> None:
        """Validate password strength."""
        cls.validate_required(password, "Senha")
        cls.validate_string_length(
            password, "Senha", 
            ValidationLimits.MIN_PASSWORD_LENGTH, 
            ValidationLimits.MAX_PASSWORD_LENGTH
        )
        
        # Check for at least one uppercase letter
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                message="Senha deve conter pelo menos uma letra maiúscula",
                details={"field": "password", "requirement": "uppercase_letter"}
            )
        
        # Check for at least one lowercase letter
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                message="Senha deve conter pelo menos uma letra minúscula",
                details={"field": "password", "requirement": "lowercase_letter"}
            )
        
        # Check for at least one digit
        if not re.search(r'\d', password):
            raise ValidationError(
                message="Senha deve conter pelo menos um dígito",
                details={"field": "password", "requirement": "digit"}
            )
        
        # Check for at least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError(
                message="Senha deve conter pelo menos um caractere especial",
                details={"field": "password", "requirement": "special_character"}
            )
    
    @classmethod
    def validate_password_confirmation(cls, password: str, confirm_password: str) -> None:
        """Validate password confirmation."""
        cls.validate_required(confirm_password, "Confirmação de senha")
        
        if password != confirm_password:
            raise ValidationError(
                message=ErrorMessages.PASSWORDS_DONT_MATCH,
                details={"field": "confirm_password", "password": password, "confirm_password": confirm_password}
            )


class AmountValidator(BaseValidator):
    """Amount validation utilities."""
    
    @classmethod
    def validate_amount(cls, amount: Any, field_name: str = "Valor") -> Decimal:
        """Validate and convert amount to Decimal."""
        cls.validate_required(amount, field_name)
        
        try:
            if isinstance(amount, str):
                # Remove currency symbols and spaces
                cleaned_amount = re.sub(r'[^\d.,-]', '', amount)
                # Replace comma with dot for decimal separator
                cleaned_amount = cleaned_amount.replace(',', '.')
                decimal_amount = Decimal(cleaned_amount)
            elif isinstance(amount, (int, float)):
                decimal_amount = Decimal(str(amount))
            else:
                raise ValidationError(
                    message=f"{field_name} deve ser um número",
                    details={"field": field_name, "value": amount, "type": type(amount).__name__}
                )
        except (InvalidOperation, ValueError) as e:
            raise ValidationError(
                message=f"{field_name} inválido",
                details={"field": field_name, "value": amount, "error": str(e)}
            )
        
        if decimal_amount < ValidationLimits.MIN_AMOUNT:
            raise ValidationError(
                message=f"{field_name} deve ser pelo menos {ValidationLimits.MIN_AMOUNT}",
                details={"field": field_name, "value": decimal_amount, "min_amount": ValidationLimits.MIN_AMOUNT}
            )
        
        if decimal_amount > ValidationLimits.MAX_AMOUNT:
            raise ValidationError(
                message=f"{field_name} deve ser no máximo {ValidationLimits.MAX_AMOUNT}",
                details={"field": field_name, "value": decimal_amount, "max_amount": ValidationLimits.MAX_AMOUNT}
            )
        
        return decimal_amount


class DateValidator(BaseValidator):
    """Date validation utilities."""
    
    @classmethod
    def validate_date_string(cls, date_str: str, field_name: str = "Data") -> date:
        """Validate and parse date string."""
        cls.validate_required(date_str, field_name)
        
        if not isinstance(date_str, str):
            raise ValidationError(
                message=f"{field_name} deve ser uma string",
                details={"field": field_name, "value": date_str, "type": type(date_str).__name__}
            )
        
        # Try different date formats
        date_formats = [
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%Y/%m/%d"
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str.strip(), fmt).date()
            except ValueError:
                continue
        
        raise ValidationError(
            message=f"{field_name} deve estar no formato YYYY-MM-DD",
            details={"field": field_name, "value": date_str, "expected_format": "YYYY-MM-DD"}
        )
    
    @classmethod
    def validate_date_range(cls, start_date: str, end_date: str) -> tuple[date, date]:
        """Validate date range."""
        start = cls.validate_date_string(start_date, "Data de início")
        end = cls.validate_date_string(end_date, "Data de fim")
        
        if start > end:
            raise ValidationError(
                message="Data de início deve ser anterior à data de fim",
                details={"start_date": start.isoformat(), "end_date": end.isoformat()}
            )
        
        return start, end


class PaginationValidator(BaseValidator):
    """Pagination validation utilities."""
    
    @classmethod
    def validate_pagination_params(cls, page: int, size: int) -> tuple[int, int]:
        """Validate pagination parameters."""
        if not isinstance(page, int) or page < 1:
            raise ValidationError(
                message="Página deve ser um número inteiro maior que 0",
                details={"field": "page", "value": page}
            )
        
        if not isinstance(size, int) or size < ValidationLimits.MIN_PAGE_SIZE:
            raise ValidationError(
                message=f"Tamanho da página deve ser pelo menos {ValidationLimits.MIN_PAGE_SIZE}",
                details={"field": "size", "value": size, "min_size": ValidationLimits.MIN_PAGE_SIZE}
            )
        
        if size > ValidationLimits.MAX_PAGE_SIZE:
            raise ValidationError(
                message=f"Tamanho da página deve ser no máximo {ValidationLimits.MAX_PAGE_SIZE}",
                details={"field": "size", "value": size, "max_size": ValidationLimits.MAX_PAGE_SIZE}
            )
        
        return page, size


class SearchValidator(BaseValidator):
    """Search validation utilities."""
    
    @classmethod
    def validate_search_term(cls, search: Optional[str]) -> Optional[str]:
        """Validate search term."""
        if search is None:
            return None
        
        if not isinstance(search, str):
            raise ValidationError(
                message="Termo de busca deve ser uma string",
                details={"field": "search", "value": search, "type": type(search).__name__}
            )
        
        search = search.strip()
        
        if len(search) < ValidationLimits.MIN_SEARCH_LENGTH:
            raise ValidationError(
                message=f"Termo de busca deve ter pelo menos {ValidationLimits.MIN_SEARCH_LENGTH} caractere",
                details={"field": "search", "value": search, "min_length": ValidationLimits.MIN_SEARCH_LENGTH}
            )
        
        if len(search) > ValidationLimits.MAX_SEARCH_LENGTH:
            raise ValidationError(
                message=f"Termo de busca deve ter no máximo {ValidationLimits.MAX_SEARCH_LENGTH} caracteres",
                details={"field": "search", "value": search, "max_length": ValidationLimits.MAX_SEARCH_LENGTH}
            )
        
        return search


class UUIDValidator(BaseValidator):
    """UUID validation utilities."""
    
    UUID_REGEX = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    
    @classmethod
    def validate_uuid(cls, uuid_str: str, field_name: str = "ID") -> str:
        """Validate UUID format."""
        cls.validate_required(uuid_str, field_name)
        
        if not isinstance(uuid_str, str):
            raise ValidationError(
                message=f"{field_name} deve ser uma string",
                details={"field": field_name, "value": uuid_str, "type": type(uuid_str).__name__}
            )
        
        uuid_str = uuid_str.strip()
        
        if not cls.UUID_REGEX.match(uuid_str):
            raise ValidationError(
                message=f"{field_name} deve ser um UUID válido",
                details={"field": field_name, "value": uuid_str}
            )
        
        return uuid_str


class TransactionValidator(BaseValidator):
    """Transaction validation utilities."""
    
    @classmethod
    def validate_transaction_type(cls, transaction_type: str) -> str:
        """Validate transaction type."""
        cls.validate_required(transaction_type, "Tipo de transação")
        
        valid_types = ["income", "expense", "transfer"]
        
        if transaction_type not in valid_types:
            raise ValidationError(
                message=f"Tipo de transação deve ser um dos seguintes: {', '.join(valid_types)}",
                details={"field": "transaction_type", "value": transaction_type, "valid_types": valid_types}
            )
        
        return transaction_type
    
    @classmethod
    def validate_description(cls, description: Optional[str]) -> Optional[str]:
        """Validate transaction description."""
        if description is None:
            return None
        
        if not isinstance(description, str):
            raise ValidationError(
                message="Descrição deve ser uma string",
                details={"field": "description", "value": description, "type": type(description).__name__}
            )
        
        description = description.strip()
        
        if len(description) > ValidationLimits.MAX_DESCRIPTION_LENGTH:
            raise ValidationError(
                message=f"Descrição deve ter no máximo {ValidationLimits.MAX_DESCRIPTION_LENGTH} caracteres",
                details={"field": "description", "value": description, "max_length": ValidationLimits.MAX_DESCRIPTION_LENGTH}
            )
        
        return description if description else None


class CategoryValidator(BaseValidator):
    """Category validation utilities."""
    
    @classmethod
    def validate_category_name(cls, name: str) -> str:
        """Validate category name."""
        cls.validate_required(name, "Nome da categoria")
        cls.validate_string_length(
            name, "Nome da categoria",
            ValidationLimits.MIN_CATEGORY_NAME_LENGTH,
            ValidationLimits.MAX_CATEGORY_NAME_LENGTH
        )
        
        return name.strip()
    
    @classmethod
    def validate_category_description(cls, description: Optional[str]) -> Optional[str]:
        """Validate category description."""
        if description is None:
            return None
        
        if not isinstance(description, str):
            raise ValidationError(
                message="Descrição da categoria deve ser uma string",
                details={"field": "description", "value": description, "type": type(description).__name__}
            )
        
        description = description.strip()
        
        if len(description) > ValidationLimits.MAX_CATEGORY_DESCRIPTION_LENGTH:
            raise ValidationError(
                message=f"Descrição da categoria deve ter no máximo {ValidationLimits.MAX_CATEGORY_DESCRIPTION_LENGTH} caracteres",
                details={"field": "description", "value": description, "max_length": ValidationLimits.MAX_CATEGORY_DESCRIPTION_LENGTH}
            )
        
        return description if description else None
