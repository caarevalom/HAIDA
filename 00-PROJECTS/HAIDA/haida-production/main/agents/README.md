# HAIDA Multiagentes

Este directorio define un equipo multiagente para auditar HAIDA por areas:

- Negocio y producto
- Backend y API
- Frontend y UX
- QA/ISTQB
- Consistencia y datos estaticos

El archivo `agents/haida_agents.json` contiene:

- Proveedores LLM disponibles (LM Studio local, RouteLLM, Perplexity, Copilot Studio)
- Roles y prompts de cada agente
- Alcances por paths y limites de contexto

## Donde ver resultados

El CLI guarda reportes en `reports/agents` por defecto.

## Uso rapido

```bash
# Listar agentes
haida list

# Modo interactivo
haida

# Ver capacidades por agente
skills

# Ejecutar un agente
haida run --agent backend-auditor --prompt "Audita backend completo"

# Ejecutar todos
haida run-all --prompt "Audita HAIDA completo"

# Context pack (CLI)
haida run --agent backend-auditor --prompt "Audita backend" --context-pack routes
```

## UI mejorada (opcional)

Si quieres autocompletado e interfaz tipo Codex/Claude:

```bash
python3 -m venv ~/.local/haida-venv
~/.local/haida-venv/bin/pip install prompt_toolkit rich
```

## Herramientas en modo interactivo

Comando `tools` dentro del shell:

```text
tools ls [path]
tools cat <path>
tools head <path> [n]
tools tail <path> [n]
tools rg <pattern> [path]
tools web <url>
tools csv <path>
tools mcp list
tools mcp call <tool_name> <json_args>
```

Ver capacidades completas en `agents/CAPABILITIES.md`.

## Memoria

En el shell interactivo:

```
memory on
memory off
memory status
```

Los eventos se guardan en `reports/agents/haida_memory.jsonl`.

## Contexto predefinido

```
context list
context use core
context use routes
context use testing
context off
```

## Capacidades avanzadas

Ver detalles en `agents/CAPABILITIES.md`.

## Secretos (seguro)

```
secrets list
secrets check
secrets show <KEY>
```

Para mostrar valores completos, exporta `HAIDA_SECRETS_PLAINTEXT=1`.

## BrowserOS MCP (tipo Atlas)

1. Abre BrowserOS → `chrome://browseros/settings` → sección MCP → copia la URL (ej: `http://127.0.0.1:9226/mcp`).
2. Exporta la URL:

```bash
export BROWSEROS_MCP_URL="http://127.0.0.1:9226/mcp"
```

3. Usa en el shell:

```text
tools mcp list
tools mcp call <tool_name> <json_args>
```

Detalles en `agents/BROWSEROS_MCP.md`.
