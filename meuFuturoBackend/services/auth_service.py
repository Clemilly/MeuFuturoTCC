"""
Authentication service for user management and security operations.

Handles user registration, login, 2FA, and profile management.
"""

from typing import Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import structlog

from core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    generate_totp_secret,
    verify_totp_token,
)
from core.validators import PasswordValidator
from core.config import settings
from repositories.user import UserRepository
from schemas.user import UserCreate, UserUpdate, UserLogin
from models.user import User

logger = structlog.get_logger()


class AuthService:
    """Service for authentication and user management operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
    
    async def register_user(self, user_data: UserCreate) -> User:
        """
        Register a new user.
        
        Args:
            user_data: User registration data
            
        Returns:
            Created user instance
            
        Raises:
            HTTPException: If email already exists or password is invalid
        """
        # Validate password strength
        PasswordValidator.validate_password(user_data.password)
        
        # Check if email already exists
        if await self.user_repo.email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = await self.user_repo.create(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
            is_active=True,
            is_verified=False,  # Email verification required
            two_factor_enabled=False,
        )
        
        logger.info("User registered", user_id=user.id, email=user.email)
        
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user with email and password.
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            User instance if authentication successful, None otherwise
        """
        user = await self.user_repo.get_by_email(email)
        
        if not user:
            logger.warning("User not found", email=email)
            return None
        
        if not user.is_active:
            logger.warning("User inactive", user_id=user.id, email=email)
            return None
        
        password_valid = verify_password(password, user.hashed_password)
        logger.debug("Password verification", email=email, valid=password_valid)
        
        if not password_valid:
            logger.warning("Invalid password", user_id=user.id, email=email)
            return None
        
        logger.info("User authenticated", user_id=user.id, email=user.email)
        
        return user
    
    async def login(self, login_data: UserLogin) -> Dict[str, Any]:
        """
        Login a user and return access token.
        
        Args:
            login_data: Login credentials
            
        Returns:
            Dictionary with token and user info
            
        Raises:
            HTTPException: If authentication fails
        """
        user = await self.authenticate_user(login_data.email, login_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Check if 2FA is required
        if user.is_2fa_enabled:
            # Return special response indicating 2FA is required
            return {
                "requires_2fa": True,
                "user_id": user.id,
                "message": "Código de verificação necessário"
            }
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        
        logger.info("User logged in", user_id=user.id, email=user.email)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user,
            "requires_2fa": False
        }
    
    async def verify_2fa_and_login(self, user_id: str, totp_code: str) -> Dict[str, Any]:
        """
        Verify 2FA code and complete login.
        
        Args:
            user_id: User ID
            totp_code: 6-digit TOTP code
            
        Returns:
            Dictionary with token and user info
            
        Raises:
            HTTPException: If verification fails
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado ou inativo"
            )
        
        if not user.is_2fa_enabled or not user.two_factor_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA não está habilitado para este usuário"
            )
        
        # Verify TOTP code
        if not verify_totp_token(user.two_factor_secret, totp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Código de verificação inválido"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        
        logger.info("User completed 2FA login", user_id=user.id, email=user.email)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user
        }
    
    async def get_user_profile(self, user_id: str) -> User:
        """
        Get user profile by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User instance
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return user
    
    async def update_user_profile(self, user_id: str, update_data: UserUpdate) -> User:
        """
        Update user profile.
        
        Args:
            user_id: User ID
            update_data: Profile update data
            
        Returns:
            Updated user instance
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Prepare update data
        update_fields = {}
        if update_data.name is not None:
            update_fields["name"] = update_data.name
        if update_data.bio is not None:
            update_fields["bio"] = update_data.bio
        if update_data.avatar_url is not None:
            update_fields["avatar_url"] = update_data.avatar_url
        
        updated_user = await self.user_repo.update(user_id, **update_fields)
        
        logger.info("User profile updated", user_id=user_id, fields=list(update_fields.keys()))
        
        return updated_user
    
    async def change_password(self, user_id: str, current_password: str, new_password: str) -> bool:
        """
        Change user password.
        
        Args:
            user_id: User ID
            current_password: Current password
            new_password: New password
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If current password is incorrect or user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Verify current password
        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha atual incorreta"
            )
        
        # Hash new password
        new_hashed_password = get_password_hash(new_password)
        
        # Update password
        await self.user_repo.update(user_id, hashed_password=new_hashed_password)
        
        logger.info("User password changed", user_id=user_id)
        
        return True
    
    async def setup_2fa(self, user_id: str) -> Dict[str, str]:
        """
        Setup 2FA for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with TOTP secret and QR code URL
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Generate TOTP secret
        secret = generate_totp_secret()
        
        # Create QR code URL for authenticator apps
        qr_code_url = (
            f"otpauth://totp/MeuFuturo:{user.email}"
            f"?secret={secret}&issuer=MeuFuturo"
        )
        
        logger.info("2FA setup initiated", user_id=user_id)
        
        return {
            "secret": secret,
            "qr_code_url": qr_code_url
        }
    
    async def enable_2fa(self, user_id: str, secret: str, totp_code: str) -> bool:
        """
        Enable 2FA after verifying the setup.
        
        Args:
            user_id: User ID
            secret: TOTP secret
            totp_code: Verification code
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If verification fails
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Verify TOTP code
        if not verify_totp_token(secret, totp_code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código de verificação inválido"
            )
        
        # Enable 2FA
        await self.user_repo.enable_2fa(user_id, secret)
        
        logger.info("2FA enabled", user_id=user_id)
        
        return True
    
    async def disable_2fa(self, user_id: str, totp_code: str) -> bool:
        """
        Disable 2FA for a user.
        
        Args:
            user_id: User ID
            totp_code: Verification code
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If verification fails
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        if not user.is_2fa_enabled or not user.two_factor_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA não está habilitado"
            )
        
        # Verify TOTP code
        if not verify_totp_token(user.two_factor_secret, totp_code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código de verificação inválido"
            )
        
        # Disable 2FA
        await self.user_repo.disable_2fa(user_id)
        
        logger.info("2FA disabled", user_id=user_id)
        
        return True
    
    async def update_accessibility_preferences(
        self, 
        user_id: str, 
        preferences: Dict[str, Any]
    ) -> User:
        """
        Update user's accessibility preferences.
        
        Args:
            user_id: User ID
            preferences: Accessibility preferences
            
        Returns:
            Updated user instance
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        updated_user = await self.user_repo.update_accessibility_preferences(
            user_id, preferences
        )
        
        logger.info("Accessibility preferences updated", user_id=user_id)
        
        return updated_user
    
    async def update_financial_profile(
        self, 
        user_id: str, 
        profile: Dict[str, Any]
    ) -> User:
        """
        Update user's financial profile.
        
        Args:
            user_id: User ID
            profile: Financial profile data
            
        Returns:
            Updated user instance
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        updated_user = await self.user_repo.update_financial_profile(
            user_id, profile
        )
        
        logger.info("Financial profile updated", user_id=user_id)
        
        return updated_user
