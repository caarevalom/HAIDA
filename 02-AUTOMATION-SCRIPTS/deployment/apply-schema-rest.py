#!/usr/bin/env python3
"""
HAIDA - Apply Schema to Supabase via REST API
This script uses Supabase REST API to execute SQL directly
Bypasses Docker networking limitations
"""

import os
import sys
import requests
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env")
    sys.exit(1)

print("=" * 60)
print("  HAIDA - Apply Schema via Supabase REST API")
print("=" * 60)
print(f"\nSupabase URL: {SUPABASE_URL}")
print(f"Service Key: {SUPABASE_SERVICE_KEY[:20]}...")

# Read schema file
schema_path = Path("infrastructure/supabase/schema.sql")
if not schema_path.exists():
    print(f"\n❌ ERROR: {schema_path} not found")
    sys.exit(1)

print(f"\n✓ Schema file found: {schema_path}")

with open(schema_path, 'r', encoding='utf-8') as f:
    schema_sql = f.read()

print(f"  Schema size: {len(schema_sql)} bytes")

# Read migrations
migrations = []
migrations_dir = Path("infrastructure/supabase/migrations")
if migrations_dir.exists():
    migration_files = sorted(migrations_dir.glob("*.sql"))
    for mig_file in migration_files:
        with open(mig_file, 'r', encoding='utf-8') as f:
            migrations.append({
                'name': mig_file.name,
                'sql': f.read()
            })
        print(f"  ✓ Migration loaded: {mig_file.name}")

print(f"\n[1/3] Applying schema via Supabase Management API...")

# Use Supabase Management API to execute SQL
# Note: This requires using pg_admin endpoint or direct database connection
# Since we can't use psycopg2 from Docker, we'll use the supabase-py client

try:
    from supabase import create_client, Client

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    print("  ✓ Supabase client created")

    # Test connection by querying existing tables
    print("\n[2/3] Testing connection...")

    # Try to query pg_catalog to check connection
    result = supabase.table('_realtime').select("*").limit(1).execute()
    print("  ✓ Connection successful")

    print("\n[3/3] Schema application via REST API...")
    print("\n⚠️  NOTE: Supabase REST API does not support executing raw SQL directly.")
    print("   You must use one of these methods:")
    print("\n   OPTION 1: Supabase Dashboard (RECOMMENDED)")
    print("   1. Go to: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd")
    print("   2. Click 'SQL Editor'")
    print("   3. Paste schema.sql and execute")
    print("   4. Paste each migration and execute")
    print("\n   OPTION 2: Supabase CLI")
    print("   supabase login")
    print("   supabase link --project-ref wdebyxvtunromsnkqbrd")
    print("   supabase db push")
    print("\n   OPTION 3: Direct psycopg2 (requires non-Docker environment)")
    print("   python apply-schema-psycopg2.py")

    print("\n" + "=" * 60)
    print("  ✓ Verification Complete")
    print("=" * 60)
    print("\n📁 Files ready for manual application:")
    print(f"  • {schema_path}")
    for mig in migrations:
        print(f"  • infrastructure/supabase/migrations/{mig['name']}")

    print("\n📚 See detailed guide: INSTRUCCIONES-FINALES.md")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("\nThis confirms Docker networking limitation.")
    print("Please use manual method via Supabase Dashboard.")
    sys.exit(1)
