"""Internationalization endpoints"""
from fastapi import APIRouter, Request
from typing import Dict, Any
from app.core.i18n import resolve_locale

router = APIRouter()

@router.get("/translations/{locale}")
async def get_translations(request: Request, locale: str = "es") -> Dict[str, Any]:
    """Get translations for locale"""
    translations = {
        "es": {
            "common.hello": "Hola",
            "common.welcome": "Bienvenido a HAIDA",
            "nav.dashboard": "Principal",
            "nav.inbox": "Bandeja",
            "nav.explore": "Explorar",
            "nav.projects": "Proyectos",
            "nav.chat": "Chat IA"
        },
        "en": {
            "common.hello": "Hello",
            "common.welcome": "Welcome to HAIDA",
            "nav.dashboard": "Dashboard",
            "nav.inbox": "Inbox",
            "nav.explore": "Explore",
            "nav.projects": "Projects",
            "nav.chat": "AI Chat"
        },
        "fr": {
            "common.hello": "Bonjour",
            "common.welcome": "Bienvenue à HAIDA",
            "nav.dashboard": "Tableau de bord",
            "nav.inbox": "Boîte de réception",
            "nav.explore": "Explorer",
            "nav.projects": "Projets",
            "nav.chat": "Chat IA"
        }
    }

    resolved = locale or resolve_locale(request)
    return translations.get(resolved, translations["es"])
