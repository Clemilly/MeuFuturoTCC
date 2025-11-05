"""
Tests for authentication endpoints.

Tests user registration, login, and profile management.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User


class TestUserRegistration:
    """Test user registration functionality."""
    
    def test_register_user_success(self, test_client: TestClient):
        """Test successful user registration."""
        user_data = {
            "email": "newuser@example.com",
            "name": "New User",
            "password": "newpassword123"
        }
        
        response = test_client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["name"] == user_data["name"]
        assert data["is_active"] is True
        assert data["is_verified"] is False
        assert "password" not in data
    
    def test_register_user_duplicate_email(self, test_client: TestClient, test_user: User):
        """Test registration with duplicate email."""
        user_data = {
            "email": test_user.email,
            "name": "Another User",
            "password": "anotherpassword123"
        }
        
        response = test_client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "já está em uso" in response.json()["message"]
    
    def test_register_user_invalid_email(self, test_client: TestClient):
        """Test registration with invalid email."""
        user_data = {
            "email": "invalid-email",
            "name": "Test User",
            "password": "testpassword123"
        }
        
        response = test_client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422
    
    def test_register_user_weak_password(self, test_client: TestClient):
        """Test registration with weak password."""
        user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "123"
        }
        
        response = test_client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422


class TestUserLogin:
    """Test user login functionality."""
    
    def test_login_success(self, test_client: TestClient, test_user: User):
        """Test successful login."""
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"
        }
        
        response = test_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
    
    def test_login_wrong_password(self, test_client: TestClient, test_user: User):
        """Test login with wrong password."""
        login_data = {
            "email": test_user.email,
            "password": "wrongpassword"
        }
        
        response = test_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
    
    def test_login_nonexistent_user(self, test_client: TestClient):
        """Test login with nonexistent user."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = test_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401


class TestUserProfile:
    """Test user profile management."""
    
    def test_get_profile(self, test_client: TestClient, auth_headers: dict):
        """Test getting user profile."""
        response = test_client.get("/api/v1/auth/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "name" in data
        assert "accessibility_preferences" in data
        assert "financial_profile" in data
    
    def test_get_profile_unauthorized(self, test_client: TestClient):
        """Test getting profile without authentication."""
        response = test_client.get("/api/v1/auth/profile")
        
        assert response.status_code == 401
    
    def test_update_profile(self, test_client: TestClient, auth_headers: dict):
        """Test updating user profile."""
        update_data = {
            "name": "Updated Name",
            "bio": "Updated bio"
        }
        
        response = test_client.put(
            "/api/v1/auth/profile", 
            json=update_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["bio"] == update_data["bio"]
    
    def test_change_password(self, test_client: TestClient, auth_headers: dict):
        """Test changing password."""
        password_data = {
            "current_password": "testpassword123",
            "new_password": "newtestpassword123"
        }
        
        response = test_client.post(
            "/api/v1/auth/change-password",
            json=password_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert "sucesso" in response.json()["message"]
    
    def test_change_password_wrong_current(self, test_client: TestClient, auth_headers: dict):
        """Test changing password with wrong current password."""
        password_data = {
            "current_password": "wrongpassword",
            "new_password": "newtestpassword123"
        }
        
        response = test_client.post(
            "/api/v1/auth/change-password",
            json=password_data,
            headers=auth_headers
        )
        
        assert response.status_code == 400


class TestAccessibilityPreferences:
    """Test accessibility preferences management."""
    
    def test_update_accessibility_preferences(self, test_client: TestClient, auth_headers: dict):
        """Test updating accessibility preferences."""
        preferences = {
            "theme": "dark",
            "font_size": "large",
            "high_contrast": True,
            "screen_reader": True
        }
        
        response = test_client.put(
            "/api/v1/auth/preferences/accessibility",
            json=preferences,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["accessibility_preferences"]["theme"] == "dark"
        assert data["accessibility_preferences"]["font_size"] == "large"
        assert data["accessibility_preferences"]["high_contrast"] is True


class TestFinancialProfile:
    """Test financial profile management."""
    
    def test_update_financial_profile(self, test_client: TestClient, auth_headers: dict):
        """Test updating financial profile."""
        profile = {
            "default_currency": "USD",
            "monthly_income": 5000.0,
            "monthly_budget": 4000.0,
            "risk_tolerance": "medium"
        }
        
        response = test_client.put(
            "/api/v1/auth/preferences/financial",
            json=profile,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["financial_profile"]["default_currency"] == "USD"
        assert data["financial_profile"]["monthly_income"] == 5000.0
