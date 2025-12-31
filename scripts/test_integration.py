#!/usr/bin/env python3
"""
Script de prueba de integración completa HAIDA
Verifica: BD, API, Jira, Confluence, Telegram
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import requests
from sqlalchemy import text
from app.db.database import engine, SessionLocal
from app.config import settings
from atlassian import Jira, Confluence

def print_section(title):
    """Print section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_database():
    """Test 1: Verificar conexión a base de datos"""
    print_section("TEST 1: BASE DE DATOS")

    try:
        # Conectar
        db = SessionLocal()
        result = db.execute(text("SELECT version()"))
        version = result.fetchone()[0]

        print(f"✅ Conexión exitosa a PostgreSQL")
        print(f"   Versión: {version[:50]}...")

        # Verificar tablas
        result = db.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result.fetchall()]

        if tables:
            print(f"✅ Tablas encontradas: {len(tables)}")
            for table in tables:
                print(f"   - {table}")
        else:
            print("⚠️  No se encontraron tablas (necesitas ejecutar la API una vez)")

        db.close()
        return True

    except Exception as e:
        print(f"❌ Error de conexión a BD: {str(e)}")
        return False

def test_api():
    """Test 2: Verificar API REST"""
    print_section("TEST 2: API REST")

    try:
        # Health check
        response = requests.get("http://localhost:8000/health", timeout=5)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ API respondiendo")
            print(f"   Status: {data.get('status')}")
            print(f"   Service: {data.get('service')}")
            print(f"   Version: {data.get('version')}")
        else:
            print(f"⚠️  API respondió con status {response.status_code}")

        # Root endpoint
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint OK")
            print(f"   Name: {data.get('name')}")
            print(f"   Docs: http://localhost:8000{data.get('docs')}")

        return True

    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar a la API")
        print("   Ejecuta: uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_jira():
    """Test 3: Verificar integración Jira"""
    print_section("TEST 3: JIRA INTEGRATION")

    try:
        jira = Jira(
            url=settings.ATLASSIAN_URL,
            username=settings.ATLASSIAN_EMAIL,
            password=settings.ATLASSIAN_API_TOKEN,
            cloud=True
        )

        # Get user info
        user = jira.myself()
        print(f"✅ Conexión a Jira exitosa")
        print(f"   User: {user.get('displayName')}")
        print(f"   Email: {user.get('emailAddress')}")

        # Get project
        try:
            project = jira.project("HAIDA")
            print(f"✅ Proyecto HAIDA encontrado")
            print(f"   Key: {project.get('key')}")
            print(f"   Name: {project.get('name')}")

            # Count issues
            issues = jira.jql("project=HAIDA")
            print(f"✅ Issues en HAIDA: {issues.get('total')}")

        except Exception as e:
            print(f"⚠️  Proyecto HAIDA no encontrado: {str(e)}")

        return True

    except Exception as e:
        print(f"❌ Error de conexión a Jira: {str(e)}")
        return False

def test_confluence():
    """Test 4: Verificar integración Confluence"""
    print_section("TEST 4: CONFLUENCE INTEGRATION")

    try:
        confluence = Confluence(
            url=f"{settings.ATLASSIAN_URL}/wiki",
            username=settings.ATLASSIAN_EMAIL,
            password=settings.ATLASSIAN_API_TOKEN,
            cloud=True
        )

        # Get user
        user = confluence.get_current_user()
        print(f"✅ Conexión a Confluence exitosa")
        print(f"   User: {user.get('displayName')}")

        # Get spaces
        spaces = confluence.get_all_spaces(limit=10)
        print(f"✅ Espacios accesibles: {len(spaces['results'])}")

        # Find HAIDA space
        haida_space = None
        for space in spaces['results']:
            if space['key'] == settings.CONFLUENCE_SPACE:
                haida_space = space
                break

        if haida_space:
            print(f"✅ Espacio HAIDA encontrado")
            print(f"   Name: {haida_space.get('name')}")
            print(f"   Key: {haida_space.get('key')}")

            # Count pages
            pages = confluence.get_all_pages_from_space(settings.CONFLUENCE_SPACE, limit=100)
            print(f"✅ Páginas en HAIDA: {len(pages)}")

        else:
            print(f"⚠️  Espacio HAIDA no encontrado")

        return True

    except Exception as e:
        print(f"❌ Error de conexión a Confluence: {str(e)}")
        return False

def test_telegram():
    """Test 5: Verificar bot de Telegram"""
    print_section("TEST 5: TELEGRAM BOT")

    if not settings.TELEGRAM_BOT_TOKEN:
        print("⚠️  TELEGRAM_BOT_TOKEN no configurado en .env")
        return False

    try:
        # Get bot info
        response = requests.get(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getMe",
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                bot = data.get('result')
                print(f"✅ Bot de Telegram configurado")
                print(f"   Username: @{bot.get('username')}")
                print(f"   Name: {bot.get('first_name')}")
                print(f"   ID: {bot.get('id')}")
                return True
            else:
                print(f"❌ Error: {data.get('description')}")
                return False
        else:
            print(f"❌ API de Telegram respondió con status {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Ejecutar todos los tests"""
    print("\n🚀 HAIDA - TEST DE INTEGRACIÓN COMPLETA")
    print(f"📅 {os.popen('date').read().strip()}")

    results = {
        "Base de Datos": test_database(),
        "API REST": test_api(),
        "Jira": test_jira(),
        "Confluence": test_confluence(),
        "Telegram Bot": test_telegram()
    }

    # Resumen
    print_section("RESUMEN")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test}")

    print(f"\n📊 Resultados: {passed}/{total} tests exitosos ({int(passed/total*100)}%)")

    if passed == total:
        print("\n🎉 ¡TODOS LOS TESTS PASARON! Sistema completamente integrado.")
        sys.exit(0)
    else:
        print("\n⚠️  Algunos tests fallaron. Revisa los errores arriba.")
        sys.exit(1)

if __name__ == "__main__":
    main()
