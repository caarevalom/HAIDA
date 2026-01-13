#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from pathlib import Path
from datetime import datetime, timezone


BASE_DIR = Path("/Users/carlosa/04-CONFIGURATION/ai-conversations")
OUTPUT_FILE = BASE_DIR / "all.jsonl"
STATE_FILE = BASE_DIR / ".sync-state.json"

SOURCES = [
    Path("/Users/carlosa/.codex/memory.jsonl"),
    Path("/Users/carlosa/.codex/history.jsonl"),
    Path("/Users/carlosa/.claude/memory.jsonl"),
    Path("/Users/carlosa/.claude/history.jsonl"),
    Path("/Users/carlosa/memory.jsonl"),
    Path("/Users/carlosa/Documents/memory.jsonl"),
    Path("/Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/reports/agents/haida_history.txt"),
]

MAX_LINE_CHARS = 20000


def load_state() -> dict[str, int]:
    if not STATE_FILE.exists():
        return {}
    try:
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        return {k: int(v) for k, v in data.items()}
    except Exception:
        return {}


def save_state(state: dict[str, int]) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def pick_timestamp(raw: dict, fallback_ts: str) -> str:
    for key in ("ts", "timestamp", "time", "created_at", "createdAt", "date"):
        value = raw.get(key)
        if isinstance(value, str) and value.strip():
            return value
    return fallback_ts


def build_entry(source: Path, line: str, fallback_ts: str) -> dict:
    content = line
    raw_obj = None
    try:
        raw_obj = json.loads(line)
        content = raw_obj.get("content") or raw_obj.get("message") or line
    except Exception:
        raw_obj = None

    if len(content) > MAX_LINE_CHARS:
        content = content[:MAX_LINE_CHARS] + "\n...[TRUNCATED]"

    entry = {
        "ts": pick_timestamp(raw_obj, fallback_ts) if isinstance(raw_obj, dict) else fallback_ts,
        "type": "import",
        "content": content,
        "tags": [
            "unified",
            f"source:{source.name}",
        ],
        "meta": {
            "source_path": str(source),
        },
    }
    if isinstance(raw_obj, dict):
        entry["meta"]["raw"] = raw_obj
    return entry


def sync_source(source: Path, state: dict[str, int], output_handle) -> None:
    if not source.exists():
        return
    source_key = str(source)
    offset = state.get(source_key, 0)
    size = source.stat().st_size
    if offset > size:
        offset = 0

    with source.open("r", encoding="utf-8", errors="ignore") as handle:
        handle.seek(offset)
        fallback_ts = datetime.fromtimestamp(source.stat().st_mtime, timezone.utc).isoformat()
        for line in handle:
            line = line.rstrip("\n")
            if not line:
                continue
            entry = build_entry(source, line, fallback_ts)
            output_handle.write(json.dumps(entry, ensure_ascii=True) + "\n")
        state[source_key] = handle.tell()


def main() -> int:
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    state = load_state()
    with OUTPUT_FILE.open("a", encoding="utf-8") as output_handle:
        for source in SOURCES:
            sync_source(source, state, output_handle)
    save_state(state)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
