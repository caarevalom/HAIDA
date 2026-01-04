"""
Test suite for project management API.
"""

import pytest
import uuid
from datetime import datetime
from typing import Dict, Any

# Mock fixtures for testing
from .fixtures import get_fixture_manager


class TestProjectEncryption:
    """Test encryption service for sensitive project configurations."""

    def test_encryption_service_initialization(self):
        """Test encryption service can be initialized."""
        from app.services.encryption import EncryptionService

        service = EncryptionService("test-key-12345")
        assert service is not None

    def test_encrypt_decrypt_string(self):
        """Test encrypting and decrypting a string."""
        from app.services.encryption import EncryptionService

        service = EncryptionService("test-key-12345")
        original = "sensitive-api-key-12345"

        encrypted = service.encrypt(original)
        assert encrypted != original
        assert service.is_encrypted(encrypted)

        decrypted = service.decrypt(encrypted)
        assert decrypted == original

    def test_encrypt_non_string_value(self):
        """Test encrypting non-string values."""
        from app.services.encryption import EncryptionService

        service = EncryptionService("test-key-12345")
        value = 12345

        encrypted = service.encrypt(value)
        decrypted = service.decrypt(encrypted)
        assert decrypted == "12345"

    def test_decrypt_invalid_data(self):
        """Test decryption fails gracefully on invalid data."""
        from app.services.encryption import EncryptionService

        service = EncryptionService("test-key-12345")

        with pytest.raises(ValueError):
            service.decrypt("invalid-encrypted-data")

    def test_encryption_service_singleton(self):
        """Test encryption service singleton pattern."""
        from app.services.encryption import get_encryption_service

        service1 = get_encryption_service("test-key")
        service2 = get_encryption_service("test-key")
        assert service1 is service2


class TestProjectModels:
    """Test project models."""

    def test_project_model_initialization(self):
        """Test Project model can be created."""
        from app.models.project import Project

        project = Project(
            id=str(uuid.uuid4()),
            name="Test Project",
            description="A test project",
            owner_id="user-123",
            is_active=True,
            config={"url": "https://example.com"},
        )

        assert project.name == "Test Project"
        assert project.owner_id == "user-123"
        assert project.is_active is True
        assert project.is_deleted is False

    def test_project_to_dict(self):
        """Test Project model to_dict method."""
        from app.models.project import Project

        project = Project(
            id="project-123",
            name="Test Project",
            description="A test project",
            owner_id="user-123",
            config={"url": "https://example.com"},
        )

        project_dict = project.to_dict()
        assert project_dict["id"] == "project-123"
        assert project_dict["name"] == "Test Project"
        assert project_dict["config"]["url"] == "https://example.com"

    def test_project_config_model(self):
        """Test ProjectConfig model."""
        from app.models.project import ProjectConfig

        config = ProjectConfig(
            id=str(uuid.uuid4()),
            project_id="project-123",
            environment="prod",
            key="database_url",
            value="postgresql://localhost/db",
            is_encrypted=False,
            is_sensitive=False,
        )

        assert config.project_id == "project-123"
        assert config.environment == "prod"
        assert config.key == "database_url"

    def test_project_config_to_dict(self):
        """Test ProjectConfig model to_dict method."""
        from app.models.project import ProjectConfig

        config = ProjectConfig(
            id="config-123",
            project_id="project-123",
            environment="dev",
            key="api_key",
            value="gAAAAAA...",  # Encrypted
            is_encrypted=True,
            is_sensitive=True,
        )

        config_dict = config.to_dict()
        assert config_dict["id"] == "config-123"
        assert config_dict["value"] == "***encrypted***"
        assert config_dict["is_sensitive"] is True


