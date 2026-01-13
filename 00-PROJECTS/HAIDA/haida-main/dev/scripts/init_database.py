#!/usr/bin/env python3
"""
Initialize HAIDA production database with seed data
This script will:
1. Verify database connection
2. Check if tables exist
3. Insert seed data (users, projects, test suites)
"""
import os
import sys
from datetime import datetime

# Add parent directory to path to import api modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from api.db import get_conn, fetch_one, fetch_all, execute
except ImportError:
    print("Error: Could not import database module")
    print("Make sure you're running this script from the HAIDA root directory")
    sys.exit(1)

def check_database_connection():
    """Verify database connection"""
    print("🔌 Checking database connection...")
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"✅ Connected to PostgreSQL: {version[0]}")
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_tables_exist():
    """Check if tables exist in database"""
    print("\n📋 Checking database tables...")
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT tablename
            FROM pg_catalog.pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        tables = cur.fetchall()
        cur.close()
        conn.close()

        if not tables:
            print("❌ No tables found. Please run the schema SQL file first:")
            print("   database/01-schema-haida.sql")
            return False

        print(f"✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
        return True
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return False

def insert_seed_users():
    """Insert seed users into database"""
    print("\n👥 Inserting seed users...")

    users = [
        ("admin@haida.com", "HAIDA Admin", "admin"),
        ("qa@haida.com", "QA Engineer", "qa_engineer"),
        ("dev@haida.com", "Developer", "developer")
    ]

    inserted = 0
    for email, name, role in users:
        try:
            # Check if user already exists
            existing = fetch_one("SELECT email FROM users WHERE email = %s", (email,))
            if existing:
                print(f"   ⏭️  User {email} already exists, skipping...")
                continue

            # Insert user
            execute(
                """
                INSERT INTO users (email, name, role, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (email, name, role, True, datetime.utcnow())
            )
            print(f"   ✅ Created user: {email} (role: {role})")
            inserted += 1
        except Exception as e:
            print(f"   ❌ Error creating user {email}: {e}")

    print(f"\n✅ Inserted {inserted} new users")
    return inserted

def insert_seed_project():
    """Insert seed project into database"""
    print("\n📁 Inserting seed project...")

    try:
        # Check if project already exists
        existing = fetch_one("SELECT slug FROM projects WHERE slug = %s", ("haida-demo",))
        if existing:
            print("   ⏭️  Project 'haida-demo' already exists, skipping...")
            return 0

        # Get admin user ID
        admin = fetch_one("SELECT id FROM users WHERE email = %s", ("hola@stayarta.com",))
        if not admin:
            print("   ❌ Admin user not found, cannot create project")
            return 0

        # Insert project
        execute(
            """
            INSERT INTO projects (name, slug, description, base_url, status, owner_id, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                "HAIDA Demo Project",
                "haida-demo",
                "Demo project for HAIDA testing",
                "https://mcprod.thisisbarcelona.com",
                "active",
                admin["id"],
                datetime.utcnow()
            )
        )
        print("   ✅ Created project: HAIDA Demo Project")
        return 1
    except Exception as e:
        print(f"   ❌ Error creating project: {e}")
        return 0

def insert_seed_test_suite():
    """Insert seed test suite into database"""
    print("\n🧪 Inserting seed test suite...")

    try:
        # Check if test suite already exists
        existing = fetch_one(
            "SELECT name FROM test_suites WHERE name = %s",
            ("Smoke Tests",)
        )
        if existing:
            print("   ⏭️  Test suite 'Smoke Tests' already exists, skipping...")
            return 0

        # Get project ID
        project = fetch_one("SELECT id FROM projects WHERE slug = %s", ("haida-demo",))
        if not project:
            print("   ❌ Project 'haida-demo' not found, cannot create test suite")
            return 0

        # Insert test suite
        execute(
            """
            INSERT INTO test_suites (project_id, name, description, suite_type, priority, tags, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                project["id"],
                "Smoke Tests",
                "Critical smoke tests for main functionality",
                "smoke",
                "critical",
                ["smoke", "critical", "regression"],
                datetime.utcnow()
            )
        )
        print("   ✅ Created test suite: Smoke Tests")
        return 1
    except Exception as e:
        print(f"   ❌ Error creating test suite: {e}")
        return 0

def verify_data():
    """Verify inserted data"""
    print("\n🔍 Verifying inserted data...")

    try:
        # Count users
        users = fetch_all("SELECT email, name, role FROM users ORDER BY email")
        print(f"\n👥 Users ({len(users)}):")
        for user in users:
            print(f"   - {user['email']} ({user['role']}): {user['name']}")

        # Count projects
        projects = fetch_all("SELECT name, slug, status FROM projects ORDER BY name")
        print(f"\n📁 Projects ({len(projects)}):")
        for project in projects:
            print(f"   - {project['name']} ({project['slug']}) - Status: {project['status']}")

        # Count test suites
        suites = fetch_all("SELECT name, suite_type, priority FROM test_suites ORDER BY name")
        print(f"\n🧪 Test Suites ({len(suites)}):")
        for suite in suites:
            print(f"   - {suite['name']} ({suite['suite_type']}) - Priority: {suite['priority']}")

        return True
    except Exception as e:
        print(f"❌ Error verifying data: {e}")
        return False

def main():
    """Main initialization function"""
    print("=" * 60)
    print("HAIDA DATABASE INITIALIZATION")
    print("=" * 60)

    # Check database connection
    if not check_database_connection():
        print("\n❌ Database initialization failed: Cannot connect to database")
        print("\nPlease check:")
        print("1. DATABASE_URL environment variable is set")
        print("2. Database server is accessible")
        print("3. Credentials are correct")
        sys.exit(1)

    # Check if tables exist
    if not check_tables_exist():
        print("\n❌ Database initialization failed: Tables not found")
        print("\nPlease run the schema SQL file first:")
        print("   psql $DATABASE_URL -f database/01-schema-haida.sql")
        sys.exit(1)

    # Insert seed data
    users_inserted = insert_seed_users()
    projects_inserted = insert_seed_project()
    suites_inserted = insert_seed_test_suite()

    # Verify data
    verify_data()

    # Summary
    print("\n" + "=" * 60)
    print("INITIALIZATION COMPLETE")
    print("=" * 60)
    print(f"✅ Users inserted: {users_inserted}")
    print(f"✅ Projects inserted: {projects_inserted}")
    print(f"✅ Test suites inserted: {suites_inserted}")
    print("\n🎉 Database is ready for use!")
    print("=" * 60)

if __name__ == "__main__":
    main()
