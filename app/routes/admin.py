"""
Admin routes para gestión de base de datos y migrations
Solo accesible para usuarios admin
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import psycopg2
import os
from pathlib import Path
from supabase import create_client, Client

router = APIRouter()

# Supabase client para queries vía REST API
def get_supabase_client() -> Client:
    """Obtener cliente Supabase usando REST API (no requiere conexión directa a PostgreSQL)"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured")

    return create_client(supabase_url, supabase_key)

def get_db_connection():
    """Obtener conexión a Supabase PostgreSQL"""
    try:
        # Usar DATABASE_URL directamente
        database_url = os.getenv('DATABASE_URL')
        if database_url:
            # Agregar sslmode si no está presente
            if 'sslmode' not in database_url:
                database_url = f"{database_url}?sslmode=require"
            conn = psycopg2.connect(database_url)
        else:
            # Fallback a parámetros individuales
            conn = psycopg2.connect(
                host=os.getenv('POSTGRES_HOST'),
                port=int(os.getenv('POSTGRES_PORT', 5432)),
                database=os.getenv('POSTGRES_DATABASE'),
                user=os.getenv('POSTGRES_USER'),
                password=os.getenv('POSTGRES_PASSWORD'),
                sslmode='require'
            )
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@router.post("/apply-migrations")
async def apply_migrations():
    """
    Aplicar todas las migrations SQL a Supabase
    ADVERTENCIA: Solo usar en desarrollo/staging
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        results = []
        migrations_dir = Path("/app") / "infrastructure" / "supabase" / "migrations"

        if not migrations_dir.exists():
            # Intentar path alternativo
            migrations_dir = Path("/app") / ".." / "infrastructure" / "supabase" / "migrations"

        if not migrations_dir.exists():
            return {
                "status": "error",
                "message": f"Migrations directory not found: {migrations_dir}"
            }

        # Obtener archivos SQL ordenados
        migration_files = sorted(migrations_dir.glob("*.sql"))

        for migration_file in migration_files:
            try:
                with open(migration_file, 'r', encoding='utf-8') as f:
                    sql_content = f.read()

                cursor.execute(sql_content)
                conn.commit()

                results.append({
                    "file": migration_file.name,
                    "status": "success"
                })
            except Exception as e:
                conn.rollback()
                results.append({
                    "file": migration_file.name,
                    "status": "error",
                    "error": str(e)
                })

        cursor.close()
        conn.close()

        return {
            "status": "completed",
            "migrations_applied": len([r for r in results if r["status"] == "success"]),
            "migrations_failed": len([r for r in results if r["status"] == "error"]),
            "results": results
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@router.get("/db-status")
async def check_db_status():
    """Verificar conexión y estado de la base de datos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificar conexión
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()[0]

        # Listar tablas
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]

        # Verificar tabla defects
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'defects'
            );
        """)
        defects_exists = cursor.fetchone()[0]

        #  Verificar test_steps tipo
        cursor.execute("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = 'test_cases' AND column_name = 'test_steps';
        """)
        test_steps_result = cursor.fetchone()
        test_steps_type = test_steps_result[0] if test_steps_result else None

        cursor.close()
        conn.close()

        return {
            "status": "connected",
            "database_version": db_version,
            "total_tables": len(tables),
            "tables": tables,
            "migrations_status": {
                "defects_table_exists": defects_exists,
                "test_steps_type": test_steps_type,
                "test_steps_is_jsonb": test_steps_type == "jsonb"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database check failed: {str(e)}")

@router.post("/apply-schema")
async def apply_main_schema():
    """
    Aplicar schema principal a Supabase
    ADVERTENCIA: Solo usar en DB vacía
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        schema_file = Path("/app") / "infrastructure" / "supabase" / "schema.sql"

        if not schema_file.exists():
            schema_file = Path("/app") / ".." / "infrastructure" / "supabase" / "schema.sql"

        if not schema_file.exists():
            return {
                "status": "error",
                "message": f"Schema file not found: {schema_file}"
            }

        with open(schema_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Ejecutar schema (puede tardar)
        cursor.execute(sql_content)
        conn.commit()

        cursor.close()
        conn.close()

        return {
            "status": "success",
            "message": "Main schema applied successfully"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@router.get("/db-status-rest")
async def check_db_status_rest():
    """
    Verificar estado de la base de datos usando Supabase REST API
    No requiere conexión directa a PostgreSQL (usa HTTPS)
    """
    try:
        supabase = get_supabase_client()

        # Verificar acceso a tablas básicas
        tenants_check = supabase.table('tenants').select('id').limit(1).execute()
        projects_check = supabase.table('projects').select('id').limit(1).execute()
        defects_check = supabase.table('defects').select('id').limit(1).execute()
        test_cases_check = supabase.table('test_cases').select('id,test_steps').limit(1).execute()

        # Verificar tipo de test_steps
        test_steps_is_jsonb = False
        if test_cases_check.data and len(test_cases_check.data) > 0:
            test_steps_value = test_cases_check.data[0].get('test_steps')
            # Si test_steps es dict/list, es JSONB; si es string, es TEXT
            test_steps_is_jsonb = isinstance(test_steps_value, (dict, list))

        return {
            "status": "connected",
            "api_url": os.getenv('SUPABASE_URL'),
            "tables_accessible": {
                "tenants": len(tenants_check.data) if tenants_check.data else 0,
                "projects": len(projects_check.data) if projects_check.data else 0,
                "defects": len(defects_check.data) if defects_check.data else 0,
                "test_cases": len(test_cases_check.data) if test_cases_check.data else 0
            },
            "migrations_status": {
                "defects_table_exists": True,  # Si llegamos aquí, existe
                "test_steps_appears_jsonb": test_steps_is_jsonb
            },
            "note": "Using REST API - Limited schema introspection available"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database check via REST API failed: {str(e)}")

@router.post("/seed-demo-data")
async def seed_demo_data():
    """
    Insertar datos de demostración en la base de datos
    Crea: 1 tenant, 1 proyecto, 1 test suite, 2 test cases
    """
    try:
        supabase = get_supabase_client()

        # 1. Verificar si ya hay un tenant
        existing_tenants = supabase.table('tenants').select('id,name').limit(1).execute()

        if existing_tenants.data and len(existing_tenants.data) > 0:
            tenant_id = existing_tenants.data[0]['id']
            tenant_name = existing_tenants.data[0]['name']
            created_tenant = False
        else:
            # Crear tenant demo
            tenant_data = {
                "name": "Hiberus QA Team",
                "slug": "hiberus-qa",
                "subscription_plan": "professional",
                "settings": {
                    "allow_public_signup": False,
                    "max_users": 50,
                    "features": {
                        "chat_ia": True,
                        "advanced_reporting": True,
                        "test_automation": True
                    }
                }
            }
            tenant_result = supabase.table('tenants').insert(tenant_data).execute()
            tenant_id = tenant_result.data[0]['id']
            tenant_name = tenant_result.data[0]['name']
            created_tenant = True

        # 2. Verificar si ya hay proyecto demo para este tenant
        existing_projects = supabase.table('projects')\
            .select('id,name,tenant_id')\
            .eq('slug', 'haida-demo')\
            .limit(1)\
            .execute()

        if existing_projects.data and len(existing_projects.data) > 0:
            project_id = existing_projects.data[0]['id']
            project_name = existing_projects.data[0]['name']
            tenant_id = existing_projects.data[0].get('tenant_id', tenant_id)
            created_project = False
        else:
            # Crear proyecto demo (omitiendo 'type' porque tiene default 'web')
            project_data = {
                "tenant_id": tenant_id,
                "name": "HAIDA Demo Project",
                "slug": "haida-demo",
                "description": "Proyecto de demostración para HAIDA QA Platform",
                "base_url": "https://demo.haida.com",
                "status": "active"
            }
            project_result = supabase.table('projects').insert(project_data).execute()
            project_id = project_result.data[0]['id']
            project_name = project_result.data[0]['name']
            created_project = True

        # 3. Crear o reutilizar test suite
        existing_suites = supabase.table('test_suites')\
            .select('id,name')\
            .eq('project_id', project_id)\
            .eq('name', 'Login & Authentication Tests')\
            .limit(1)\
            .execute()

        if existing_suites.data and len(existing_suites.data) > 0:
            suite_id = existing_suites.data[0]['id']
            suite_name = existing_suites.data[0]['name']
            created_suite = False
        else:
            suite_data = {
                "project_id": project_id,
                "name": "Login & Authentication Tests",
                "description": "Suite de pruebas para funcionalidad de login",
                "suite_type": "smoke",
                "priority": "critical"
            }
            suite_result = supabase.table('test_suites').insert(suite_data).execute()
            suite_id = suite_result.data[0]['id']
            suite_name = suite_result.data[0]['name']
            created_suite = True

        # 4. Crear test cases con JSONB test_steps
        test_cases_data = [
            {
                "test_suite_id": suite_id,
                "test_id": "TC_LOGIN_001",
                "name": "Verify successful login with valid credentials",
                "description": "Test that users can log in with correct email and password",
                "test_type": "e2e",
                "priority": "p0",
                "test_steps": [
                    {"step": 1, "action": "Navigate to login page", "expected": "Login form is displayed"},
                    {"step": 2, "action": "Enter valid email address", "expected": "Email field is populated"},
                    {"step": 3, "action": "Enter valid password", "expected": "Password field is populated"},
                    {"step": 4, "action": "Click Login button", "expected": "User is redirected to dashboard"}
                ],
                "expected_result": "User successfully logs in and sees the dashboard"
            },
            {
                "test_suite_id": suite_id,
                "test_id": "TC_LOGIN_002",
                "name": "Verify login fails with invalid credentials",
                "description": "Test that login fails with incorrect password",
                "test_type": "negative",
                "priority": "p0",
                "test_steps": [
                    {"step": 1, "action": "Navigate to login page", "expected": "Login form is displayed"},
                    {"step": 2, "action": "Enter valid email", "expected": "Email field is populated"},
                    {"step": 3, "action": "Enter invalid password", "expected": "Password field is populated"},
                    {"step": 4, "action": "Click Login button", "expected": "Error message is shown"}
                ],
                "expected_result": "Login fails with appropriate error message"
            }
        ]

        existing_cases = supabase.table('test_cases')\
            .select('test_id')\
            .in_('test_id', [case['test_id'] for case in test_cases_data])\
            .execute()
        existing_ids = {row['test_id'] for row in (existing_cases.data or [])}
        missing_cases = [case for case in test_cases_data if case['test_id'] not in existing_ids]

        test_cases_result = {"data": []}
        if missing_cases:
            test_cases_result = supabase.table('test_cases').insert(missing_cases).execute()

        return {
            "status": "success",
            "message": "Demo data seeded successfully",
            "created": {
                "tenant": {
                    "id": tenant_id,
                    "name": tenant_name,
                    "created": created_tenant
                },
                "project": {
                    "id": project_id,
                    "name": project_name,
                    "created": created_project
                },
                "test_suite": {
                    "id": suite_id,
                    "name": suite_name,
                    "created": created_suite
                },
                "test_cases": len(test_cases_result.data)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed demo data: {str(e)}")

@router.post("/seed-test-cases")
async def seed_test_cases_only():
    """
    Crear test cases de ejemplo en el primer proyecto disponible
    """
    try:
        supabase = get_supabase_client()

        # Buscar primer proyecto disponible
        projects = supabase.table('projects').select('id,name').limit(1).execute()

        if not projects.data or len(projects.data) == 0:
            raise HTTPException(status_code=404, detail="No projects found. Create a project first.")

        project_id = projects.data[0]['id']
        project_name = projects.data[0]['name']

        # Buscar si ya existe test suite
        existing_suites = supabase.table('test_suites').select('id,name').eq('project_id', project_id).limit(1).execute()

        if existing_suites.data and len(existing_suites.data) > 0:
            suite_id = existing_suites.data[0]['id']
            suite_name = existing_suites.data[0]['name']
            created_suite = False
        else:
            # Crear test suite
            suite_data = {
                "project_id": project_id,
                "name": "Login & Authentication Tests",
                "description": "Suite de pruebas para funcionalidad de login",
                "suite_type": "smoke",
                "priority": "critical"
            }
            suite_result = supabase.table('test_suites').insert(suite_data).execute()
            suite_id = suite_result.data[0]['id']
            suite_name = suite_result.data[0]['name']
            created_suite = True

        # Crear test cases con test_steps en formato JSONB
        test_cases_data = [
            {
                "test_suite_id": suite_id,
                "test_id": "TC_LOGIN_001",
                "name": "Verify successful login with valid credentials",
                "description": "Test that users can log in with correct email and password",
                "test_type": "e2e",
                "priority": "p0",
                "test_steps": [
                    {"step": 1, "action": "Navigate to login page", "expected": "Login form is displayed"},
                    {"step": 2, "action": "Enter valid email address", "expected": "Email field is populated"},
                    {"step": 3, "action": "Enter valid password", "expected": "Password field is populated"},
                    {"step": 4, "action": "Click Login button", "expected": "User is redirected to dashboard"}
                ],
                "expected_result": "User successfully logs in and sees the dashboard"
            },
            {
                "test_suite_id": suite_id,
                "test_id": "TC_LOGIN_002",
                "name": "Verify login fails with invalid credentials",
                "description": "Test that login fails with incorrect password",
                "test_type": "negative",
                "priority": "p0",
                "test_steps": [
                    {"step": 1, "action": "Navigate to login page", "expected": "Login form is displayed"},
                    {"step": 2, "action": "Enter valid email", "expected": "Email field is populated"},
                    {"step": 3, "action": "Enter invalid password", "expected": "Password field is populated"},
                    {"step": 4, "action": "Click Login button", "expected": "Error message is shown"}
                ],
                "expected_result": "Login fails with appropriate error message"
            },
            {
                "test_suite_id": suite_id,
                "test_id": "TC_LOGIN_003",
                "name": "Verify password reset flow",
                "description": "Test password reset functionality",
                "test_type": "e2e",
                "priority": "p1",
                "test_steps": [
                    {"step": 1, "action": "Click 'Forgot Password' link", "expected": "Password reset form shown"},
                    {"step": 2, "action": "Enter email address", "expected": "Email field populated"},
                    {"step": 3, "action": "Click Send Reset Email", "expected": "Confirmation message shown"}
                ],
                "expected_result": "Password reset email sent successfully"
            }
        ]

        test_cases_result = supabase.table('test_cases').insert(test_cases_data).execute()

        return {
            "status": "success",
            "message": "Test cases created successfully",
            "project": {
                "id": project_id,
                "name": project_name
            },
            "test_suite": {
                "id": suite_id,
                "name": suite_name,
                "created": created_suite
            },
            "test_cases_created": len(test_cases_result.data)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create test cases: {str(e)}")
