"""
Test fixtures for project management tests.
"""

import json
import os
from typing import Dict, Any, List
from pathlib import Path


class FixtureManager:
    """Manager for loading and managing test fixtures."""

    def __init__(self, fixtures_dir: str = "tests/fixtures"):
        """Initialize fixture manager."""
        self.fixtures_dir = Path(fixtures_dir)
        self.fixtures: Dict[str, Any] = {}
        self._load_all_fixtures()

    def _load_all_fixtures(self) -> None:
        """Load all fixture files."""
        if not self.fixtures_dir.exists():
            self.fixtures_dir.mkdir(parents=True, exist_ok=True)
            self._create_default_fixtures()

    def _create_default_fixtures(self) -> None:
        """Create default fixtures if they don't exist."""
        # Create fixtures directory structure
        (self.fixtures_dir / "projects").mkdir(exist_ok=True)
        (self.fixtures_dir / "configs").mkdir(exist_ok=True)

        # Create default project fixtures
        projects_data = {
            "project_1": {
                "id": "uuid-project-001",
                "name": "E-commerce Platform",
                "description": "Monitoring project for e-commerce platform",
                "owner_id": "user-001",
                "is_active": True,
                "config": {
                    "api_url": "https://api.example.com",
                    "timeout": 30,
                    "retry_count": 3,
                },
            },
            "project_2": {
                "id": "uuid-project-002",
                "name": "Analytics Dashboard",
                "description": "Real-time analytics monitoring",
                "owner_id": "user-002",
                "is_active": True,
                "config": {
                    "api_url": "https://analytics.example.com",
                    "timeout": 60,
                    "retry_count": 5,
                },
            },
            "project_3": {
                "id": "uuid-project-003",
                "name": "Legacy System",
                "description": "Deprecated legacy system",
                "owner_id": "user-001",
                "is_active": False,
                "config": {},
            },
        }

        # Create default config fixtures
        configs_data = {
            "dev_config": {
                "project_id": "uuid-project-001",
                "environment": "dev",
                "configs": {
                    "database_url": "postgresql://localhost/haida_dev",
                    "api_key": "dev-key-12345",
                    "debug": True,
                    "log_level": "DEBUG",
                },
            },
            "prod_config": {
                "project_id": "uuid-project-001",
                "environment": "prod",
                "configs": {
                    "database_url": "postgresql://prod-server/haida_prod",
                    "api_key": "prod-key-secret-xyz",
                    "debug": False,
                    "log_level": "WARNING",
                    "cdn_url": "https://cdn.example.com",
                },
            },
            "staging_config": {
                "project_id": "uuid-project-002",
                "environment": "staging",
                "configs": {
                    "database_url": "postgresql://staging-server/haida_staging",
                    "api_key": "staging-key-temp",
                    "debug": True,
                    "log_level": "INFO",
                },
            },
        }

        # Save fixtures
        self._save_fixture_file("projects/sample_projects.json", projects_data)
        self._save_fixture_file("configs/sample_configs.json", configs_data)

    def _save_fixture_file(self, relative_path: str, data: Dict[str, Any]) -> None:
        """Save fixture data to JSON file."""
        file_path = self.fixtures_dir / relative_path
        file_path.parent.mkdir(parents=True, exist_ok=True)

        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)

    def load_fixture(self, fixture_name: str) -> Dict[str, Any]:
        """
        Load a specific fixture by name.

        Args:
            fixture_name: Name of the fixture (e.g., 'projects/sample_projects')

        Returns:
            Fixture data as dictionary
        """
        fixture_path = self.fixtures_dir / f"{fixture_name}.json"

        if not fixture_path.exists():
            raise FileNotFoundError(f"Fixture not found: {fixture_path}")

        with open(fixture_path, "r") as f:
            return json.load(f)

    def get_project_fixture(self, project_key: str = "project_1") -> Dict[str, Any]:
        """Get a single project fixture."""
        fixtures = self.load_fixture("projects/sample_projects")
        return fixtures.get(project_key, {})

    def get_all_projects_fixtures(self) -> Dict[str, Any]:
        """Get all project fixtures."""
        return self.load_fixture("projects/sample_projects")

    def get_config_fixture(self, config_key: str = "dev_config") -> Dict[str, Any]:
        """Get a single configuration fixture."""
        fixtures = self.load_fixture("configs/sample_configs")
        return fixtures.get(config_key, {})

    def get_all_configs_fixtures(self) -> Dict[str, Any]:
        """Get all configuration fixtures."""
        return self.load_fixture("configs/sample_configs")

    def create_project_fixture(
        self,
        project_id: str,
        name: str,
        description: str,
        owner_id: str,
        is_active: bool = True,
    ) -> Dict[str, Any]:
        """
        Create a new project fixture in memory.

        Args:
            project_id: Project identifier
            name: Project name
            description: Project description
            owner_id: Owner user ID
            is_active: Whether project is active

        Returns:
            Created project fixture
        """
        fixture = {
            "id": project_id,
            "name": name,
            "description": description,
            "owner_id": owner_id,
            "is_active": is_active,
            "config": {},
        }
        return fixture

    def create_config_fixture(
        self,
        project_id: str,
        environment: str,
        **config_items,
    ) -> Dict[str, Any]:
        """
        Create a new configuration fixture.

        Args:
            project_id: Project identifier
            environment: Environment name (dev, staging, prod)
            **config_items: Configuration key-value pairs

        Returns:
            Created configuration fixture
        """
        fixture = {
            "project_id": project_id,
            "environment": environment,
            "configs": config_items,
        }
        return fixture

    def save_fixture(self, fixture_name: str, data: Dict[str, Any]) -> None:
        """
        Save a fixture to file.

        Args:
            fixture_name: Name of the fixture (e.g., 'projects/custom_project')
            data: Data to save
        """
        self._save_fixture_file(f"{fixture_name}.json", data)


# Global fixture manager instance
_fixture_manager = None


def get_fixture_manager(fixtures_dir: str = "tests/fixtures") -> FixtureManager:
    """Get or create the global fixture manager."""
    global _fixture_manager
    if _fixture_manager is None:
        _fixture_manager = FixtureManager(fixtures_dir)
    return _fixture_manager
