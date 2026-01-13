"""
Project model for storing project information and configurations.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, DateTime, Boolean, JSON, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship


Base = declarative_base()


class Project(Base):
    """
    Project model for managing monitoring projects.

    Attributes:
        id: Unique project identifier
        name: Project name
        description: Project description
        owner_id: User ID of the project owner
        is_active: Whether the project is active
        is_deleted: Soft delete flag
        config: JSON configuration object
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(String(1000), nullable=True)
    owner_id = Column(String(36), nullable=False, index=True)
    is_active = Column(Boolean, default=True, index=True)
    is_deleted = Column(Boolean, default=False, index=True)

    # Configuration stored as JSON
    config = Column(JSON, default=dict, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name={self.name}, owner_id={self.owner_id})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "is_active": self.is_active,
            "is_deleted": self.is_deleted,
            "config": self.config,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ProjectConfig(Base):
    """
    Configuration values for projects by environment.

    Attributes:
        id: Unique configuration identifier
        project_id: Reference to project
        environment: Environment name (dev, staging, prod)
        key: Configuration key
        value: Configuration value (encrypted if sensitive)
        is_encrypted: Whether value is encrypted
        is_sensitive: Whether value should be encrypted
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "project_configs"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    environment = Column(String(50), default="dev", nullable=False)
    key = Column(String(255), nullable=False)
    value = Column(String(5000), nullable=False)
    is_encrypted = Column(Boolean, default=False)
    is_sensitive = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        # Unique constraint on project_id, environment, and key
        # Can't use __table_args__ directly, so we'll handle this in the application
    )

    def __repr__(self) -> str:
        return f"<ProjectConfig(project_id={self.project_id}, env={self.environment}, key={self.key})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "project_id": self.project_id,
            "environment": self.environment,
            "key": self.key,
            "value": self.value if not self.is_encrypted else "***encrypted***",
            "is_encrypted": self.is_encrypted,
            "is_sensitive": self.is_sensitive,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
