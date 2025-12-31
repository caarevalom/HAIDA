"""
Schemas Pydantic para Tests
Validación de test suites y ejecuciones
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.test import TestType, ExecutionStatus

class TestSuiteBase(BaseModel):
    """Schema base de test suite"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    test_type: TestType
    config: Dict[str, Any] = Field(default_factory=dict)

class TestSuiteCreate(TestSuiteBase):
    """Schema para crear test suite"""
    project_id: str

class TestSuiteUpdate(BaseModel):
    """Schema para actualizar test suite"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class TestSuiteResponse(TestSuiteBase):
    """Schema de respuesta de test suite"""
    id: str
    project_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TestExecutionCreate(BaseModel):
    """Schema para iniciar ejecución de test"""
    test_suite_id: str
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)

class TestExecutionResponse(BaseModel):
    """Schema de respuesta de ejecución"""
    id: str
    test_suite_id: str
    status: ExecutionStatus
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    results: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TestRunRequest(BaseModel):
    """Schema para ejecutar tests"""
    suite_id: str
    browsers: Optional[list[str]] = Field(default_factory=lambda: ["chromium"])
    parallel: bool = True
    retry: bool = True
