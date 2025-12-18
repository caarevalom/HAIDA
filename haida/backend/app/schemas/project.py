"""
Pydantic schemas for project validation and serialization.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, validator


class ProjectConfigSchema(BaseModel):
    """Configuration value schema."""

    key: str = Field(..., min_length=1, max_length=255, description="Configuration key")
    value: str = Field(..., description="Configuration value")
    environment: str = Field(default="dev", description="Environment name")
    is_sensitive: bool = Field(default=False, description="Whether value is sensitive")

    @validator("environment")
    def validate_environment(cls, v):
        """Validate environment is one of allowed values."""
        allowed = ["dev", "staging", "prod"]
        if v not in allowed:
            raise ValueError(f"Environment must be one of {allowed}")
        return v


class ProjectConfigResponseSchema(ProjectConfigSchema):
    """Configuration response schema."""

    id: str
    project_id: str
    is_encrypted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectBaseSchema(BaseModel):
    """Base project schema."""

    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, max_length=1000, description="Project description")
    is_active: bool = Field(default=True, description="Whether project is active")


class ProjectCreateSchema(ProjectBaseSchema):
    """Schema for creating a project."""

    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Initial config")


class ProjectUpdateSchema(BaseModel):
    """Schema for updating a project."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None


class ProjectResponseSchema(ProjectBaseSchema):
    """Complete project response schema."""

    id: str = Field(..., description="Project ID")
    owner_id: str = Field(..., description="Owner user ID")
    is_deleted: bool = Field(default=False)
    config: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponseSchema(BaseModel):
    """List of projects response."""

    items: List[ProjectResponseSchema]
    total: int
    skip: int
    limit: int


class ProjectConfigUpdateSchema(BaseModel):
    """Schema for updating project configuration."""

    environment: str = Field(default="dev")
    configs: Dict[str, Any] = Field(..., description="Configuration key-value pairs")

    @validator("environment")
    def validate_environment(cls, v):
        """Validate environment is one of allowed values."""
        allowed = ["dev", "staging", "prod"]
        if v not in allowed:
            raise ValueError(f"Environment must be one of {allowed}")
        return v


class ProjectConfigGetResponseSchema(BaseModel):
    """Response schema for getting project configuration."""

    project_id: str
    environment: str
    configs: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
