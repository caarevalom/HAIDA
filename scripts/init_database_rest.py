#!/usr/bin/env python3
"""
Initialize HAIDA production database using Supabase REST API
This script uses the Supabase REST API instead of direct PostgreSQL connection
"""
import os
import requests
import json
from datetime import datetime
import uuid

# Supabase configuration
SUPABASE_URL = "https://wdebyxvtunromsnkqbrd.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc"

# Headers for authenticated requests
headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def create_user(email, name, role):
    """Create a user via REST API"""
    user_data = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": name,
        "role": role,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/users",
        headers=headers,
        json=user_data
    )

    if response.status_code in [200, 201]:
        print(f"   ✅ Created user: {email} (role: {role})")
        return response.json()
    elif response.status_code == 409:
        print(f"   ⏭️  User {email} already exists, skipping...")
        return None
    else:
        print(f"   ❌ Error creating user {email}: {response.status_code} - {response.text}")
        return None

def create_project(name, slug, description, base_url, owner_id):
    """Create a project via REST API"""
    project_data = {
        "id": str(uuid.uuid4()),
        "name": name,
        "slug": slug,
        "description": description,
        "base_url": base_url,
        "status": "active",
        "owner_id": owner_id,
        "created_at": datetime.utcnow().isoformat()
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/projects",
        headers=headers,
        json=project_data
    )

    if response.status_code in [200, 201]:
        print(f"   ✅ Created project: {name}")
        return response.json()
    elif response.status_code == 409:
        print(f"   ⏭️  Project '{slug}' already exists, skipping...")
        return None
    else:
        print(f"   ❌ Error creating project: {response.status_code} - {response.text}")
        return None

def create_test_suite(project_id, name, description, suite_type, priority, tags):
    """Create a test suite via REST API"""
    suite_data = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "name": name,
        "description": description,
        "suite_type": suite_type,
        "priority": priority,
        "tags": tags,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/test_suites",
        headers=headers,
        json=suite_data
    )

    if response.status_code in [200, 201]:
        print(f"   ✅ Created test suite: {name}")
        return response.json()
    else:
        print(f"   ❌ Error creating test suite: {response.status_code} - {response.text}")
        return None

def get_users():
    """Get all users"""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/users?select=*",
        headers=headers
    )
    if response.status_code == 200:
        return response.json()
    return []

def get_projects():
    """Get all projects"""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/projects?select=*",
        headers=headers
    )
    if response.status_code == 200:
        return response.json()
    return []

def get_test_suites():
    """Get all test suites"""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/test_suites?select=*",
        headers=headers
    )
    if response.status_code == 200:
        return response.json()
    return []

def main():
    """Main initialization function"""
    print("=" * 60)
    print("HAIDA DATABASE INITIALIZATION (REST API)")
    print("=" * 60)

    # Test connection
    print("\n🔌 Testing Supabase connection...")
    try:
        response = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers)
        if response.status_code == 200:
            print("✅ Connected to Supabase successfully")
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # Create seed users
    print("\n👥 Creating seed users...")
    users = [
        ("admin@haida.com", "HAIDA Admin", "admin"),
        ("qa@haida.com", "QA Engineer", "qa_engineer"),
        ("dev@haida.com", "Developer", "developer")
    ]

    admin_id = None
    for email, name, role in users:
        user = create_user(email, name, role)
        if user and email == "admin@haida.com":
            admin_id = user[0]["id"] if isinstance(user, list) else user.get("id")

    # If admin wasn't just created, get existing admin
    if not admin_id:
        existing_users = get_users()
        for user in existing_users:
            if user["email"] == "admin@haida.com":
                admin_id = user["id"]
                break

    # Create seed project
    if admin_id:
        print("\n📁 Creating seed project...")
        project = create_project(
            "HAIDA Demo Project",
            "haida-demo",
            "Demo project for HAIDA testing",
            "https://mcprod.thisisbarcelona.com",
            admin_id
        )

        # Get project ID if it exists
        project_id = None
        if project:
            project_id = project[0]["id"] if isinstance(project, list) else project.get("id")

        if not project_id:
            existing_projects = get_projects()
            for proj in existing_projects:
                if proj["slug"] == "haida-demo":
                    project_id = proj["id"]
                    break

        # Create seed test suite
        if project_id:
            print("\n🧪 Creating seed test suite...")
            create_test_suite(
                project_id,
                "Smoke Tests",
                "Critical smoke tests for main functionality",
                "smoke",
                "critical",
                ["smoke", "critical", "regression"]
            )
    else:
        print("\n❌ Could not find admin user, skipping project and test suite creation")

    # Verify data
    print("\n🔍 Verifying inserted data...")

    users = get_users()
    print(f"\n👥 Users ({len(users)}):")
    for user in users:
        print(f"   - {user['email']} ({user['role']}): {user['name']}")

    projects = get_projects()
    print(f"\n📁 Projects ({len(projects)}):")
    for project in projects:
        print(f"   - {project['name']} ({project['slug']}) - Status: {project['status']}")

    suites = get_test_suites()
    print(f"\n🧪 Test Suites ({len(suites)}):")
    for suite in suites:
        print(f"   - {suite['name']} ({suite['suite_type']}) - Priority: {suite['priority']}")

    # Summary
    print("\n" + "=" * 60)
    print("INITIALIZATION COMPLETE")
    print("=" * 60)
    print(f"✅ Total users: {len(users)}")
    print(f"✅ Total projects: {len(projects)}")
    print(f"✅ Total test suites: {len(suites)}")
    print("\n🎉 Database is ready for use!")
    print("=" * 60)

if __name__ == "__main__":
    main()
