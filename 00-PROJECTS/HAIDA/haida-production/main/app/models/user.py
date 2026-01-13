"""
Modelo de Usuario
Tabla: users
"""

from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.db.database import Base

class UserRole(str, enum.Enum):
    """Roles de usuario en HAIDA"""
    ADMIN = "admin"
    QA_ENGINEER = "qa_engineer"
    DEVELOPER = "developer"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), nullable=False, default=UserRole.VIEWER)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"

    def to_dict(self):
        """Convertir a diccionario (excluye password_hash)"""
        return {
            "id": str(self.id),
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role.value if isinstance(self.role, UserRole) else self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
