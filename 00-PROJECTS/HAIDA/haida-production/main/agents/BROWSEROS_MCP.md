# BrowserOS MCP (alternativa Atlas)

BrowserOS ofrece un servidor MCP local que permite controlar el navegador desde agentes.
La guia oficial indica un endpoint HTTP tipo:

```
http://127.0.0.1:9226/mcp
```

## Pasos

1. Abre BrowserOS → `chrome://browseros/settings`.
2. Ve a la seccion MCP y copia la URL.
3. Exporta la variable:

```bash
export BROWSEROS_MCP_URL="http://127.0.0.1:9226/mcp"
```

4. En el shell `haida`:

```text
tools mcp list
tools mcp call <tool_name> <json_args>
```

## Nota

El comando `tools mcp` usa JSON-RPC (methods `tools/list` y `tools/call`) sobre HTTP.
Si BrowserOS cambia el transporte, ajusta la URL o usa `mcp-remote` con el endpoint oficial.
