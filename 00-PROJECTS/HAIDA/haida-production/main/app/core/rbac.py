from fastapi import HTTPException

def require_role(user: dict, allowed: set[str]):
    role = user.get("role", "user")
    if role not in allowed:
        raise HTTPException(403, f"Rol '{role}' no autorizado. Se requiere: {allowed}")
