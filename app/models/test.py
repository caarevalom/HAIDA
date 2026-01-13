"""
Modelos relacionados con Tests
Tablas: test_suites, test_executions
"""

from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.database import Base

class TestType(str, enum.Enum):
    """Tipos de tests en HAIDA"""
    WEB_E2E = "web"
    API = "api"
    PERFORMANCE = "performance"
    ACCESSIBILITY = "accessibility"

class ExecutionStatus(str, enum.Enum):
    """Estados de ejecución de tests"""
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"

class TestSuite(Base):
    __tablename__ = "test_suites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    test_type = Column(Enum(TestType), nullable=False, index=True)
    config = Column(JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    executions = relationship("TestExecution", back_populates="test_suite", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<TestSuite {self.name} ({self.test_type})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "project_id": str(self.project_id),
            "name": self.name,
            "description": self.description,
            "test_type": self.test_type.value if isinstance(self.test_type, TestType) else self.test_type,
            "config": self.config,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class TestExecution(Base):
    __tablename__ = "test_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_suite_id = Column(UUID(as_uuid=True), ForeignKey("test_suites.id"), nullable=False, index=True)
    status = Column(Enum(ExecutionStatus), nullable=False, default=ExecutionStatus.PENDING, index=True)
    started_at = Column(DateTime)
    finished_at = Column(DateTime)
    duration_seconds = Column(Integer)
    results = Column(JSONB, default=dict)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relaciones
    test_suite = relationship("TestSuite", back_populates="executions")

    def __repr__(self):
        return f"<TestExecution {self.id} ({self.status})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "test_suite_id": str(self.test_suite_id),
            "status": self.status.value if isinstance(self.status, ExecutionStatus) else self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "duration_seconds": self.duration_seconds,
            "results": self.results,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
