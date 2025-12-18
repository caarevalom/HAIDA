"""
Authentication tests
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

def test_login_endpoint():
    """Test login endpoint"""
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    # Should return 401 since we don't have real Supabase credentials in tests
    assert response.status_code in [401, 422]

def test_register_endpoint():
    """Test register endpoint"""
    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword",
            "full_name": "New User"
        }
    )
    # Should return 400 or 401 since we don't have real Supabase credentials
    assert response.status_code in [400, 401, 422]

def test_me_endpoint_without_auth():
    """Test /me endpoint without authentication"""
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_logout_endpoint():
    """Test logout endpoint"""
    response = client.post("/auth/logout")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
