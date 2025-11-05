"""
Improved authentication tests with better coverage and structure.

Tests authentication endpoints with proper error handling and validation.
"""

import pytest
from fastapi import status
from httpx import AsyncClient

from core.exceptions import InvalidCredentialsError, EmailAlreadyExistsError
from tests.conftest import TestUtils


@pytest.mark.auth
class TestAuthentication:
    """Test authentication endpoints."""
    
    async def test_register_user_success(
        self, 
        async_client: AsyncClient, 
        sample_user_data: dict
    ):
        """Test successful user registration."""
        response = await async_client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        TestUtils.assert_success_response(data)
        TestUtils.assert_response_structure(data, ["user", "message"])
        assert data["user"]["email"] == sample_user_data["email"]
        assert data["user"]["name"] == sample_user_data["name"]
        assert "id" in data["user"]
        assert "password" not in data["user"]  # Password should not be returned
    
    async def test_register_user_duplicate_email(
        self, 
        async_client: AsyncClient, 
        test_user: dict,
        sample_user_data: dict
    ):
        """Test registration with duplicate email."""
        # Use the same email as existing user
        sample_user_data["email"] = test_user["email"]
        
        response = await async_client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == status.HTTP_409_CONFLICT
        data = response.json()
        
        TestUtils.assert_error_response(data, status.HTTP_409_CONFLICT)
        assert "email" in data["message"].lower()
    
    async def test_register_user_invalid_email(
        self, 
        async_client: AsyncClient, 
        sample_user_data: dict
    ):
        """Test registration with invalid email."""
        sample_user_data["email"] = "invalid-email"
        
        response = await async_client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        
        TestUtils.assert_error_response(data, status.HTTP_422_UNPROCESSABLE_ENTITY)
    
    async def test_register_user_weak_password(
        self, 
        async_client: AsyncClient, 
        sample_user_data: dict
    ):
        """Test registration with weak password."""
        sample_user_data["password"] = "123"
        sample_user_data["confirm_password"] = "123"
        
        response = await async_client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        
        TestUtils.assert_error_response(data, status.HTTP_422_UNPROCESSABLE_ENTITY)
    
    async def test_register_user_password_mismatch(
        self, 
        async_client: AsyncClient, 
        sample_user_data: dict
    ):
        """Test registration with password mismatch."""
        sample_user_data["confirm_password"] = "different_password"
        
        response = await async_client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        
        TestUtils.assert_error_response(data, status.HTTP_422_UNPROCESSABLE_ENTITY)
    
    async def test_login_success(
        self, 
        async_client: AsyncClient, 
        test_user: dict,
        sample_login_data: dict
    ):
        """Test successful login."""
        response = await async_client.post("/api/v1/auth/login", json=sample_login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        TestUtils.assert_success_response(data)
        TestUtils.assert_response_structure(data, ["access_token", "token_type", "user"])
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == sample_login_data["email"]
        assert "password" not in data["user"]
    
    async def test_login_invalid_credentials(
        self, 
        async_client: AsyncClient, 
        sample_login_data: dict
    ):
        """Test login with invalid credentials."""
        sample_login_data["password"] = "wrong_password"
        
        response = await async_client.post("/api/v1/auth/login", json=sample_login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        
        TestUtils.assert_error_response(data, status.HTTP_401_UNAUTHORIZED)
        assert "credenciais" in data["message"].lower()
    
    async def test_login_nonexistent_user(
        self, 
        async_client: AsyncClient
    ):
        """Test login with nonexistent user."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = await async_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        
        TestUtils.assert_error_response(data, status.HTTP_401_UNAUTHORIZED)
    
    async def test_login_inactive_user(
        self, 
        async_client: AsyncClient, 
        test_user_inactive: dict
    ):
        """Test login with inactive user."""
        login_data = {
            "email": test_user_inactive["email"],
            "password": "testpassword123"
        }
        
        response = await async_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        data = response.json()
        
        TestUtils.assert_error_response(data, status.HTTP_403_FORBIDDEN)
        assert "inativa" in data["message"].lower()
    
    async def test_logout_success(
        self, 
        async_client: AsyncClient, 
        auth_headers: dict
    ):
        """Test successful logout."""
        response = await async_client.post(
            "/api/v1/auth/logout", 
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        TestUtils.assert_success_response(data)
        assert "message" in data
    
    async def test_get_profile_success(
        self, 
        async_client: AsyncClient, 
        auth_headers: dict,
        test_user: dict
    ):
        """Test getting user profile."""
        response = await async_client.get(
            "/api/v1/auth/profile", 
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        TestUtils.assert_success_response(data)
        TestUtils.assert_response_structure(data, ["id", "email", "name", "is_active", "is_verified"])
        assert data["email"] == test_user["email"]
        assert data["name"] == test_user["name"]
    
    async def test_get_profile_unauthorized(
        self, 
        async_client: AsyncClient
    ):
        """Test getting profile without authentication."""
        response = await async_client.get("/api/v1/auth/profile")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        
        TestUtils.assert_error_response(data, status.HTTP_401_UNAUTHORIZED)
    
    async def test_rate_limiting_auth_endpoints(
        self, 
        async_client: AsyncClient, 
        sample_login_data: dict
    ):
        """Test rate limiting on authentication endpoints."""
        # Make multiple requests to trigger rate limiting
        for _ in range(15):  # Exceed the rate limit
            response = await async_client.post("/api/v1/auth/login", json=sample_login_data)
            
            if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                data = response.json()
                TestUtils.assert_error_response(data, status.HTTP_429_TOO_MANY_REQUESTS)
                assert "rate" in data["message"].lower() or "limite" in data["message"].lower()
                break
        else:
            pytest.fail("Rate limiting not triggered after 15 requests")


@pytest.mark.auth
@pytest.mark.slow
class TestAuthenticationPerformance:
    """Test authentication performance."""
    
    async def test_login_performance(
        self, 
        async_client: AsyncClient, 
        test_user: dict,
        sample_login_data: dict
    ):
        """Test login performance under load."""
        import time
        
        start_time = time.time()
        
        # Make multiple login requests
        for _ in range(10):
            response = await async_client.post("/api/v1/auth/login", json=sample_login_data)
            assert response.status_code == status.HTTP_200_OK
        
        end_time = time.time()
        avg_time = (end_time - start_time) / 10
        
        # Login should be fast (less than 1 second per request)
        assert avg_time < 1.0, f"Average login time too slow: {avg_time:.2f}s"
    
    async def test_register_performance(
        self, 
        async_client: AsyncClient
    ):
        """Test registration performance under load."""
        import time
        
        start_time = time.time()
        
        # Make multiple registration requests with different emails
        for i in range(5):
            user_data = {
                "email": f"perf_test_{i}@example.com",
                "name": f"Performance Test User {i}",
                "password": "testpassword123",
                "confirm_password": "testpassword123"
            }
            
            response = await async_client.post("/api/v1/auth/register", json=user_data)
            assert response.status_code == status.HTTP_201_CREATED
        
        end_time = time.time()
        avg_time = (end_time - start_time) / 5
        
        # Registration should be reasonably fast
        assert avg_time < 2.0, f"Average registration time too slow: {avg_time:.2f}s"
