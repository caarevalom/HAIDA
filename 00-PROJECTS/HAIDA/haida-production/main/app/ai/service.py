"""
Servicio de IA HAIDA - Integración con DeepSeek R1
Sistema de entrenamiento y gestión de conversaciones
"""

import os
import json
from typing import List, Dict, Optional
from datetime import datetime
import requests

from app.config import settings
from app.ai.prompts import (
    SYSTEM_PROMPT_MASTER,
    get_dynamic_prompt,
    PROMPT_GENERATE_TEST_CASES,
    PROMPT_ANALYZE_TEST_RESULTS,
    PROMPT_CODE_REVIEW,
    PROMPT_TROUBLESHOOT_ERROR
)

class HAIDAAssistant:
    """
    Asistente de IA HAIDA con capacidades avanzadas
    Integración con DeepSeek R1 vía LM Studio
    """

    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        if self.provider in {"routellm", "chat-llm", "chat_llm", "abacus"}:
            self.api_url = settings.ROUTE_LLM_URL
            self.model = settings.ROUTE_LLM_MODEL
            self.api_key = settings.ROUTE_LLM_API_KEY
        else:
            self.provider = "lmstudio"
            self.api_url = settings.LM_STUDIO_URL
            self.model = settings.LM_STUDIO_MODEL
            self.api_key = settings.LM_STUDIO_API_KEY
        self.conversation_history: Dict[str, List[Dict]] = {}

        # Configuración del modelo
        self.default_config = {
            "temperature": 0.7,  # Creatividad moderada
            "max_tokens": 4096,  # Respuestas largas permitidas
            "top_p": 0.9,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stop": None
        }

        # Configuraciones especializadas por tarea
        self.task_configs = {
            "code_generation": {
                "temperature": 0.3,  # Más determinístico para código
                "max_tokens": 4096
            },
            "creative": {
                "temperature": 0.9,  # Más creativo para brainstorming
                "max_tokens": 2048
            },
            "analysis": {
                "temperature": 0.5,  # Balanceado para análisis
                "max_tokens": 3072
            },
            "test_cases": {
                "temperature": 0.4,  # Estructurado para test cases
                "max_tokens": 4096
            }
        }

    def _append_memory_entry(
        self,
        conversation_id: str,
        user_message: str,
        assistant_response: str,
        task_type: str
    ) -> None:
        memory_path = os.environ.get(
            "HAIDA_MEMORY_FILE",
            os.path.expanduser("~/.codex/memory.jsonl")
        )
        entry = {
            "ts": datetime.utcnow().isoformat(),
            "type": "chat",
            "content": f"user: {user_message}\nassistant: {assistant_response}",
            "tags": [
                "haida",
                "ai",
                f"conversation:{conversation_id}",
                f"task:{task_type}",
                f"provider:{self.provider}",
                f"model:{self.model}",
            ],
            "meta": {
                "conversation_id": conversation_id,
                "task_type": task_type,
                "provider": self.provider,
                "model": self.model,
            },
        }
        try:
            memory_dir = os.path.dirname(memory_path) or "."
            os.makedirs(memory_dir, exist_ok=True)
            with open(memory_path, "a", encoding="utf-8") as handle:
                handle.write(json.dumps(entry, ensure_ascii=True) + "\n")
        except Exception:
            # Evitar romper el flujo principal si falla el log de memoria.
            return

    def _get_system_prompt(self, context: Optional[Dict] = None) -> str:
        """
        Obtener prompt del sistema según contexto

        Args:
            context: Contexto de la conversación (rol, fase, urgencia)

        Returns:
            str: System prompt apropiado
        """
        if context:
            return get_dynamic_prompt(context)
        return SYSTEM_PROMPT_MASTER

    def _prepare_messages(
        self,
        user_message: str,
        conversation_id: str,
        system_prompt: Optional[str] = None,
        include_history: bool = True
    ) -> List[Dict]:
        """
        Preparar mensajes para enviar al modelo

        Args:
            user_message: Mensaje del usuario
            conversation_id: ID de la conversación
            system_prompt: Prompt del sistema (opcional)
            include_history: Incluir historial de conversación

        Returns:
            List[Dict]: Lista de mensajes formateados
        """
        messages = []

        # Agregar system prompt
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })

        # Agregar historial de conversación (últimos 10 mensajes)
        if include_history and conversation_id in self.conversation_history:
            history = self.conversation_history[conversation_id][-10:]
            messages.extend(history)

        # Agregar mensaje actual del usuario
        messages.append({
            "role": "user",
            "content": user_message
        })

        return messages

    def _call_model(
        self,
        messages: List[Dict],
        config: Optional[Dict] = None
    ) -> str:
        """
        Llamar al modelo DeepSeek R1 vía LM Studio

        Args:
            messages: Lista de mensajes
            config: Configuración del modelo (temp, max_tokens, etc.)

        Returns:
            str: Respuesta del modelo
        """
        # Usar configuración por defecto si no se proporciona
        model_config = config or self.default_config

        # Payload para API compatible con OpenAI
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": model_config.get("temperature", 0.7),
            "max_tokens": model_config.get("max_tokens", 4096),
            "top_p": model_config.get("top_p", 0.9),
            "frequency_penalty": model_config.get("frequency_penalty", 0.0),
            "presence_penalty": model_config.get("presence_penalty", 0.0),
            "stream": False
        }

        try:
            headers = {}
            if self.api_key and (self.provider != "lmstudio" or self.api_key != "lm-studio"):
                headers["Authorization"] = f"Bearer {self.api_key}"

            # Llamar a API compatible con OpenAI
            response = requests.post(
                f"{self.api_url}/chat/completions",
                json=payload,
                headers=headers or None,
                timeout=120  # 2 minutos timeout
            )

            response.raise_for_status()
            result = response.json()

            # Extraer respuesta
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
            else:
                return "Error: No se recibió respuesta del modelo"

        except requests.exceptions.ConnectionError:
            if self.provider == "lmstudio":
                return "⚠️ **LM Studio no está corriendo**\n\nPara usar la IA:\n1. Abre LM Studio\n2. Carga el modelo DeepSeek R1\n3. Inicia el servidor local\n4. Intenta nuevamente"
            return "⚠️ **No se pudo conectar con el proveedor de IA**\n\nVerifica la URL y conectividad del servicio."
        except requests.exceptions.Timeout:
            return "⚠️ **Timeout**: El modelo tardó demasiado en responder. Intenta con una pregunta más corta."
        except Exception as e:
            if self.provider == "lmstudio":
                return f"❌ **Error**: {str(e)}\n\nVerifica que LM Studio esté corriendo correctamente."
            return f"❌ **Error**: {str(e)}\n\nVerifica la configuración del proveedor de IA."

    def _save_to_history(
        self,
        conversation_id: str,
        user_message: str,
        assistant_response: str
    ):
        """
        Guardar conversación en historial

        Args:
            conversation_id: ID de la conversación
            user_message: Mensaje del usuario
            assistant_response: Respuesta del asistente
        """
        if conversation_id not in self.conversation_history:
            self.conversation_history[conversation_id] = []

        self.conversation_history[conversation_id].extend([
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": assistant_response}
        ])

        # Mantener solo últimos 20 mensajes (10 pares pregunta-respuesta)
        if len(self.conversation_history[conversation_id]) > 20:
            self.conversation_history[conversation_id] = \
                self.conversation_history[conversation_id][-20:]

    def chat(
        self,
        user_message: str,
        conversation_id: str = "default",
        context: Optional[Dict] = None,
        task_type: str = "general"
    ) -> str:
        """
        Chatear con HAIDA AI

        Args:
            user_message: Mensaje del usuario
            conversation_id: ID único de la conversación (por usuario)
            context: Contexto adicional (rol, fase, urgencia)
            task_type: Tipo de tarea (general, code_generation, test_cases, etc.)

        Returns:
            str: Respuesta del asistente
        """
        # Obtener system prompt según contexto
        system_prompt = self._get_system_prompt(context)

        # Preparar mensajes
        messages = self._prepare_messages(
            user_message=user_message,
            conversation_id=conversation_id,
            system_prompt=system_prompt,
            include_history=True
        )

        # Obtener configuración según tipo de tarea
        config = self.task_configs.get(task_type, self.default_config)

        # Llamar al modelo
        response = self._call_model(messages, config)

        # Guardar en historial
        self._save_to_history(conversation_id, user_message, response)
        self._append_memory_entry(conversation_id, user_message, response, task_type)

        return response

    def generate_test_cases(
        self,
        specification: str,
        conversation_id: str = "test_gen"
    ) -> str:
        """
        Generar test cases desde especificación funcional

        Args:
            specification: Especificación funcional en texto
            conversation_id: ID de conversación

        Returns:
            str: Test cases generados en formato estructurado
        """
        # Preparar prompt especializado
        system_prompt = SYSTEM_PROMPT_MASTER + "\n\n" + PROMPT_GENERATE_TEST_CASES

        # Construir mensaje del usuario
        user_message = f"""
Genera test cases ISTQB-compliant para la siguiente especificación:

---
{specification}
---

Formato de salida: Markdown table con columnas:
| ID | Título | Precondiciones | Pasos | Datos Prueba | Resultado Esperado | Tipo | Prioridad | Requisito |
"""

        messages = self._prepare_messages(
            user_message=user_message,
            conversation_id=conversation_id,
            system_prompt=system_prompt,
            include_history=False  # No incluir historial para test generation
        )

        # Configuración específica para test cases
        response = self._call_model(messages, self.task_configs["test_cases"])

        self._append_memory_entry(conversation_id, user_message, response, "test_cases")

        return response

    def analyze_test_results(
        self,
        test_results: Dict,
        conversation_id: str = "test_analysis"
    ) -> str:
        """
        Analizar resultados de ejecución de tests

        Args:
            test_results: Diccionario con resultados (passed, failed, skipped, etc.)
            conversation_id: ID de conversación

        Returns:
            str: Análisis detallado con insights y recomendaciones
        """
        system_prompt = SYSTEM_PROMPT_MASTER + "\n\n" + PROMPT_ANALYZE_TEST_RESULTS

        user_message = f"""
Analiza los siguientes resultados de tests y proporciona insights:

```json
{json.dumps(test_results, indent=2)}
```

Incluye:
1. Pass/Fail rate y tendencias
2. Tests problemáticos (flaky, lentos)
3. Patrones de errores
4. Root causes probables
5. Recomendaciones concretas
"""

        messages = self._prepare_messages(
            user_message=user_message,
            conversation_id=conversation_id,
            system_prompt=system_prompt,
            include_history=False
        )

        response = self._call_model(messages, self.task_configs["analysis"])

        self._append_memory_entry(conversation_id, user_message, response, "analysis")

        return response

    def code_review(
        self,
        code: str,
        language: str = "python",
        conversation_id: str = "code_review"
    ) -> str:
        """
        Hacer code review de tests automatizados

        Args:
            code: Código a revisar
            language: Lenguaje de programación
            conversation_id: ID de conversación

        Returns:
            str: Feedback detallado con sugerencias
        """
        system_prompt = SYSTEM_PROMPT_MASTER + "\n\n" + PROMPT_CODE_REVIEW

        user_message = f"""
Haz code review del siguiente código de tests ({language}):

```{language}
{code}
```

Proporciona:
1. Problemas específicos encontrados
2. Sugerencias de mejora con código
3. Best practices no seguidas
4. Puntuación de calidad (1-10)
"""

        messages = self._prepare_messages(
            user_message=user_message,
            conversation_id=conversation_id,
            system_prompt=system_prompt,
            include_history=False
        )

        response = self._call_model(messages, self.task_configs["code_generation"])

        self._append_memory_entry(conversation_id, user_message, response, "code_generation")

        return response

    def troubleshoot_error(
        self,
        error_message: str,
        context: str = "",
        conversation_id: str = "troubleshoot"
    ) -> str:
        """
        Ayudar a resolver error de test

        Args:
            error_message: Mensaje de error completo
            context: Contexto adicional (test name, browser, etc.)
            conversation_id: ID de conversación

        Returns:
            str: Troubleshooting steps y solución propuesta
        """
        system_prompt = SYSTEM_PROMPT_MASTER + "\n\n" + PROMPT_TROUBLESHOOT_ERROR

        user_message = f"""
Ayúdame a resolver este error:

**Error**:
```
{error_message}
```

**Contexto**:
{context if context else "No hay contexto adicional"}

Proporciona:
1. Identificación del error
2. Causas posibles
3. Steps para debuggear
4. Solución concreta (código/config)
5. Prevención futura
"""

        messages = self._prepare_messages(
            user_message=user_message,
            conversation_id=conversation_id,
            system_prompt=system_prompt,
            include_history=True  # Incluir historial para contexto
        )

        response = self._call_model(messages, self.task_configs["analysis"])

        self._append_memory_entry(conversation_id, user_message, response, "troubleshoot")

        return response

    def clear_history(self, conversation_id: str):
        """
        Limpiar historial de conversación

        Args:
            conversation_id: ID de la conversación a limpiar
        """
        if conversation_id in self.conversation_history:
            del self.conversation_history[conversation_id]

    def get_conversation_history(self, conversation_id: str) -> List[Dict]:
        """
        Obtener historial de conversación

        Args:
            conversation_id: ID de la conversación

        Returns:
            List[Dict]: Lista de mensajes
        """
        return self.conversation_history.get(conversation_id, [])


# Singleton instance
_assistant_instance = None

def get_assistant() -> HAIDAAssistant:
    """
    Obtener instancia singleton del asistente

    Returns:
        HAIDAAssistant: Instancia del asistente
    """
    global _assistant_instance
    if _assistant_instance is None:
        _assistant_instance = HAIDAAssistant()
    return _assistant_instance
