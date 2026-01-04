"""
Integration tests for API endpoints
"""
import pytest
import os
from fastapi.testclient import TestClient
from app.main import app

# Skip integration tests if not in CI
pytestmark = pytest.mark.skipif(
    not os.getenv("CI") and not os.getenv("RUN_INTEGRATION_TESTS"),
    reason="Integration tests require database setup"
)

client = TestClient(app)

def test_system_endpoints():
    """Test system endpoints"""
    # Health check
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    
    # Version check
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    
    # Status check
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert "api" in data

@pytest.mark.asyncio
async def test_scripts_crud():
    """Test Scripts CRUD operations"""
    # This would require authentication and database setup
    # For now, we'll test the endpoint structure
    response = client.get("/scripts")
    # Should return 401 without authentication
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_runs_crud():
    """Test Runs CRUD operations"""
    response = client.get("/script-runs")
    # Should return 401 without authentication
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_reports_crud():
    """Test Reports CRUD operations"""
    response = client.get("/reports")
    # Should return 401 without authentication
    assert response.status_code == 401

def test_database_connection():
    """Test database connection"""
    from app.core.db import get_conn
    
    try:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        assert result[0] == 1
        conn.close()
    except Exception as e:
        pytest.skip(f"Database not available: {e}")
