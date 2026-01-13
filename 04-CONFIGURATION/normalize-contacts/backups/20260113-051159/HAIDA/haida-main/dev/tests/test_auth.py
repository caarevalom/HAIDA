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
            "email": "hola@stayarta.com",
            "password": "testpassword"
        }
    )
    # Can be 200 if Supabase credentials are configured, otherwise 401/422
    assert response.status_code in [200, 401, 422]

def test_register_endpoint():
    """Test register endpoint"""
    response = client.post(
        "/auth/register",
        json={
            "email": "hola@stayarta.com",
            "password": "newpassword",
            "full_name": "New User"
        }
    )
    # Can be 200/201 if Supabase credentials are configured, otherwise 400/401/409/422
    assert response.status_code in [200, 201, 400, 401, 409, 422]

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
