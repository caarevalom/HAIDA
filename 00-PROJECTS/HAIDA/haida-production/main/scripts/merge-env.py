#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path


KEY_RE = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=")


def parse_env(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        if not line or line.lstrip().startswith("#"):
            continue
        m = KEY_RE.match(line)
        if not m:
            continue
        key = m.group(1)
        value = line.split("=", 1)[1]
        data[key] = value
    return data


def merge_env(target_path: Path, secrets_path: Path) -> None:
    target_lines = target_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    secrets = parse_env(secrets_path)
    if not secrets:
        raise SystemExit("Secrets file is empty or invalid.")

    updated_keys = set()
    output_lines: list[str] = []

    for line in target_lines:
        m = KEY_RE.match(line) if line and not line.lstrip().startswith("#") else None
        if m:
            key = m.group(1)
            if key in secrets:
                output_lines.append(f"{key}={secrets[key]}")
                updated_keys.add(key)
                continue
        output_lines.append(line)

    missing_keys = [k for k in secrets.keys() if k not in updated_keys]
    if missing_keys:
        output_lines.append("")
        output_lines.append("# === HAIDA SECRETS MERGE ===")
        for key in sorted(missing_keys):
            output_lines.append(f"{key}={secrets[key]}")

    target_path.write_text("\n".join(output_lines) + "\n", encoding="utf-8")

    print(f"Updated {len(updated_keys)} keys in {target_path}")
    print(f"Appended {len(missing_keys)} keys to {target_path}")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: merge-env.py <target_env> <secrets_env>")
    target_path = Path(sys.argv[1]).expanduser()
    secrets_path = Path(sys.argv[2]).expanduser()
    if not target_path.exists():
        raise SystemExit(f"Target env not found: {target_path}")
    if not secrets_path.exists():
        raise SystemExit(f"Secrets env not found: {secrets_path}")
    merge_env(target_path, secrets_path)


if __name__ == "__main__":
    main()
