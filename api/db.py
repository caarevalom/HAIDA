"""
Database module for Vercel serverless functions
"""
import os
import psycopg2
import psycopg2.extras

DB_URL = os.environ.get("DATABASE_URL", "")

def get_conn():
    """Get database connection with SSL support for Supabase"""
    if not DB_URL:
        raise RuntimeError("DATABASE_URL not configured")
    # Connect with SSL for Supabase
    return psycopg2.connect(DB_URL, sslmode='require')

def fetch_one(sql: str, params: tuple = ()):
    """Fetch single row from database"""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return cur.fetchone()

def fetch_all(sql: str, params: tuple = ()):
    """Fetch all rows from database"""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return cur.fetchall()

def execute(sql: str, params: tuple = ()):
    """Execute SQL statement"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
