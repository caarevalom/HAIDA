#!/usr/bin/env python3
import argparse
import json
import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path
from datetime import datetime
import glob
try:
    import requests  # type: ignore
except Exception:  # pragma: no cover - fallback for minimal Python installs
    requests = None
try:
    from prompt_toolkit import PromptSession
    from prompt_toolkit.completion import WordCompleter
    from prompt_toolkit.history import FileHistory
except Exception:
    PromptSession = None
    WordCompleter = None
    FileHistory = None
try:
    from rich.console import Console
    from rich.markdown import Markdown
except Exception:
    Console = None
    Markdown = None


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = REPO_ROOT / "agents" / "haida_agents.json"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "reports" / "agents"
DEFAULT_MEMORY_FILE = DEFAULT_OUTPUT_DIR / "haida_memory.jsonl"
DEFAULT_HISTORY_FILE = DEFAULT_OUTPUT_DIR / "haida_history.txt"
GLOBAL_MEMORY_FILE = Path(os.environ.get("HAIDA_MEMORY_FILE", os.path.expanduser("~/.codex/memory.jsonl")))


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def resolve_provider(agent: dict, providers: dict) -> dict:
    for name in agent.get("preferred_providers", []):
        provider = providers.get(name)
        if not provider:
            continue
        if provider.get("type") != "openai":
            continue
        api_url = os.getenv(provider.get("api_url_env", ""), provider.get("default_url", "")).strip()
        model = os.getenv(provider.get("model_env", ""), provider.get("default_model", "")).strip()
        api_key = os.getenv(provider.get("api_key_env", ""), "").strip()
        if provider.get("requires_key") and not api_key:
            continue
        if not api_url or not model:
            continue
        return {
            "name": name,
            "api_url": api_url.rstrip("/"),
            "model": model,
            "api_key": api_key
        }
    return {}


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    return any(part in parts for part in {"node_modules", ".git", "venv", "allure-results", "test-results"})


def collect_context(paths: list, max_chars_per_file: int, max_total_chars: int) -> str:
    collected = []
    total_chars = 0
    for pattern in paths:
        for file_path in glob.glob(str(REPO_ROOT / pattern), recursive=True):
            path = Path(file_path)
            if path.is_dir() or should_skip(path):
                continue
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            if len(content) > max_chars_per_file:
                content = content[:max_chars_per_file] + "\n...[TRUNCADO]\n"
            chunk = f"\n\n### {path.relative_to(REPO_ROOT)}\n{content}"
            if total_chars + len(chunk) > max_total_chars:
                return "".join(collected)
            collected.append(chunk)
            total_chars += len(chunk)
    return "".join(collected)


def call_llm(provider: dict, system_prompt: str, user_prompt: str) -> str:
    payload = {
        "model": provider["model"],
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 4096
    }
    headers = {}
    if provider.get("api_key"):
        headers["Authorization"] = f"Bearer {provider['api_key']}"
    if requests is not None:
        response = requests.post(
            f"{provider['api_url']}/chat/completions",
            json=payload,
            headers=headers or None,
            timeout=180
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

    import json as _json
    import urllib.request

    req = urllib.request.Request(
        f"{provider['api_url']}/chat/completions",
        data=_json.dumps(payload).encode("utf-8"),
        headers=headers or {"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = _json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"]


def write_memory(
    file_path: Path,
    agent_id: str,
    provider_name: str,
    prompt: str,
    output_path: Path
):
    file_path.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "ts": datetime.utcnow().isoformat(),
        "agent_id": agent_id,
        "provider": provider_name,
        "prompt_preview": prompt[:300],
        "output_path": str(output_path)
    }
    with file_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=True) + "\n")

    try:
        response_text = ""
        if output_path.exists():
            response_text = output_path.read_text(encoding="utf-8", errors="ignore")
        global_entry = {
            "ts": datetime.utcnow().isoformat(),
            "type": "chat",
            "content": f"user: {prompt}\nassistant: {response_text}",
            "tags": ["haida", "ai", "cli", f"agent:{agent_id}", f"provider:{provider_name}"],
            "meta": {
                "agent_id": agent_id,
                "provider": provider_name,
                "output_path": str(output_path),
            },
        }
        GLOBAL_MEMORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        with GLOBAL_MEMORY_FILE.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(global_entry, ensure_ascii=True) + "\n")
    except Exception:
        pass


