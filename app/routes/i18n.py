"""Internationalization endpoints"""
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/translations/{locale}")
async def get_translations(locale: str = "es") -> Dict[str, Any]:
    """Get translations for locale - TODO: Implement"""
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

    return translations.get(locale, translations["es"])
