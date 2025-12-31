"""
Schemas Pydantic HAIDA
Exportación centralizada de todos los schemas
"""

from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserLogin,
    TokenResponse
)
from app.schemas.test import (
    TestSuiteBase,
    TestSuiteCreate,
    TestSuiteUpdate,
    TestSuiteResponse,
    TestExecutionCreate,
    TestExecutionResponse,
    TestRunRequest
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserLogin",
    "TokenResponse",
    # Test schemas
    "TestSuiteBase",
    "TestSuiteCreate",
    "TestSuiteUpdate",
    "TestSuiteResponse",
    "TestExecutionCreate",
    "TestExecutionResponse",
    "TestRunRequest"
]
