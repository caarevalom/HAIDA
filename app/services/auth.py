"""
Servicio de Autenticación
Lógica de negocio para auth, JWT, passwords
"""

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from typing import Optional

from app.config import settings
from app.models.user import User
from app.schemas.user import UserCreate

# Context para hashing de passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar password contra hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashear password con bcrypt"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crear JWT token

    Args:
        data: Diccionario con datos a incluir en token (ej: {"sub": user_id})
        expires_delta: Tiempo de expiración custom (default: JWT_EXPIRATION_MINUTES)

    Returns:
        str: JWT token encoded
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """
    Decodificar JWT token

    Args:
        token: JWT token string

    Returns:
        dict: Payload del token o None si es inválido
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Autenticar usuario con email y password

    Args:
        db: Sesión de base de datos
        email: Email del usuario
        password: Password en texto plano

    Returns:
        User: Usuario autenticado o None si credenciales inválidas
    """
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user

def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Crear nuevo usuario

    Args:
        db: Sesión de base de datos
        user_data: Datos del usuario a crear

    Returns:
        User: Usuario creado
    """
    # Hash del password
    hashed_password = get_password_hash(user_data.password)

    # Crear usuario
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Obtener usuario por email

    Args:
        db: Sesión de base de datos
        email: Email del usuario

    Returns:
        User: Usuario o None si no existe
    """
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """
    Obtener usuario por ID

    Args:
        db: Sesión de base de datos
        user_id: UUID del usuario

    Returns:
        User: Usuario o None si no existe
    """
    return db.query(User).filter(User.id == user_id).first()
