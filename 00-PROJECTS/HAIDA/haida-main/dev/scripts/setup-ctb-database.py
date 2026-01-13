#!/usr/bin/env python3
"""
HAIDA - Setup CTB Database
==========================

Este script configura el proyecto CTB en la base de datos HAIDA:
1. Verifica/crea usuario carlosadmin@hiberus.com
2. Crea proyecto CTB
3. Crea test suites basados en ctb-master.csv
4. Registra ejecución inicial

Uso:
    python3 scripts/setup-ctb-database.py
"""

import os
import csv
import json
import requests
from datetime import datetime
from collections import defaultdict

# Configuración
SUPABASE_URL = "https://wdebyxvtunromsnkqbrd.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs"

CTB_USER_EMAIL = "carlosadmin@hiberus.com"
CTB_PROJECT_SLUG = "ctb"
CTB_CSV_PATH = "/Users/carlosa/Hiberus/CTB/docs/csv/ctb-master.csv"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def query_supabase(table, method="GET", data=None, params=None):
    """Query Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"

    if method == "GET":
        response = requests.get(url, headers=headers, params=params or {})
    elif method == "POST":
        response = requests.post(url, headers=headers, json=data)
    elif method == "PATCH":
        response = requests.patch(url, headers=headers, json=data, params=params or {})

    if response.status_code not in [200, 201]:
        print(f"❌ Error {response.status_code}: {response.text}")
        return None

    return response.json()

def get_or_create_user():
    """Obtener usuario carlosadmin"""
    print(f"\n🔍 Buscando usuario: {CTB_USER_EMAIL}")

    users = query_supabase("users", params={"email": f"eq.{CTB_USER_EMAIL}", "select": "id,email,role"})

    if users and len(users) > 0:
        print(f"✅ Usuario encontrado: {users[0]['id']}")
        return users[0]

    print("⚠️ Usuario no encontrado en public.users")
    print("⚠️ Asumiendo que existe en auth.users, usando un ID temporal")

    # Retornar estructura mock - el usuario debe existir en auth.users
    return {"id": "00000000-0000-0000-0000-000000000000", "email": CTB_USER_EMAIL, "role": "admin"}

def create_project(user_id):
    """Crear proyecto CTB"""
    print(f"\n📝 Creando proyecto: {CTB_PROJECT_SLUG}")

    # Verificar si existe
    existing = query_supabase("projects", params={"slug": f"eq.{CTB_PROJECT_SLUG}", "select": "id,name,slug"})

    if existing and len(existing) > 0:
        print(f"✅ Proyecto ya existe: {existing[0]['id']}")
        return existing[0]

    # Crear proyecto
    project_data = {
        "name": "CTB",
        "slug": CTB_PROJECT_SLUG,
        "description": "Proyecto CTB - Sistema de gestión y testing automatizado",
        "base_url": "https://mcprod.thisisbarcelona.com",
        "status": "active",
        "owner_id": user_id,
        "settings": {
            "notifications_enabled": True,
            "auto_testing": True
        },
        "metadata": {
            "client": "CTB",
            "priority": "high",
            "environment": "production"
        }
    }

    project = query_supabase("projects", method="POST", data=project_data)

    if project:
        print(f"✅ Proyecto creado: {project[0]['id']}")
        return project[0]

    return None

def read_csv():
    """Leer CSV de test cases"""
    print(f"\n📄 Leyendo CSV: {CTB_CSV_PATH}")

    if not os.path.exists(CTB_CSV_PATH):
        print(f"❌ CSV no encontrado: {CTB_CSV_PATH}")
        return []

    test_cases = []
    with open(CTB_CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='|')
        test_cases = list(reader)

    print(f"✅ {len(test_cases)} casos de prueba leídos")
    return test_cases

def group_by_module(test_cases):
    """Agrupar test cases por módulo/componente"""
    suites = defaultdict(lambda: {
        "test_cases": [],
        "tags": set()
    })

    for tc in test_cases:
        component = tc.get('COMPONENTE', 'General')
        module = tc.get('MODULO', 'Uncategorized')
        key = f"{component}-{module}"

        if not suites[key].get('name'):
            suites[key]['name'] = f"{component} - {module}"
            suites[key]['component'] = component
            suites[key]['module'] = module
            suites[key]['suite_type'] = tc.get('TIPO_PRUEBA', 'Functional').lower()
            suites[key]['priority'] = map_priority(tc.get('PRIORIDAD', 'P2'))

        # Tags
        tags = tc.get('ETIQUETA_AUTOMATIZACION', '').split('@')
        suites[key]['tags'].update(t.strip() for t in tags if t.strip())

        suites[key]['test_cases'].append(tc)

    # Convert tags set to list
    for suite in suites.values():
        suite['tags'] = list(suite['tags'])

    return list(suites.values())

def map_priority(priority):
    """Mapear prioridad"""
    mapping = {
        'P0': 'critical',
        'P1': 'high',
        'P2': 'medium',
        'P3': 'low'
    }
    return mapping.get(priority, 'medium')

def create_test_suites(project_id, suites):
    """Crear test suites"""
    print(f"\n📦 Creando {len(suites)} test suites...")

    created = []

    for suite in suites:
        suite_data = {
            "project_id": project_id,
            "name": suite['name'],
            "description": f"Suite generada desde CSV - {suite['component']} / {suite['module']}",
            "suite_type": suite['suite_type'],
            "priority": suite['priority'],
            "tags": suite['tags'],
            "metadata": {
                "component": suite['component'],
                "module": suite['module'],
                "test_count": len(suite['test_cases']),
                "source": "ctb-master.csv"
            }
        }

        result = query_supabase("test_suites", method="POST", data=suite_data)

        if result:
            print(f"  ✅ Suite creada: {suite['name']} ({len(suite['test_cases'])} casos)")
            created.append({**result[0], "test_cases": suite['test_cases']})
        else:
            print(f"  ❌ Error al crear suite: {suite['name']}")

    return created

def create_test_execution(project_id, results):
    """Registrar ejecución"""
    print(f"\n🚀 Registrando ejecución de tests...")

    execution_data = {
        "project_id": project_id,
        "execution_type": "automated",
        "status": "completed",
        "environment": "production",
        "browser": "chromium",
        "platform": "desktop",
        "started_at": datetime.utcnow().isoformat(),
        "completed_at": datetime.utcnow().isoformat(),
        "total_tests": results.get('total', 0),
        "passed": results.get('passed', 0),
        "failed": results.get('failed', 0),
        "skipped": results.get('skipped', 0),
        "metadata": {
            "base_url": "https://mcprod.thisisbarcelona.com",
            "spec_file": "ctb-comprehensive.spec.ts",
            "devices": ["Desktop Chrome", "iPhone 14", "Pixel 7"],
            "source": "HAIDA Automated Testing"
        }
    }

    execution = query_supabase("test_executions", method="POST", data=execution_data)

    if execution:
        print(f"✅ Ejecución registrada: {execution[0]['id']}")
        return execution[0]

    return None

def main():
    """Main execution"""
    print("=" * 60)
    print("HAIDA - CTB Database Setup")
    print("=" * 60)

    # 1. Get user
    user = get_or_create_user()
    if not user:
        print("❌ No se pudo obtener usuario")
        return

    # 2. Create project
    project = create_project(user['id'])
    if not project:
        print("❌ No se pudo crear proyecto")
        return

    # 3. Read CSV
    test_cases = read_csv()
    if not test_cases:
        print("❌ No se pudieron leer test cases")
        return

    # 4. Group by module
    suites = group_by_module(test_cases)
    print(f"\n📊 {len(suites)} suites agrupadas")

    # 5. Create test suites
    created_suites = create_test_suites(project['id'], suites)

    # 6. Create test execution
    results = {
        "total": len(test_cases),
        "passed": 0,
        "failed": 0,
        "skipped": len(test_cases)
    }
    create_test_execution(project['id'], results)

    print("\n" + "=" * 60)
    print("✅ CONFIGURACIÓN COMPLETADA")
    print("=" * 60)
    print(f"Proyecto: {project['name']} ({project['slug']})")
    print(f"Test Suites: {len(created_suites)}")
    print(f"Test Cases: {len(test_cases)}")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
