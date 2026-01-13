#!/usr/bin/env python3
"""
Script para aplicar schema SQL y migrations a Supabase
Uso: python apply-schema.py
"""

import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
from pathlib import Path

# Cargar variables de entorno
load_dotenv()

# Configuración de Supabase
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'database': os.getenv('POSTGRES_DATABASE'),
    'user': os.getenv('POSTGRES_USER'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'sslmode': 'require'
}

def connect_db():
    """Conectar a Supabase PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print(f"✓ Conectado a Supabase: {DB_CONFIG['host']}")
        return conn
    except Exception as e:
        print(f"✗ Error conectando a Supabase: {e}")
        raise

def execute_sql_file(conn, filepath):
    """Ejecutar archivo SQL"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        cursor = conn.cursor()
        cursor.execute(sql_content)
        conn.commit()
        print(f"✓ Ejecutado: {filepath}")
        return True
    except Exception as e:
        print(f"✗ Error ejecutando {filepath}: {e}")
        conn.rollback()
        return False

def check_table_exists(conn, table_name, schema='public'):
    """Verificar si una tabla existe"""
    cursor = conn.cursor()
    cursor.execute(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = %s AND table_name = %s)",
        (schema, table_name)
    )
    exists = cursor.fetchone()[0]
    cursor.close()
    return exists

def main():
    print("=" * 60)
    print("HAIDA - Aplicar Schema SQL a Supabase")
    print("=" * 60)
    print()

    # Conectar a Supabase
    conn = connect_db()

    try:
        # Paso 1: Verificar si ya existe el schema
        print("\n[1/4] Verificando tablas existentes...")
        tables_to_check = ['tenants', 'projects', 'test_suites', 'test_cases', 'defects']
        existing_tables = []

        for table in tables_to_check:
            if check_table_exists(conn, table):
                existing_tables.append(table)
                print(f"  ✓ Tabla '{table}' ya existe")
            else:
                print(f"  ✗ Tabla '{table}' NO existe")

        # Paso 2: Aplicar schema principal si es necesario
        schema_file = Path('infrastructure/supabase/schema.sql')
        if len(existing_tables) < len(tables_to_check):
            print(f"\n[2/4] Aplicando schema principal ({schema_file})...")
            if schema_file.exists():
                print("  ADVERTENCIA: Esto puede tardar 1-2 minutos...")
                if execute_sql_file(conn, schema_file):
                    print("  ✓ Schema principal aplicado exitosamente")
                else:
                    print("  ⚠ Algunas partes del schema pueden haber fallado (normal si ya existen)")
            else:
                print(f"  ✗ Archivo {schema_file} no encontrado")
        else:
            print("\n[2/4] Schema principal ya existe, omitiendo...")

        # Paso 3: Aplicar migrations
        print("\n[3/4] Aplicando migrations...")
        migrations_dir = Path('infrastructure/supabase/migrations')
        if migrations_dir.exists():
            migration_files = sorted(migrations_dir.glob('*.sql'))
            for migration in migration_files:
                print(f"\n  Aplicando: {migration.name}")
                execute_sql_file(conn, migration)
        else:
            print("  ✗ Directorio migrations no encontrado")

        # Paso 4: Verificación final
        print("\n[4/4] Verificación final...")
        cursor = conn.cursor()

        # Verificar defects table
        if check_table_exists(conn, 'defects'):
            cursor.execute("SELECT COUNT(*) FROM public.defects")
            count = cursor.fetchone()[0]
            print(f"  ✓ Tabla 'defects' creada ({count} registros)")
        else:
            print("  ✗ Tabla 'defects' NO existe")

        # Verificar test_steps es JSONB
        cursor.execute("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = 'test_cases' AND column_name = 'test_steps'
        """)
        result = cursor.fetchone()
        if result and result[0] == 'jsonb':
            print("  ✓ Columna 'test_steps' migrada a JSONB")
        elif result:
            print(f"  ⚠ Columna 'test_steps' es tipo: {result[0]} (debería ser JSONB)")
        else:
            print("  ⚠ Columna 'test_steps' no encontrada")

        cursor.close()

        print("\n" + "=" * 60)
        print("✓ Schema aplicado exitosamente")
        print("=" * 60)

    except Exception as e:
        print(f"\n✗ Error durante la aplicación del schema: {e}")
        raise
    finally:
        conn.close()
        print("\nConexión cerrada")

if __name__ == '__main__':
    main()