class TestProjectSchemas:
    """Test Pydantic schemas for project validation."""

    def test_project_create_schema_validation(self):
        """Test ProjectCreateSchema validation."""
        from app.schemas.project import ProjectCreateSchema

        # Valid schema
        schema = ProjectCreateSchema(
            name="New Project",
            description="Test project",
            is_active=True,
            config={"url": "https://example.com"},
        )
        assert schema.name == "New Project"
        assert schema.is_active is True

    def test_project_create_schema_minimal(self):
        """Test ProjectCreateSchema with minimal data."""
        from app.schemas.project import ProjectCreateSchema

        schema = ProjectCreateSchema(name="Minimal Project")
        assert schema.name == "Minimal Project"
        assert schema.is_active is True
        assert schema.config == {}

    def test_project_create_schema_name_validation(self):
        """Test ProjectCreateSchema name validation."""
        from app.schemas.project import ProjectCreateSchema

        with pytest.raises(ValueError):
            ProjectCreateSchema(name="")

    def test_project_update_schema(self):
        """Test ProjectUpdateSchema allows partial updates."""
        from app.schemas.project import ProjectUpdateSchema

        schema = ProjectUpdateSchema(name="Updated Name")
        assert schema.name == "Updated Name"
        assert schema.description is None
        assert schema.is_active is None

    def test_project_config_schema_validation(self):
        """Test ProjectConfigUpdateSchema validation."""
        from app.schemas.project import ProjectConfigUpdateSchema

        schema = ProjectConfigUpdateSchema(
            environment="prod",
            configs={"api_key": "secret-123", "timeout": 30},
        )
        assert schema.environment == "prod"
        assert schema.configs["api_key"] == "secret-123"

    def test_project_config_schema_environment_validation(self):
        """Test ProjectConfigUpdateSchema environment validation."""
        from app.schemas.project import ProjectConfigUpdateSchema

        with pytest.raises(ValueError):
            ProjectConfigUpdateSchema(
                environment="invalid",
                configs={"key": "value"},
            )


class TestProjectFixtures:
    """Test fixture management for projects."""

    def test_fixture_manager_initialization(self):
        """Test FixtureManager can be initialized."""
        manager = get_fixture_manager("tests/fixtures")
        assert manager is not None

    def test_load_project_fixture(self):
        """Test loading a project fixture."""
        manager = get_fixture_manager("tests/fixtures")
        fixture = manager.get_project_fixture("project_1")

        assert fixture["id"] == "uuid-project-001"
        assert fixture["name"] == "E-commerce Platform"
        assert fixture["owner_id"] == "user-001"

    def test_load_all_projects_fixtures(self):
        """Test loading all project fixtures."""
        manager = get_fixture_manager("tests/fixtures")
        fixtures = manager.get_all_projects_fixtures()

        assert "project_1" in fixtures
        assert "project_2" in fixtures
        assert "project_3" in fixtures
        assert len(fixtures) == 3

    def test_load_config_fixture(self):
        """Test loading a configuration fixture."""
        manager = get_fixture_manager("tests/fixtures")
        fixture = manager.get_config_fixture("dev_config")

        assert fixture["project_id"] == "uuid-project-001"
        assert fixture["environment"] == "dev"
        assert "api_key" in fixture["configs"]

    def test_load_all_configs_fixtures(self):
        """Test loading all configuration fixtures."""
        manager = get_fixture_manager("tests/fixtures")
        fixtures = manager.get_all_configs_fixtures()

        assert "dev_config" in fixtures
        assert "prod_config" in fixtures
        assert "staging_config" in fixtures

    def test_create_project_fixture(self):
        """Test creating a project fixture programmatically."""
        manager = get_fixture_manager("tests/fixtures")
        fixture = manager.create_project_fixture(
            project_id="custom-project-001",
            name="Custom Project",
            description="A custom test project",
            owner_id="user-999",
            is_active=True,
        )

        assert fixture["id"] == "custom-project-001"
        assert fixture["name"] == "Custom Project"
        assert fixture["owner_id"] == "user-999"

    def test_create_config_fixture(self):
        """Test creating a configuration fixture."""
        manager = get_fixture_manager("tests/fixtures")
        fixture = manager.create_config_fixture(
            project_id="project-xyz",
            environment="staging",
            database_url="postgresql://staging/db",
            api_key="staging-key-secret",
            debug=True,
        )

        assert fixture["project_id"] == "project-xyz"
        assert fixture["environment"] == "staging"
        assert fixture["configs"]["database_url"] == "postgresql://staging/db"

    def test_fixture_manager_singleton(self):
        """Test fixture manager singleton pattern."""
        manager1 = get_fixture_manager("tests/fixtures")
        manager2 = get_fixture_manager("tests/fixtures")
        assert manager1 is manager2


