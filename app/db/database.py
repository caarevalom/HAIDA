"""
Configuración de base de datos con SQLAlchemy
Conexión a Supabase PostgreSQL
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False  # Set True para debug SQL
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

def get_db():
    """
    Dependency para obtener sesión de base de datos
    Uso: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Inicializar base de datos
    Crear todas las tablas si no existen
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Base de datos inicializada")

def check_db_connection():
    """
    Verificar conexión a base de datos
    Retorna True si la conexión es exitosa
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        print(f"❌ Error de conexión a BD: {str(e)}")
        return False
