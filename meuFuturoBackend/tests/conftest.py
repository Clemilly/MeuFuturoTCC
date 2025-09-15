"""
Pytest configuration and fixtures for the MeuFuturo API.

Provides common fixtures and test utilities.
"""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient

from main import app
from core.database import get_db_session, Base
from core.config import settings
from models.user import User
from core.security import get_password_hash

# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5432/meufuturo_test"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True
)

# Create test session factory
TestSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async with TestSessionLocal() as session:
        yield session
    
    # Drop all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
def client(test_db: AsyncSession) -> Generator[TestClient, None, None]:
    """Create a test client with database dependency override."""
    def override_get_db():
        return test_db
    
    app.dependency_overrides[get_db_session] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def async_client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None, None]:
    """Create an async test client."""
    def override_get_db():
        return test_db
    
    app.dependency_overrides[get_db_session] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(test_db: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        id="test-user-id",
        email="test@example.com",
        name="Test User",
        hashed_password=get_password_hash("testpassword123"),
        is_active=True,
        is_verified=True
    )
    
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    
    return user


@pytest_asyncio.fixture
async def test_user_inactive(test_db: AsyncSession) -> User:
    """Create an inactive test user."""
    user = User(
        id="test-user-inactive-id",
        email="inactive@example.com",
        name="Inactive User",
        hashed_password=get_password_hash("testpassword123"),
        is_active=False,
        is_verified=False
    )
    
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    
    return user


@pytest_asyncio.fixture
async def test_user_with_2fa(test_db: AsyncSession) -> User:
    """Create a test user with 2FA enabled."""
    user = User(
        id="test-user-2fa-id",
        email="2fa@example.com",
        name="2FA User",
        hashed_password=get_password_hash("testpassword123"),
        is_active=True,
        is_verified=True,
        two_factor_enabled=True,
        two_factor_secret="JBSWY3DPEHPK3PXP"
    )
    
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Get authentication headers for test user."""
    # This would normally contain a valid JWT token
    # For testing, we'll use a mock token
    return {
        "Authorization": "Bearer test-token"
    }


@pytest.fixture
def sample_transaction_data() -> dict:
    """Sample transaction data for testing."""
    return {
        "amount": 100.50,
        "description": "Test transaction",
        "transaction_type": "expense",
        "category_id": "test-category-id",
        "date": "2024-01-01"
    }


@pytest.fixture
def sample_category_data() -> dict:
    """Sample category data for testing."""
    return {
        "name": "Test Category",
        "description": "Test category description",
        "color": "#FF5733",
        "icon": "test-icon"
    }


@pytest.fixture
def sample_user_data() -> dict:
    """Sample user registration data for testing."""
    return {
        "email": "newuser@example.com",
        "name": "New User",
        "password": "newpassword123",
        "confirm_password": "newpassword123"
    }


@pytest.fixture
def sample_login_data() -> dict:
    """Sample login data for testing."""
    return {
        "email": "test@example.com",
        "password": "testpassword123"
    }


@pytest.fixture
def sample_2fa_data() -> dict:
    """Sample 2FA data for testing."""
    return {
        "code": "123456"
    }


@pytest.fixture
def sample_platform_stats_data() -> dict:
    """Sample platform stats data for testing."""
    return {
        "total_users": 100,
        "total_transactions": 1000,
        "total_categories": 50,
        "platform_uptime": 99.9
    }


@pytest.fixture
def sample_accessibility_settings_data() -> dict:
    """Sample accessibility settings data for testing."""
    return {
        "high_contrast": True,
        "font_size": "large",
        "color_scheme": "dark",
        "keyboard_navigation": True,
        "skip_links": True,
        "focus_indicators": True,
        "screen_reader_optimized": True,
        "alt_text_detailed": True,
        "audio_descriptions": False,
        "sound_effects": False,
        "large_click_targets": True,
        "gesture_controls": False
    }


@pytest.fixture
def sample_feedback_data() -> dict:
    """Sample feedback data for testing."""
    return {
        "feedback_type": "bug_report",
        "rating": 3,
        "title": "Test feedback",
        "description": "This is a test feedback",
        "is_anonymous": False
    }


# Test utilities
class TestUtils:
    """Utility functions for testing."""
    
    @staticmethod
    def assert_response_structure(response_data: dict, expected_fields: list[str]) -> None:
        """Assert that response has expected structure."""
        for field in expected_fields:
            assert field in response_data, f"Missing field: {field}"
    
    @staticmethod
    def assert_error_response(response_data: dict, expected_status: int) -> None:
        """Assert that response is an error response."""
        assert "error" in response_data
        assert response_data["error"] is True
        assert "message" in response_data
        assert "status_code" in response_data
        assert response_data["status_code"] == expected_status
    
    @staticmethod
    def assert_success_response(response_data: dict) -> None:
        """Assert that response is a success response."""
        assert "error" not in response_data or response_data.get("error") is False
    
    @staticmethod
    def assert_pagination_structure(response_data: dict) -> None:
        """Assert that response has pagination structure."""
        assert "items" in response_data
        assert "total" in response_data
        assert "page" in response_data
        assert "size" in response_data
        assert "pages" in response_data


# Pytest configuration
def pytest_configure(config):
    """Configure pytest."""
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "auth: mark test as authentication related"
    )
    config.addinivalue_line(
        "markers", "financial: mark test as financial related"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection."""
    for item in items:
        # Add slow marker to tests that take more than 1 second
        if "slow" in item.name:
            item.add_marker(pytest.mark.slow)
        
        # Add auth marker to authentication tests
        if "auth" in item.name or "login" in item.name or "register" in item.name:
            item.add_marker(pytest.mark.auth)
        
        # Add financial marker to financial tests
        if "transaction" in item.name or "category" in item.name or "financial" in item.name:
            item.add_marker(pytest.mark.financial)