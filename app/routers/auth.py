"""
Authentication Router - JWT Auth con Base de Datos
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse, TokenResponse, UserLogin
from app.services.auth import (
    authenticate_user,
    create_access_token,
    create_user,
    get_user_by_email,
    get_user_by_id,
    decode_token
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency para obtener usuario actual desde token JWT
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception

    return user

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint - OAuth2 compatible

    Autenticación con email/password, retorna JWT token
    """
    # Autenticar usuario
    user = authenticate_user(db, email=form_data.username, password=form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear access token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value if hasattr(user.role, 'value') else user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register new user endpoint

    Crea un nuevo usuario en el sistema
    """
    # Verificar si el usuario ya existe
    existing_user = get_user_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Crear usuario
    user = create_user(db, user_data=user_data)

    return user.to_dict()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """
    Get current user endpoint

    Obtiene información del usuario autenticado actual
    """
    return current_user.to_dict()

@router.post("/refresh")
async def refresh_token(current_user = Depends(get_current_user)):
    """
    Refresh token endpoint

    Genera un nuevo token para el usuario actual
    """
    # Crear nuevo token
    new_token = create_access_token(
        data={"sub": str(current_user.id), "role": current_user.role.value if hasattr(current_user.role, 'value') else current_user.role}
    )

    return {
        "access_token": new_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout():
    """
    Logout endpoint

    Logout es manejado client-side (eliminar token)
    Este endpoint es principalmente para logging/auditoría
    """
    return {"message": "Logged out successfully"}
