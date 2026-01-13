# HAIDA CLI - Capacidades

Capacidades disponibles en modo interactivo:

## LLM Routing (multiagente)
- Providers: LM Studio local, RouteLLM, Perplexity (si hay API key).
- Cada agente declara sus capacidades y alcance por archivos.

## Contexto predefinido
- `context` permite cargar packs de contexto (core, routes, testing).
- Se combinan con el scope del agente.

## Navegacion web (safe)
- `tools web <url>` descarga contenido (truncado).

## BrowserOS MCP (tipo Atlas)
- `tools mcp list` y `tools mcp call` para llamar herramientas MCP de BrowserOS.

## Secretos (seguro)
- `secrets list` muestra nombres de claves (no valores).
- `secrets check` valida faltantes.
- `secrets show <KEY>` muestra valor solo si `HAIDA_SECRETS_PLAINTEXT=1`.

## Datos y analisis rapido
- `tools csv <path>` devuelve resumen y estadisticas basicas.

## Desarrollo y testing
- Agentes dedicados a backend, frontend, ISTQB, consistencia y negocio.
- Output estructurado con hallazgos y recomendaciones.
