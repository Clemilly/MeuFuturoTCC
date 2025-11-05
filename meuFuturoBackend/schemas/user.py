"""
User-related Pydantic schemas for request/response validation.

Includes schemas for authentication, user management, and preferences.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema with common fields."""
    
    email: EmailStr = Field(..., description="User's email address")
    name: str = Field(..., min_length=2, max_length=255, description="User's display name")


class UserCreate(UserBase):
    """Schema for user creation (registration)."""
    
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=128, 
        description="User password (min 8 characters)"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "usuario@example.com",
                "name": "João Silva",
                "password": "senha123456"
            }
        }
    )


class UserUpdate(BaseModel):
    """Schema for user profile updates."""
    
    name: Optional[str] = Field(None, min_length=2, max_length=255, description="User's display name")
    bio: Optional[str] = Field(None, max_length=1000, description="User biography")
    avatar_url: Optional[str] = Field(None, description="URL to user's avatar")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "João Silva Santos",
                "bio": "Empreendedor apaixonado por finanças",
                "avatar_url": "https://example.com/avatar.jpg"
            }
        }
    )


class UserLogin(BaseModel):
    """Schema for user login."""
    
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User password")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "usuario@example.com",
                "password": "senha123456"
            }
        }
    )


class UserResponse(UserBase):
    """Schema for user response (public information)."""
    
    id: str = Field(..., description="Unique user identifier")
    is_active: bool = Field(..., description="Whether user account is active")
    is_verified: bool = Field(..., description="Whether email is verified")
    bio: Optional[str] = Field(None, description="User biography")
    avatar_url: Optional[str] = Field(None, description="URL to user's avatar")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "usuario@example.com",
                "name": "João Silva",
                "is_active": True,
                "is_verified": True,
                "bio": "Empreendedor apaixonado por finanças",
                "avatar_url": "https://example.com/avatar.jpg",
                "created_at": "2025-01-24T10:00:00Z",
                "updated_at": "2025-01-24T10:00:00Z"
            }
        }
    )


class UserProfile(UserResponse):
    """Extended user profile with preferences."""
    
    accessibility_preferences: Optional[Dict[str, Any]] = Field(
        None, 
        description="User accessibility preferences"
    )
    financial_profile: Optional[Dict[str, Any]] = Field(
        None, 
        description="User financial preferences"
    )


class AccessibilityPreferences(BaseModel):
    """Schema for accessibility preferences."""
    
    theme: Optional[str] = Field("auto", description="Theme preference (light/dark/auto)")
    font_size: Optional[str] = Field("medium", description="Font size (small/medium/large)")
    high_contrast: Optional[bool] = Field(False, description="Enable high contrast mode")
    reduce_motion: Optional[bool] = Field(False, description="Reduce motion/animations")
    screen_reader: Optional[bool] = Field(False, description="Screen reader optimizations")
    keyboard_navigation: Optional[bool] = Field(False, description="Enhanced keyboard navigation")
    voice_commands: Optional[bool] = Field(False, description="Voice command support")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "theme": "dark",
                "font_size": "large",
                "high_contrast": True,
                "reduce_motion": False,
                "screen_reader": True,
                "keyboard_navigation": True,
                "voice_commands": False
            }
        }
    )


class FinancialProfile(BaseModel):
    """Schema for financial profile preferences."""
    
    default_currency: Optional[str] = Field("BRL", description="Default currency")
    monthly_income: Optional[float] = Field(None, ge=0, description="Monthly income")
    monthly_budget: Optional[float] = Field(None, ge=0, description="Monthly budget")
    financial_goals: Optional[Dict[str, Any]] = Field(None, description="Financial goals")
    risk_tolerance: Optional[str] = Field("medium", description="Risk tolerance (low/medium/high)")
    investment_experience: Optional[str] = Field("beginner", description="Investment experience level")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "default_currency": "BRL",
                "monthly_income": 5000.00,
                "monthly_budget": 4000.00,
                "financial_goals": {
                    "emergency_fund": 15000.00,
                    "vacation": 5000.00
                },
                "risk_tolerance": "medium",
                "investment_experience": "intermediate"
            }
        }
    )


class PasswordChange(BaseModel):
    """Schema for password change."""
    
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(
        ..., 
        min_length=8, 
        max_length=128, 
        description="New password (min 8 characters)"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "current_password": "senhaAtual123",
                "new_password": "novaSenha456"
            }
        }
    )
