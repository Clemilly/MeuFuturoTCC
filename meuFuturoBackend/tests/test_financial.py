"""
Tests for financial endpoints.

Tests transaction and category management functionality.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User


class TestTransactions:
    """Test transaction management functionality."""
    
    def test_create_transaction(
        self, 
        test_client: TestClient, 
        auth_headers: dict,
        sample_transaction_data: dict
    ):
        """Test creating a new transaction."""
        response = test_client.post(
            "/api/v1/financial/transactions",
            json=sample_transaction_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["type"] == sample_transaction_data["type"]
        assert float(data["amount"]) == sample_transaction_data["amount"]
        assert data["description"] == sample_transaction_data["description"]
        assert "id" in data
        assert "created_at" in data
    
    def test_create_transaction_unauthorized(
        self, 
        test_client: TestClient,
        sample_transaction_data: dict
    ):
        """Test creating transaction without authentication."""
        response = test_client.post(
            "/api/v1/financial/transactions",
            json=sample_transaction_data
        )
        
        assert response.status_code == 401
    
    def test_create_transaction_invalid_amount(
        self, 
        test_client: TestClient, 
        auth_headers: dict
    ):
        """Test creating transaction with invalid amount."""
        transaction_data = {
            "type": "expense",
            "amount": -50.0,  # Negative amount should be rejected
            "description": "Test transaction",
            "transaction_date": "2025-01-24"
        }
        
        response = test_client.post(
            "/api/v1/financial/transactions",
            json=transaction_data,
            headers=auth_headers
        )
        
        assert response.status_code == 422
    
    def test_get_transactions(self, test_client: TestClient, auth_headers: dict):
        """Test getting user transactions."""
        response = test_client.get(
            "/api/v1/financial/transactions",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert isinstance(data["items"], list)
    
    def test_get_transactions_with_filters(self, test_client: TestClient, auth_headers: dict):
        """Test getting transactions with filters."""
        params = {
            "transaction_type": "expense",
            "start_date": "2025-01-01",
            "end_date": "2025-01-31",
            "page": 1,
            "size": 10
        }
        
        response = test_client.get(
            "/api/v1/financial/transactions",
            params=params,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["size"] == 10


class TestCategories:
    """Test category management functionality."""
    
    def test_create_category(
        self, 
        test_client: TestClient, 
        auth_headers: dict,
        sample_category_data: dict
    ):
        """Test creating a new category."""
        response = test_client.post(
            "/api/v1/financial/categories",
            json=sample_category_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_category_data["name"]
        assert data["description"] == sample_category_data["description"]
        assert data["color"] == sample_category_data["color"]
        assert data["is_system"] is False
        assert data["is_active"] is True
        assert "id" in data
    
    def test_get_categories(self, test_client: TestClient, auth_headers: dict):
        """Test getting user categories."""
        response = test_client.get(
            "/api/v1/financial/categories",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_categories_include_system(self, test_client: TestClient, auth_headers: dict):
        """Test getting categories including system categories."""
        params = {
            "include_system": True,
            "include_subcategories": True
        }
        
        response = test_client.get(
            "/api/v1/financial/categories",
            params=params,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestFinancialReports:
    """Test financial reporting functionality."""
    
    def test_get_transaction_summary(self, test_client: TestClient, auth_headers: dict):
        """Test getting transaction summary."""
        response = test_client.get(
            "/api/v1/financial/summary",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "total_income" in data
        assert "total_expenses" in data
        assert "net_amount" in data
        assert "transaction_count" in data
        assert "income_count" in data
        assert "expense_count" in data
    
    def test_get_transaction_summary_with_date_range(
        self, 
        test_client: TestClient, 
        auth_headers: dict
    ):
        """Test getting transaction summary with date range."""
        params = {
            "start_date": "2025-01-01",
            "end_date": "2025-01-31"
        }
        
        response = test_client.get(
            "/api/v1/financial/summary",
            params=params,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert all(key in data for key in [
            "total_income", "total_expenses", "net_amount", "transaction_count"
        ])
    
    def test_get_category_summary(self, test_client: TestClient, auth_headers: dict):
        """Test getting category summary."""
        response = test_client.get(
            "/api/v1/financial/summary/categories",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_monthly_summary(self, test_client: TestClient, auth_headers: dict):
        """Test getting monthly summary."""
        response = test_client.get(
            "/api/v1/financial/summary/monthly/2025/1",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["year"] == 2025
        assert data["month"] == 1
        assert "total_income" in data
        assert "total_expenses" in data
        assert "categories" in data
        assert isinstance(data["categories"], list)
    
    def test_get_financial_overview(self, test_client: TestClient, auth_headers: dict):
        """Test getting financial overview."""
        response = test_client.get(
            "/api/v1/financial/overview",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "current_month" in data
        assert "recent_transactions" in data
        assert "overall_summary" in data
        assert "current_balance" in data