def run_agent(
    agent: dict,
    providers: dict,
    prompt: str,
    dry_run: bool,
    extra_paths: list | None = None
) -> str:
    provider = resolve_provider(agent, providers)
    if not provider:
        return f"[SKIP] {agent['id']}: No hay provider disponible."

    paths = list(agent.get("scope_paths", []))
    if extra_paths:
        paths.extend(extra_paths)

    context = collect_context(
        paths,
        agent.get("max_chars_per_file", 8000),
        agent.get("max_total_chars", 80000)
    )
    user_prompt = f"{prompt}\n\nFormato de salida: {agent.get('output_format')}\n\nContexto:{context}"

    if dry_run:
        return f"[DRY RUN] {agent['id']} usaría {provider['name']} ({provider['model']})."

    return call_llm(provider, agent.get("system_prompt", ""), user_prompt)


def write_report(agent_id: str, content: str) -> Path:
    DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    output_path = DEFAULT_OUTPUT_DIR / f"{agent_id}-{timestamp}.md"
    output_path.write_text(content, encoding="utf-8")
    return output_path


def _ensure_repo_path(raw_path: str) -> Path:
    path = Path(raw_path)
    resolved = (REPO_ROOT / path).resolve() if not path.is_absolute() else path.resolve()
    if not str(resolved).startswith(str(REPO_ROOT)):
        raise ValueError("Ruta fuera del repo.")
    return resolved


def tool_ls(args: list) -> str:
    target = _ensure_repo_path(args[0]) if args else REPO_ROOT
    items = sorted(target.iterdir())
    return "\n".join(str(p.relative_to(REPO_ROOT)) for p in items)


def tool_cat(args: list) -> str:
    if not args:
        return "Uso: tool cat <path>"
    target = _ensure_repo_path(args[0])
    content = target.read_text(encoding="utf-8", errors="ignore")
    return content[:4000] + ("\n...[TRUNCADO]" if len(content) > 4000 else "")


def tool_head(args: list) -> str:
    if not args:
        return "Uso: tool head <path> [n]"
    target = _ensure_repo_path(args[0])
    lines = target.read_text(encoding="utf-8", errors="ignore").splitlines()
    limit = int(args[1]) if len(args) > 1 else 40
    return "\n".join(lines[:limit])


def tool_tail(args: list) -> str:
    if not args:
        return "Uso: tool tail <path> [n]"
    target = _ensure_repo_path(args[0])
    lines = target.read_text(encoding="utf-8", errors="ignore").splitlines()
    limit = int(args[1]) if len(args) > 1 else 40
    return "\n".join(lines[-limit:])


def tool_rg(args: list) -> str:
    if not args:
        return "Uso: tool rg <pattern> [path]"
    pattern = args[0]
    target = _ensure_repo_path(args[1]) if len(args) > 1 else REPO_ROOT
    if shutil.which("rg"):
        result = subprocess.run(
            ["rg", pattern, str(target)],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True
        )
        return result.stdout.strip() or result.stderr.strip()
    # Fallback simple
    matches = []
    for file_path in target.rglob("*"):
        if file_path.is_dir() or should_skip(file_path):
            continue
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if pattern in content:
            rel = file_path.relative_to(REPO_ROOT)
            matches.append(str(rel))
    return "\n".join(matches) or "Sin resultados."


def _http_get(url: str) -> str:
    if not url.startswith("http://") and not url.startswith("https://"):
        raise ValueError("URL invalida. Usa http(s).")
    if requests is not None:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        text = response.text
    else:
        import urllib.request

        with urllib.request.urlopen(url, timeout=30) as resp:
            text = resp.read().decode("utf-8", errors="ignore")
    return text[:8000] + ("\n...[TRUNCADO]" if len(text) > 8000 else "")


def tool_web(args: list) -> str:
    if not args:
        return "Uso: tools web <url>"
    return _http_get(args[0])


