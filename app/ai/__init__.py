"""
Módulo de IA HAIDA
Sistema avanzado de asistente con múltiples roles profesionales
"""

from app.ai.service import HAIDAAssistant, get_assistant
from app.ai.prompts import (
    SYSTEM_PROMPT_MASTER,
    PROMPT_QA_TESTER,
    PROMPT_DEVELOPER,
    PROMPT_ARCHITECT,
    get_dynamic_prompt
)

__all__ = [
    "HAIDAAssistant",
    "get_assistant",
    "SYSTEM_PROMPT_MASTER",
    "PROMPT_QA_TESTER",
    "PROMPT_DEVELOPER",
    "PROMPT_ARCHITECT",
    "get_dynamic_prompt"
]
