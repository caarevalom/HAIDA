#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${OUT_DIR:-$HOME}"
UNIFIED="${UNIFIED:-$OUT_DIR/unified_codex_config.txt}"
SCAN="${SCAN:-$OUT_DIR/codex_system_scan.txt}"

include_history=false
include_logs=false
include_scan=true
open_system_settings=false

usage() {
  cat <<'USAGE'
Usage: unify_codex.sh [options]

Options:
  --out PATH                Output unified file path
  --scan PATH               Output scan list path
  --no-scan                 Skip the filesystem scan step
  --include-history         Include history.jsonl and memory.jsonl
  --include-logs            Include log/codex-tui.log
  --open-system-settings    Open System Settings (macOS only)
  -h, --help                Show help

Environment overrides:
  OUT_DIR, UNIFIED, SCAN
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out)
      UNIFIED="$2"; shift 2 ;;
    --scan)
      SCAN="$2"; shift 2 ;;
    --no-scan)
      include_scan=false; shift ;;
    --include-history)
      include_history=true; shift ;;
    --include-logs)
      include_logs=true; shift ;;
    --open-system-settings)
      open_system_settings=true; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

printf "Preflight checks...\n"

# Write permission check
if [[ -w "$OUT_DIR" ]]; then
  printf "- write access to %s: OK\n" "$OUT_DIR"
else
  tmpfile="${OUT_DIR%/}/.codex_write_test.$$"
  if ( : > "$tmpfile" ) 2>/dev/null; then
    rm -f "$tmpfile"
    printf "- write access to %s: OK (via test file)\n" "$OUT_DIR"
  else
    printf "- write access to %s: FAIL\n" "$OUT_DIR"
    printf "  Grant write permissions or change OUT_DIR/--out.\n"
  fi
fi

# Local files access check
if [[ -r "$HOME/.codex" ]]; then
  printf "- read access to %s: OK\n" "$HOME/.codex"
else
  printf "- read access to %s: FAIL\n" "$HOME/.codex"
  printf "  Grant access or run with Full Disk Access on macOS.\n"
fi

# Web access check (basic)
if command -v curl >/dev/null 2>&1; then
  if curl -Is https://example.com >/dev/null 2>&1; then
    printf "- web access via curl: OK\n"
  else
    printf "- web access via curl: FAIL (network blocked or restricted)\n"
  fi
else
  printf "- web access check: SKIP (curl not found)\n"
fi

# System settings note
if [[ "$OSTYPE" == "darwin"* ]]; then
  if command -v osascript >/dev/null 2>&1; then
    printf "- System Settings access: requires Automation permission (not auto-verified)\n"
    if $open_system_settings; then
      osascript -e 'tell application "System Settings" to activate' >/dev/null 2>&1 || true
      printf "  Opened System Settings (if allowed).\n"
    fi
  else
    printf "- System Settings access: SKIP (osascript not found)\n"
  fi
else
  printf "- System Settings access: SKIP (non-macOS)\n"
fi

# Optional scan
if $include_scan; then
  if command -v rg >/dev/null 2>&1; then
    rg --files \
      -g '*codex*' -g '.codex*' \
      -g '*codex*.toml' -g '*codex*.json' -g '*codex*.yaml' -g '*codex*.yml' \
      -g '*codex*.ini' -g '*codex*.rc' -g 'AGENTS.md' \
      "$HOME" /etc /Library /usr/local/etc /opt /Applications 2>/dev/null > "$SCAN" || true
  else
    find "$HOME" /etc /Library /usr/local/etc /opt /Applications \( \
      -name '*codex*' -o -name '.codex*' -o -name '*codex*.toml' -o -name '*codex*.json' \
      -o -name '*codex*.yaml' -o -name '*codex*.yml' -o -name '*codex*.ini' -o -name '*codex*.rc' \
      -o -name 'AGENTS.md' \) 2>/dev/null > "$SCAN" || true
  fi
  printf "Scan list written to %s\n" "$SCAN"
fi

codex_dir="$HOME/.codex"
files=(
  "$codex_dir/config.toml"
  "$codex_dir/auth.json"
  "$codex_dir/version.json"
)

if [[ -d "$codex_dir/rules" ]]; then
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find "$codex_dir/rules" -type f -print0 2>/dev/null)
fi

if $include_history; then
  files+=("$codex_dir/history.jsonl" "$codex_dir/memory.jsonl")
fi

if $include_logs; then
  files+=("$codex_dir/log/codex-tui.log")
fi

{
  for f in "${files[@]}"; do
    printf "### FILE: %s\n" "$f"
    if [[ -r "$f" ]]; then
      cat "$f"
    else
      printf "[missing or unreadable]\n"
    fi
    printf "\n\n"
  done
} > "$UNIFIED"

printf "Unified file written to %s\n" "$UNIFIED"
printf "Note: auth.json may contain credentials; handle with care.\n"