def _mcp_request(url: str, method: str, params: dict | None = None) -> dict:
    payload = {"jsonrpc": "2.0", "id": 1, "method": method}
    if params:
        payload["params"] = params
    if requests is not None:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    import json as _json
    import urllib.request

    req = urllib.request.Request(
        url,
        data=_json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return _json.loads(resp.read().decode("utf-8"))


def tool_mcp(args: list) -> str:
    if not args:
        return "Uso: tools mcp <list|call> [args...]"
    url = os.environ.get("BROWSEROS_MCP_URL", "").strip()
    if not url:
        return "BROWSEROS_MCP_URL no configurada. Ej: http://127.0.0.1:9226/mcp"
    action = args[0]
    if action == "list":
        data = _mcp_request(url, "tools/list")
        return json.dumps(data, indent=2)
    if action == "call":
        if len(args) < 2:
            return "Uso: tools mcp call <tool_name> [json_args]"
        name = args[1]
        raw_args = args[2] if len(args) > 2 else "{}"
        try:
            parsed = json.loads(raw_args)
        except Exception:
            return "json_args invalido. Ej: '{\"url\": \"https://haida.stayarta.com\"}'"
        data = _mcp_request(url, "tools/call", {"name": name, "arguments": parsed})
        return json.dumps(data, indent=2)
    return "Accion no soportada. Usa list o call."


def tool_csv(args: list) -> str:
    if not args:
        return "Uso: tools csv <path>"
    target = _ensure_repo_path(args[0])
    import csv
    import statistics

    rows = []
    with target.open("r", encoding="utf-8", errors="ignore") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            rows.append(row)
    if not rows:
        return "CSV vacio."
    fields = reader.fieldnames or []
    summary = {
        "rows": len(rows),
        "columns": fields
    }
    numeric = {}
    for field in fields:
        values = []
        for row in rows:
            try:
                values.append(float(row.get(field, "")))
            except Exception:
                continue
        if values:
            numeric[field] = {
                "min": min(values),
                "max": max(values),
                "mean": statistics.mean(values)
            }
    return json.dumps({"summary": summary, "numeric": numeric}, indent=2)


def run_tool(command: str) -> str:
    parts = shlex.split(command)
    if not parts:
        return "Uso: tools <ls|cat|head|tail|rg|web|csv|mcp> ..."
    name, args = parts[0], parts[1:]
    tools = {
        "ls": tool_ls,
        "cat": tool_cat,
        "head": tool_head,
        "tail": tool_tail,
        "rg": tool_rg,
        "web": tool_web,
        "mcp": tool_mcp,
        "csv": tool_csv
    }
    handler = tools.get(name)
    if not handler:
        return "Tool no soportada. Usa: ls, cat, head, tail, rg."
    try:
        return handler(args)
    except Exception as exc:
        return f"Error herramienta: {exc}"


def interactive_shell(config: dict):
    providers = config.get("providers", {})
    agents = config.get("agents", [])
    context_packs = config.get("context_packs", {})
    default_pack = config.get("default_context_pack", "")
    active_agent = None
    active_pack = default_pack if default_pack in context_packs else ""
    memory_enabled = False
    memory_file = DEFAULT_MEMORY_FILE
    console = Console() if Console else None
    session = None
    completer = None

    def emit(text: str, markdown: bool = False):
        if console:
            if markdown and Markdown:
                console.print(Markdown(text))
            else:
                console.print(text)
        else:
            print(text)

    emit("HAIDA Interactive")
    emit("Escribe 'help' para comandos. 'list' para agentes. Enter para ejecutar.")
    if console and (PromptSession is None or WordCompleter is None):
        emit("Tip: instala prompt_toolkit y rich para autocompletado y UI.")

    if sys.stdin.isatty() and PromptSession and WordCompleter and FileHistory:
        DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        DEFAULT_HISTORY_FILE.touch(exist_ok=True)
        commands = [
            "list",
            "skills",
            "use",
            "run",
            "run-all",
            "context",
            "tools",
            "providers",
            "memory",
            "help",
            "clear",
            "exit",
            "quit"
        ]
        agent_ids = [agent["id"] for agent in agents]
        pack_ids = list(context_packs.keys())
        completer = WordCompleter(commands + agent_ids + pack_ids, ignore_case=True)
        session = PromptSession(history=FileHistory(str(DEFAULT_HISTORY_FILE)))

    while True:
        try:
            if session:
                line = session.prompt("haida> ", completer=completer).strip()
            else:
                line = input("haida> ").strip()
        except (EOFError, KeyboardInterrupt):
            emit("\nSaliendo.")
            return

        if not line:
            continue

        if line in {"exit", "quit"}:
            return

        if line in {"help", "?"}:
            emit(
                "Comandos: list, skills, use <agent>, run <prompt>, run-all <prompt>,\n"
                "context [list|use|off|status], tools <cmd>, secrets <cmd>,\n"
                "providers, memory [on|off|status], clear, exit"
            )
            continue

        if line == "list":
            for agent in agents:
                emit(f"{agent['id']}: {agent['name']} - {agent.get('goal')}")
            continue
        if line == "skills":
            for agent in agents:
                caps = ", ".join(agent.get("capabilities", []))
                emit(f"{agent['id']}: {caps or 'sin capacidades definidas'}")
            continue

        if line.startswith("context"):
            parts = line.split(" ", 2)
            if len(parts) == 1 or parts[1] == "status":
                status = active_pack or "off"
                emit(f"context {status}")
                continue
            if parts[1] == "list":
                for pack_id in context_packs:
                    emit(pack_id)
                continue
            if parts[1] == "off":
                active_pack = ""
                emit("context off")
                continue
            if parts[1] == "use" and len(parts) == 3:
                pack_id = parts[2].strip()
                if pack_id in context_packs:
                    active_pack = pack_id
                    emit(f"context {pack_id}")
                else:
                    emit("context pack no encontrado")
                continue
            emit("Uso: context list|use <pack>|off|status")
            continue

        if line.startswith("use "):
            agent_id = line.split(" ", 1)[1].strip()
            if any(a["id"] == agent_id for a in agents):
                active_agent = agent_id
                emit(f"Agente activo: {agent_id}")
            else:
                emit("Agente no encontrado.")
            continue

        if line.startswith("providers"):
            for agent in agents:
                provider = resolve_provider(agent, providers)
                name = provider.get("name", "none") if provider else "none"
                model = provider.get("model", "-") if provider else "-"
                emit(f"{agent['id']}: {name} ({model})")
            continue

        if line.startswith("secrets"):
            parts = line.split(" ", 2)
            env_path = REPO_ROOT / ".env"
            env_keys = []
            if env_path.exists():
                for line_item in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
                    line_item = line_item.strip()
                    if not line_item or line_item.startswith("#") or "=" not in line_item:
                        continue
                    env_keys.append(line_item.split("=", 1)[0].strip())

            if len(parts) == 1 or parts[1] == "list":
                keys = sorted(set(env_keys + list(os.environ.keys())))
                emit("\n".join(keys) or "Sin secretos.")
                continue
            if parts[1] == "check":
                missing = [key for key in env_keys if not os.environ.get(key)]
                emit("\n".join(missing) or "Sin faltantes.")
                continue
            if parts[1] == "show" and len(parts) == 3:
                key = parts[2].strip()
                allow_plain = os.environ.get("HAIDA_SECRETS_PLAINTEXT", "") == "1"
                value = os.environ.get(key, "")
                if not allow_plain:
                    masked = value[:2] + "***" + value[-2:] if value else ""
                    emit(masked or "(vacio)")
                else:
                    emit(value or "(vacio)")
                continue
            emit("Uso: secrets list|check|show <KEY>")
            continue

        if line.startswith("memory"):
            parts = line.split(" ", 1)
            if len(parts) == 1 or parts[1] == "status":
                status = "on" if memory_enabled else "off"
                emit(f"memory {status} -> {memory_file}")
                continue
            if parts[1] == "on":
                memory_enabled = True
                emit(f"memory on -> {memory_file}")
            elif parts[1] == "off":
                memory_enabled = False
                emit("memory off")
            else:
                emit("Uso: memory on|off|status")
            continue

        if line.startswith("tools "):
            emit(run_tool(line.split(" ", 1)[1]))
            continue

        if line.startswith("clear"):
            os.system("clear")
            continue

        if line.startswith("run-all "):
            prompt = line.split(" ", 1)[1]
            extra_paths = context_packs.get(active_pack, {}).get("paths", []) if active_pack else []
            for agent in agents:
                result = run_agent(agent, providers, prompt, dry_run=False, extra_paths=extra_paths)
                output_path = write_report(agent["id"], result)
                emit(str(output_path))
                if memory_enabled:
                    provider = resolve_provider(agent, providers)
                    write_memory(
                        memory_file,
                        agent["id"],
                        provider.get("name", "unknown") if provider else "unknown",
                        prompt,
                        output_path
                    )
            continue

        if line.startswith("run "):
            prompt = line.split(" ", 1)[1]
            extra_paths = context_packs.get(active_pack, {}).get("paths", []) if active_pack else []
            if active_agent:
                agent = next((a for a in agents if a["id"] == active_agent), None)
                if not agent:
                    emit("Agente no encontrado.")
                    continue
                result = run_agent(agent, providers, prompt, dry_run=False, extra_paths=extra_paths)
                output_path = write_report(agent["id"], result)
                emit(str(output_path))
                if output_path.exists():
                    emit(output_path.read_text(encoding="utf-8"), markdown=True)
                if memory_enabled:
                    provider = resolve_provider(agent, providers)
                    write_memory(
                        memory_file,
                        agent["id"],
                        provider.get("name", "unknown") if provider else "unknown",
                        prompt,
                        output_path
                    )
                continue
            # No active agent -> run-all
            for agent in agents:
                result = run_agent(agent, providers, prompt, dry_run=False, extra_paths=extra_paths)
                output_path = write_report(agent["id"], result)
                emit(str(output_path))
                if memory_enabled:
                    provider = resolve_provider(agent, providers)
                    write_memory(
                        memory_file,
                        agent["id"],
                        provider.get("name", "unknown") if provider else "unknown",
                        prompt,
                        output_path
                    )
            continue

        # Plain prompt: use active agent or run-all
        prompt = line
        extra_paths = context_packs.get(active_pack, {}).get("paths", []) if active_pack else []
        if active_agent:
            agent = next((a for a in agents if a["id"] == active_agent), None)
            if not agent:
                emit("Agente no encontrado.")
                continue
            result = run_agent(agent, providers, prompt, dry_run=False, extra_paths=extra_paths)
            output_path = write_report(agent["id"], result)
            emit(str(output_path))
            if output_path.exists():
                emit(output_path.read_text(encoding="utf-8"), markdown=True)
            if memory_enabled:
                provider = resolve_provider(agent, providers)
                write_memory(
                    memory_file,
                    agent["id"],
                    provider.get("name", "unknown") if provider else "unknown",
                    prompt,
                    output_path
                )
        else:
            for agent in agents:
                result = run_agent(agent, providers, prompt, dry_run=False, extra_paths=extra_paths)
                output_path = write_report(agent["id"], result)
                emit(str(output_path))
                if memory_enabled:
                    provider = resolve_provider(agent, providers)
                    write_memory(
                        memory_file,
                        agent["id"],
                        provider.get("name", "unknown") if provider else "unknown",
                        prompt,
                        output_path
                    )



def main() -> int:
    if len(sys.argv) == 1:
        config = load_config(DEFAULT_CONFIG)
        interactive_shell(config)
        return 0

    parser = argparse.ArgumentParser(description="HAIDA multiagente CLI")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG))
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("list", help="Listar agentes")

    run_parser = subparsers.add_parser("run", help="Ejecutar un agente")
    run_parser.add_argument("--agent", required=True)
    run_parser.add_argument("--prompt", required=True)
    run_parser.add_argument("--dry-run", action="store_true")
    run_parser.add_argument("--context-pack", default="")

    run_all_parser = subparsers.add_parser("run-all", help="Ejecutar todos los agentes")
    run_all_parser.add_argument("--prompt", required=True)
    run_all_parser.add_argument("--dry-run", action="store_true")
    run_all_parser.add_argument("--context-pack", default="")

    args = parser.parse_args()
    config = load_config(Path(args.config))
    providers = config.get("providers", {})
    agents = config.get("agents", [])

    if args.command == "list":
        for agent in agents:
            print(f"{agent['id']}: {agent['name']} - {agent.get('goal')}")
        return 0

    context_packs = config.get("context_packs", {})
    extra_paths = context_packs.get(args.context_pack, {}).get("paths", []) if args.context_pack else []

    if args.command == "run":
        agent = next((a for a in agents if a["id"] == args.agent), None)
        if not agent:
            print(f"Agente no encontrado: {args.agent}")
            return 1
        result = run_agent(agent, providers, args.prompt, args.dry_run, extra_paths=extra_paths)
        if args.dry_run:
            print(result)
            return 0
        output_path = write_report(agent["id"], result)
        print(str(output_path))
        return 0

    if args.command == "run-all":
        for agent in agents:
            result = run_agent(agent, providers, args.prompt, args.dry_run, extra_paths=extra_paths)
            if args.dry_run:
                print(result)
                continue
            output_path = write_report(agent["id"], result)
            print(str(output_path))
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