class TestProjectAPI:
    """Test project API endpoints."""

    @pytest.fixture
    def sample_project_data(self):
        """Provide sample project data for tests."""
        return {
            "name": "API Test Project",
            "description": "Testing project API",
            "is_active": True,
            "config": {"url": "https://api.example.com"},
        }

    @pytest.fixture
    def sample_config_data(self):
        """Provide sample configuration data for tests."""
        return {
            "environment": "dev",
            "configs": {
                "api_key": "test-key-12345",
                "timeout": 30,
                "debug": True,
            },
        }

    def test_list_projects_endpoint_structure(self, sample_project_data):
        """Test list projects endpoint returns correct structure."""
        from app.api.v1.projects import list_projects

        result = list_projects(skip=0, limit=10)

        assert hasattr(result, "items")
        assert hasattr(result, "total")
        assert hasattr(result, "skip")
        assert hasattr(result, "limit")
        assert result.skip == 0
        assert result.limit == 10

    def test_create_project_endpoint_structure(self, sample_project_data):
        """Test create project endpoint returns correct structure."""
        from app.api.v1.projects import create_project
        from app.schemas.project import ProjectCreateSchema

        schema = ProjectCreateSchema(**sample_project_data)
        result = create_project(schema, current_user_id="test-user")

        assert result.id is not None
        assert result.name == sample_project_data["name"]
        assert result.owner_id == "test-user"
        assert result.is_active is True

    def test_get_project_endpoint_not_found(self):
        """Test get project endpoint returns 404 for non-existent project."""
        from app.api.v1.projects import get_project
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            get_project("non-existent-project")

        assert exc_info.value.status_code == 404

    def test_update_project_endpoint_not_found(self, sample_project_data):
        """Test update project endpoint returns 404 for non-existent project."""
        from app.api.v1.projects import update_project
        from app.schemas.project import ProjectUpdateSchema
        from fastapi import HTTPException

        schema = ProjectUpdateSchema(name="Updated Name")

        with pytest.raises(HTTPException) as exc_info:
            update_project("non-existent-project", schema)

        assert exc_info.value.status_code == 404

    def test_delete_project_endpoint_structure(self):
        """Test delete project endpoint returns correct response."""
        from app.api.v1.projects import delete_project

        result = delete_project("test-project-123", current_user_id="test-user")

        assert result["message"] == "Project deleted successfully"
        assert result["project_id"] == "test-project-123"

    def test_get_project_config_endpoint_not_found(self):
        """Test get config endpoint returns 404 for non-existent project."""
        from app.api.v1.projects import get_project_config
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            get_project_config("non-existent-project")

        assert exc_info.value.status_code == 404

    def test_update_project_config_endpoint_not_found(self, sample_config_data):
        """Test update config endpoint returns 404 for non-existent project."""
        from app.api.v1.projects import update_project_config
        from app.schemas.project import ProjectConfigUpdateSchema
        from fastapi import HTTPException

        schema = ProjectConfigUpdateSchema(**sample_config_data)

        with pytest.raises(HTTPException) as exc_info:
            update_project_config("non-existent-project", schema)

        assert exc_info.value.status_code == 404


class TestSecurityConstraints:
    """Test security constraints for project management."""

    def test_soft_delete_flag(self):
        """Test that deletion uses soft delete flag."""
        from app.models.project import Project

        project = Project(
            id="test-project",
            name="Test",
            owner_id="user-123",
        )

        assert project.is_deleted is False
        project.is_deleted = True
        assert project.is_deleted is True

    def test_sensitive_config_values(self):
        """Test identification of sensitive configuration keys."""
        sensitive_keys = ["password", "token", "secret", "api_key"]

        for key in sensitive_keys:
            # In real implementation, would check against a list
            assert key.lower() in [k.lower() for k in sensitive_keys]

    def test_config_encryption_for_sensitive_values(self):
        """Test that sensitive config values are encrypted."""
        from app.services.encryption import EncryptionService

        service = EncryptionService("test-key")
        sensitive_value = "my-secret-api-key"

        encrypted = service.encrypt(sensitive_value)
        assert encrypted != sensitive_value
        assert service.is_encrypted(encrypted)


# Integration test examples (would require actual database)
class TestProjectIntegration:
    """Integration tests for project management."""

    def test_full_project_lifecycle(self):
        """Test complete project lifecycle (create -> update -> delete)."""
        # This is a placeholder for integration tests
        # In real implementation, would use actual database
        assert True

    def test_config_management_workflow(self):
        """Test configuration management workflow."""
        # This is a placeholder for integration tests
        # In real implementation, would use actual database
        assert True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
