import os
import psycopg2
import psycopg2.extras

DB_URL = os.environ.get("DATABASE_URL", "")

def get_conn():
    if not DB_URL:
        raise RuntimeError("DATABASE_URL no configurado")
    # Conexión sin pool (sencilla); en prod usar pool/biblioteca async
    return psycopg2.connect(DB_URL)

def fetch_one(sql: str, params: tuple = ()):
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return cur.fetchone()

def fetch_all(sql: str, params: tuple = ()):
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return cur.fetchall()

def execute(sql: str, params: tuple = ()):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
