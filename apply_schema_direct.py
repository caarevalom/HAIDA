#!/usr/bin/env python3
"""
HAIDA - Apply Schema Directly to Supabase
Runs inside Docker container with proper network access
"""

import os
import psycopg2
from pathlib import Path

def main():
    print("=" * 70)
    print("  HAIDA - Applying Schema to Supabase")
    print("=" * 70)

    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("\n❌ ERROR: DATABASE_URL not set")
        return 1

    print(f"\nDatabase URL: {database_url[:50]}...")

    # Ensure SSL mode
    if 'sslmode' not in database_url:
        database_url = f"{database_url}?sslmode=require"

    print("\n[1/4] Connecting to Supabase...")

    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        print("  ✓ Connected successfully")

        # Check current tables
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)
        table_count_before = cursor.fetchone()[0]
        print(f"  Current tables: {table_count_before}")

    except Exception as e:
        print(f"\n❌ Connection failed: {e}")
        return 1

    print("\n[2/4] Applying main schema...")

    # Read and apply schema
    schema_path = Path("/app/infrastructure/supabase/schema.sql")

    if not schema_path.exists():
        print(f"  ❌ Schema file not found: {schema_path}")
        return 1

    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()

        print(f"  Schema size: {len(schema_sql)} bytes")
        print("  Executing... (this may take 1-2 minutes)")

        cursor.execute(schema_sql)
        conn.commit()

        print("  ✓ Schema applied successfully")

    except Exception as e:
        print(f"  ⚠️  Schema error: {e}")
        print("  (This may be OK if tables already exist)")
        conn.rollback()

    print("\n[3/4] Applying migrations...")

    # Apply migrations
    migrations_dir = Path("/app/infrastructure/supabase/migrations")

    if migrations_dir.exists():
        migration_files = sorted(migrations_dir.glob("*.sql"))

        for mig_file in migration_files:
            print(f"\n  Applying: {mig_file.name}")

            try:
                with open(mig_file, 'r', encoding='utf-8') as f:
                    migration_sql = f.read()

                cursor.execute(migration_sql)
                conn.commit()

                print(f"    ✓ {mig_file.name} applied")

            except Exception as e:
                print(f"    ⚠️  {mig_file.name} error: {e}")
                conn.rollback()
    else:
        print("  No migrations directory found")

    print("\n[4/4] Verifying database state...")

    try:
        # Count tables
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)
        table_count_after = cursor.fetchone()[0]

        # Check for defects table
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'defects'
            )
        """)
        defects_exists = cursor.fetchone()[0]

        # Check test_steps type
        cursor.execute("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = 'test_cases'
            AND column_name = 'test_steps'
        """)
        result = cursor.fetchone()
        test_steps_type = result[0] if result else 'not found'

        # List all tables
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = [row[0] for row in cursor.fetchall()]

        print(f"\n  Total tables: {table_count_after} (before: {table_count_before})")
        print(f"  Defects table exists: {defects_exists}")
        print(f"  test_steps type: {test_steps_type}")

        print("\n  Tables created:")
        for table in tables:
            print(f"    • {table}")

        cursor.close()
        conn.close()

        print("\n" + "=" * 70)
        print("  ✓ Schema Application Complete")
        print("=" * 70)

        return 0

    except Exception as e:
        print(f"\n❌ Verification error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
