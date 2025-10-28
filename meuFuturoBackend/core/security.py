"""
Authentication and security utilities.

Handles JWT tokens, password hashing, and user authentication.
"""

from datetime import datetime, timedelta
from typing import Optional, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt_sha256
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog

from core.config import settings
from core.constants import SecurityConstants, ErrorMessages
from core.exceptions import AuthenticationError, InvalidCredentialsError
from core.validators import EmailValidator, PasswordValidator

logger = structlog.get_logger()

# Password hashing with improved security
# Using bcrypt_sha256 to avoid 72-byte limitation
pwd_context = CryptContext(
    schemes=["bcrypt_sha256"], 
    deprecated="auto",
    bcrypt_sha256__rounds=SecurityConstants.PASSWORD_HASH_ROUNDS,
    bcrypt_sha256__min_rounds=10,
    bcrypt_sha256__max_rounds=15
)

# JWT token security
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash.
    
    Args:
        plain_password: The plain text password
        hashed_password: The hashed password from database
        
    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        # Validate inputs
        if not plain_password or not hashed_password:
            logger.warning("Empty password or hash provided")
            return False
        
        # Verify password using bcrypt_sha256
        is_valid = pwd_context.verify(plain_password, hashed_password)
        
        logger.debug("Password verification completed", valid=is_valid)
        return is_valid
        
    except Exception as e:
        logger.error("Password verification error", error=str(e), error_type=type(e).__name__)
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password for storing in database.
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    try:
        # Validate password is not empty
        if not password or not password.strip():
            raise AuthenticationError("Senha não pode estar vazia")
        
        # Check password length (bcrypt_sha256 can handle longer passwords)
        if len(password) > 1000:  # Reasonable upper limit
            raise AuthenticationError("Senha muito longa (máximo 1000 caracteres)")
        
        # Hash the password using bcrypt_sha256
        hashed = pwd_context.hash(password)
        
        logger.debug("Password hashed successfully", password_length=len(password))
        return hashed
        
    except AuthenticationError:
        # Re-raise authentication errors
        raise
    except Exception as e:
        logger.error("Password hashing error", error=str(e), error_type=type(e).__name__)
        raise AuthenticationError("Erro ao processar senha")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in token
        expires_delta: Optional custom expiration time
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    logger.info("Access token created", subject=data.get("sub"), expires_at=expire.isoformat())
    
    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token missing subject")
            raise credentials_exception
            
        logger.debug("Token verified successfully", user_id=user_id)
        return payload
        
    except JWTError as e:
        logger.warning("JWT verification failed", error=str(e))
        raise credentials_exception


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    FastAPI dependency to get current user ID from JWT token.
    
    Args:
        credentials: HTTP Authorization credentials
        
    Returns:
        str: Current user ID
        
    Raises:
        HTTPException: If token is invalid
    """
    payload = verify_token(credentials.credentials)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id


class SecurityService:
    """Service class for security-related operations."""
    
    @staticmethod
    def create_password_reset_token(user_id: str) -> str:
        """
        Create a password reset token.
        
        Args:
            user_id: User ID
            
        Returns:
            str: Password reset token
        """
        data = {
            "sub": user_id,
            "purpose": "password_reset",
        }
        
        # Password reset tokens expire in 1 hour
        expires_delta = timedelta(hours=1)
        
        return create_access_token(data, expires_delta)
    
    @staticmethod
    def verify_password_reset_token(token: str) -> Optional[str]:
        """
        Verify a password reset token.
        
        Args:
            token: Password reset token
            
        Returns:
            Optional[str]: User ID if token is valid, None otherwise
        """
        try:
            payload = verify_token(token)
            
            if payload.get("purpose") != "password_reset":
                return None
                
            return payload.get("sub")
            
        except HTTPException:
            return None
    
    @staticmethod
    def create_email_verification_token(user_id: str, email: str) -> str:
        """
        Create an email verification token.
        
        Args:
            user_id: User ID
            email: Email address to verify
            
        Returns:
            str: Email verification token
        """
        data = {
            "sub": user_id,
            "email": email,
            "purpose": "email_verification",
        }
        
        # Email verification tokens expire in 24 hours
        expires_delta = timedelta(hours=24)
        
        return create_access_token(data, expires_delta)
    
    @staticmethod
    def verify_email_verification_token(token: str) -> Optional[tuple[str, str]]:
        """
        Verify an email verification token.
        
        Args:
            token: Email verification token
            
        Returns:
            Optional[tuple[str, str]]: (user_id, email) if token is valid, None otherwise
        """
        try:
            payload = verify_token(token)
            
            if payload.get("purpose") != "email_verification":
                return None
                
            user_id = payload.get("sub")
            email = payload.get("email")
            
            if not user_id or not email:
                return None
                
            return user_id, email
            
        except HTTPException:
            return None
