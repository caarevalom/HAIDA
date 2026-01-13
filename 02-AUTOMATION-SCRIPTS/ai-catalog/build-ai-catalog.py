#!/usr/bin/env python3
import argparse
import csv
import json
import os
import re
import stat
import sys
import time
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

DEFAULT_ROOTS = [
    "/Users/carlosa",
    "/Applications",
    "/System/Applications",
    "/Library",
]

DEFAULT_EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".hg",
    ".svn",
    ".venv",
    "venv",
    "__pycache__",
    "dist",
    "build",
    ".cache",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".idea",
    ".terraform",
    ".tox",
    ".mypy_cache",
    ".pytest_cache",
    ".pnpm-store",
    ".yarn",
    ".npm",
    "Pods",
    "target",
    "coverage",
    "tmp",
    "temp",
    "vendor",
    "site-packages",
}

DEFAULT_EXCLUDE_PATHS = [
    "/Users/carlosa/Library/Caches",
    "/Users/carlosa/Library/Containers",
    "/Users/carlosa/Library/Group Containers",
    "/Users/carlosa/Library/Application Support/CloudDocs",
    "/Users/carlosa/Library/Mail",
    "/Users/carlosa/Library/Accounts",
    "/Users/carlosa/Library/Messages",
    "/Users/carlosa/Library/Safari",
    "/Users/carlosa/Library/IdentityServices",
    "/Users/carlosa/Library/Metadata",
    "/Users/carlosa/Library/Trial",
    "/Users/carlosa/Library/Daemon Containers",
    "/Users/carlosa/Library/Autosave Information",
    "/Users/carlosa/Library/Assistant",
    "/Users/carlosa/Library/Biome",
    "/Users/carlosa/Library/StatusKit",
    "/Users/carlosa/Library/PersonalizationPortrait",
    "/Users/carlosa/Library/DuetExpertCenter",
    "/Users/carlosa/Library/CoreFollowUp",
    "/Users/carlosa/Library/Photos",
    "/Users/carlosa/Library/Weather",
    "/Users/carlosa/Library/Suggestions",
    "/Users/carlosa/.Trash",
]

DEFAULT_INCLUDE_EXTS = {
    ".env",
    ".ini",
    ".conf",
    ".config",
    ".yaml",
    ".yml",
    ".json",
    ".toml",
    ".txt",
    ".md",
    ".sh",
    ".zsh",
    ".bash",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".rb",
    ".go",
    ".java",
    ".kt",
    ".swift",
    ".ps1",
    ".bat",
    ".sql",
    ".yaml",
    ".yml",
    ".cfg",
    ".properties",
}

DEFAULT_INCLUDE_NAMES = {
    "Dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "mcp.json",
    "mcp.config.json",
}

URL_RE = re.compile(r"https?://[^\s\"'<>]+")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\b(?:\+?\d[\d\s().-]{6,}\d)\b")
PHONE_CONTEXT_RE = re.compile(r"\b(phone|tel|telefono|telf|movil|mobile|cel|whatsapp|contact)\b", re.IGNORECASE)
HTTP_METHOD_RE = re.compile(r"\b(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+(/[^\s\"']+)")
ROUTE_RE_1 = re.compile(r"\b(?:app|router)\.(get|post|put|delete|patch|options|head)\s*\(\s*[\"']([^\"']+)")
ROUTE_RE_2 = re.compile(r"@(?:app|router)\.(get|post|put|delete|patch|options|head)\(\s*[\"']([^\"']+)")

SENSITIVE_QUERY_KEYS = {
    "key",
    "token",
    "secret",
    "apikey",
    "api_key",
    "access_token",
    "refresh_token",
    "client_secret",
    "password",
    "sig",
}


def to_ascii(value: str) -> str:
    try:
        return value.encode("ascii", "ignore").decode("ascii")
    except Exception:
        return ""


def redact_email(value: str) -> str:
    parts = value.split("@", 1)
    if len(parts) != 2:
        return value
    user, domain = parts
    if not user:
        return "***@" + domain
    return user[0] + "***@" + domain


def redact_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if len(digits) <= 4:
        return "***" + digits
    return "***" + digits[-4:]


def redact_url(value: str) -> str:
    try:
        parts = urlsplit(value)
        netloc = parts.netloc
        if "@" in netloc:
            netloc = "REDACTED@" + netloc.split("@", 1)[-1]
        query_pairs = parse_qsl(parts.query, keep_blank_values=True)
        redacted_pairs = []
        for k, v in query_pairs:
            if k.lower() in SENSITIVE_QUERY_KEYS:
                redacted_pairs.append((k, "REDACTED"))
            else:
                redacted_pairs.append((k, v))
        query = urlencode(redacted_pairs)
        return urlunsplit((parts.scheme, netloc, parts.path, query, parts.fragment))
    except Exception:
        return value


def normalize_value(value: str) -> str:
    return to_ascii(value.strip())


def is_text_file(path: str) -> bool:
    try:
        with open(path, "rb") as fh:
            chunk = fh.read(4096)
        if b"\x00" in chunk:
            return False
        return True
    except Exception:
        return False


def should_include_file(path: str, include_exts, include_names, max_size):
    name = os.path.basename(path)
    ext = os.path.splitext(name)[1].lower()
    if name not in include_names and (not ext or ext not in include_exts):
        return False
    try:
        size = os.path.getsize(path)
        if size > max_size:
            return False
    except Exception:
        return False
    return True


def add_entry(entries, entry):
    key = (entry.get("type"), entry.get("value"), entry.get("method"))
    existing = entries.get(key)
    if not existing:
        entries[key] = entry
        return
    sources = existing.get("sources", [])
    for src in entry.get("sources", []):
        if src not in sources:
            if len(sources) < 10:
                sources.append(src)
    existing["sources"] = sources


def record_match(entries, match_type, value, source, method=None, redacted=False, meta=None):
    if not value:
        return
    entry = {
        "type": match_type,
        "value": value,
        "sources": [source],
    }
    if method:
        entry["method"] = method.upper()
    if redacted:
        entry["redacted"] = True
    if meta:
        entry["meta"] = meta
    add_entry(entries, entry)


def extract_from_text(text, path, entries):
    if not text:
        return
    if "http" in text:
        for url in URL_RE.findall(text):
            redacted_url = redact_url(url)
            record_match(entries, "url", normalize_value(redacted_url), path, redacted=(redacted_url != url))
    if "@" in text:
        for email in EMAIL_RE.findall(text):
            redacted_email = redact_email(email)
            record_match(entries, "email", normalize_value(redacted_email), path, redacted=True)
    if any(ch.isdigit() for ch in text):
        context_ok = bool(PHONE_CONTEXT_RE.search(text))
        for phone in PHONE_RE.findall(text):
            digits = re.sub(r"\D", "", phone)
            digits_len = len(digits)
            if digits_len < 8 or digits_len > 15:
                continue
            has_sep = any(ch in phone for ch in " +-.()")
            if not has_sep and not context_ok:
                continue
            redacted_phone = redact_phone(phone)
            record_match(entries, "phone", normalize_value(redacted_phone), path, redacted=True)
    if "/" in text or "app." in text or "router." in text:
        for method, endpoint in HTTP_METHOD_RE.findall(text):
            record_match(entries, "endpoint", normalize_value(endpoint), path, method=method)
        for method, route in ROUTE_RE_1.findall(text):
            record_match(entries, "route", normalize_value(route), path, method=method)
        for method, route in ROUTE_RE_2.findall(text):
            record_match(entries, "route", normalize_value(route), path, method=method)


def parse_mcp_file(path, entries, errors):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as fh:
            data = json.load(fh)
    except Exception as exc:
        errors.append(f"mcp.json parse error: {path}: {exc}")
        return
    servers = data.get("servers", {})
    for name, cfg in servers.items():
        meta = {}
        if isinstance(cfg, dict):
            if "url" in cfg:
                meta["url"] = normalize_value(redact_url(str(cfg.get("url"))))
            if "command" in cfg:
                meta["command"] = normalize_value(str(cfg.get("command")))
            if "args" in cfg:
                try:
                    meta["args"] = [normalize_value(str(x)) for x in cfg.get("args", [])]
                except Exception:
                    pass
            if "type" in cfg:
                meta["type"] = normalize_value(str(cfg.get("type")))
        record_match(entries, "mcp_server", normalize_value(name), path, meta=meta)


def list_apps(paths, entries):
    for root in paths:
        if not os.path.isdir(root):
            continue
        try:
            for name in os.listdir(root):
                if not name.endswith(".app"):
                    continue
                full = os.path.join(root, name)
                record_match(entries, "tool_app", normalize_value(name), root, meta={"path": normalize_value(full)})
        except Exception:
            continue


def list_cli_tools(entries):
    seen = set()
    for path_dir in os.environ.get("PATH", "").split(os.pathsep):
        if not path_dir:
            continue
        if not os.path.isdir(path_dir):
            continue
        try:
            for name in os.listdir(path_dir):
                full = os.path.join(path_dir, name)
                if name in seen:
                    continue
                try:
                    st = os.stat(full)
                except Exception:
                    continue
                if stat.S_ISREG(st.st_mode) and (st.st_mode & stat.S_IXUSR):
                    seen.add(name)
                    record_match(entries, "tool_cli", normalize_value(name), "PATH", meta={"path": normalize_value(full)})
        except Exception:
            continue


def list_browser_extensions(entries, errors):
    candidates = [
        ("chrome", os.path.expanduser("~/Library/Application Support/Google/Chrome/Default/Extensions")),
        ("edge", os.path.expanduser("~/Library/Application Support/Microsoft Edge/Default/Extensions")),
        ("firefox", os.path.expanduser("~/Library/Application Support/Firefox/Profiles")),
        ("safari", os.path.expanduser("~/Library/Containers/com.apple.Safari/Data/Library/Safari")),
    ]
    for browser, base in candidates:
        if not os.path.exists(base):
            continue
        try:
            if browser == "firefox":
                for prof in os.listdir(base):
                    ext_dir = os.path.join(base, prof, "extensions")
                    if os.path.isdir(ext_dir):
                        for name in os.listdir(ext_dir):
                            record_match(entries, "browser_extension", normalize_value(name), ext_dir, meta={"browser": browser})
            else:
                for ext_id in os.listdir(base):
                    ext_dir = os.path.join(base, ext_id)
                    if os.path.isdir(ext_dir):
                        record_match(entries, "browser_extension", normalize_value(ext_id), ext_dir, meta={"browser": browser})
        except Exception as exc:
            errors.append(f"browser extensions error: {browser}: {exc}")


def walk_files(roots, include_exts, include_names, max_size, exclude_dirs, errors, exclude_paths):
    files = []
    for root in roots:
        if not os.path.exists(root):
            continue
        for dirpath, dirnames, filenames in os.walk(root, topdown=True):
            if any(dirpath.startswith(p) for p in exclude_paths):
                dirnames[:] = []
                continue
            parts = set(dirpath.split(os.sep))
            dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
            if any(part in exclude_dirs for part in parts):
                continue
            for name in filenames:
                path = os.path.join(dirpath, name)
                if should_include_file(path, include_exts, include_names, max_size):
                    files.append(path)
    return files


def write_outputs(entries, output_dir, errors, skipped):
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    items = list(entries.values())
    items.sort(key=lambda x: (x.get("type", ""), x.get("value", "")))

    os.makedirs(output_dir, exist_ok=True)
    jsonl_path = os.path.join(output_dir, "catalog.jsonl")
    with open(jsonl_path, "w", encoding="utf-8") as fh:
        for item in items:
            fh.write(json.dumps(item, ensure_ascii=True) + "\n")

    csv_path = os.path.join(output_dir, "catalog.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["type", "value", "method", "redacted", "sources", "meta"])
        for item in items:
            writer.writerow([
                item.get("type", ""),
                item.get("value", ""),
                item.get("method", ""),
                str(item.get("redacted", False)),
                ";".join(item.get("sources", [])),
                json.dumps(item.get("meta", {}), ensure_ascii=True),
            ])

    yaml_path = os.path.join(output_dir, "catalog.yaml")
    with open(yaml_path, "w", encoding="utf-8") as fh:
        fh.write("generated_at: " + ts + "\n")
        fh.write("counts:\n")
        counts = {}
        for item in items:
            counts[item.get("type", "unknown")] = counts.get(item.get("type", "unknown"), 0) + 1
        for key in sorted(counts.keys()):
            fh.write("  " + key + ": " + str(counts[key]) + "\n")
        fh.write("items:\n")
        for item in items:
            fh.write("  - type: " + str(item.get("type", "")) + "\n")
            fh.write("    value: " + str(item.get("value", "")) + "\n")
            if item.get("method"):
                fh.write("    method: " + str(item.get("method", "")) + "\n")
            fh.write("    redacted: " + str(item.get("redacted", False)).lower() + "\n")
            if item.get("sources"):
                fh.write("    sources: [" + ", ".join(item.get("sources", [])) + "]\n")
            if item.get("meta"):
                fh.write("    meta: " + json.dumps(item.get("meta", {}), ensure_ascii=True) + "\n")

    md_path = os.path.join(output_dir, "catalog.md")
    with open(md_path, "w", encoding="utf-8") as fh:
        fh.write("# AI Catalog\n\n")
        fh.write("Generated at: " + ts + "\n\n")
        for key in sorted(counts.keys()):
            fh.write("## " + key + " (" + str(counts[key]) + ")\n\n")
            for item in [i for i in items if i.get("type") == key]:
                line = "- " + item.get("value", "")
                if item.get("method"):
                    line += " [" + item.get("method") + "]"
                if item.get("redacted"):
                    line += " (redacted)"
                fh.write(line + "\n")
            fh.write("\n")

    err_path = os.path.join(output_dir, "catalog.errors.log")
    with open(err_path, "w", encoding="utf-8") as fh:
        for err in errors:
            fh.write(to_ascii(err) + "\n")
        for item in skipped:
            fh.write(to_ascii(item) + "\n")

    readme_path = os.path.join(output_dir, "README.md")
    with open(readme_path, "w", encoding="utf-8") as fh:
        fh.write("# AI Catalog\n\n")
        fh.write("This folder contains a unified catalog of URLs, endpoints, routes, contacts, and tools.\n")
        fh.write("Redaction is enabled. Emails and phones are masked. Sensitive query values are redacted.\n\n")
        fh.write("Files:\n\n")
        fh.write("- catalog.jsonl\n")
        fh.write("- catalog.csv\n")
        fh.write("- catalog.yaml\n")
        fh.write("- catalog.md\n")
        fh.write("- catalog.errors.log\n")


def main():
    parser = argparse.ArgumentParser(description="Build AI catalog")
    parser.add_argument("--root", action="append", default=[], help="Root folder to scan")
    parser.add_argument("--output", default="/Users/carlosa/04-CONFIGURATION/ai-catalog")
    parser.add_argument("--max-size", type=int, default=2_000_000)
    parser.add_argument("--full-scan", action="store_true", help="Disable default exclude paths")
    parser.add_argument("--append", action="store_true", help="Merge with existing catalog.jsonl")
    args = parser.parse_args()

    roots = args.root if args.root else DEFAULT_ROOTS
    output_dir = args.output

    os.makedirs(output_dir, exist_ok=True)
    status_path = os.path.join(output_dir, "build.status")
    try:
        with open(status_path, "w", encoding="utf-8") as fh:
            fh.write("running pid=" + str(os.getpid()) + " ts=" + time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) + "\n")
    except Exception:
        pass

    entries = {}
    errors = []
    skipped = []

    if args.append:
        existing_path = os.path.join(output_dir, "catalog.jsonl")
        if os.path.exists(existing_path):
            try:
                with open(existing_path, "r", encoding="utf-8") as fh:
                    for line in fh:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            obj = json.loads(line)
                        except Exception:
                            continue
                        add_entry(entries, obj)
            except Exception:
                pass

    exclude_paths = [] if args.full_scan else DEFAULT_EXCLUDE_PATHS
    files = walk_files(
        roots,
        DEFAULT_INCLUDE_EXTS,
        DEFAULT_INCLUDE_NAMES,
        args.max_size,
        DEFAULT_EXCLUDE_DIRS,
        errors,
        exclude_paths,
    )

    for path in files:
        try:
            if not is_text_file(path):
                skipped.append("binary: " + path)
                continue
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                for line in fh:
                    if len(line) > 20000:
                        line = line[:20000]
                    extract_from_text(line, path, entries)
            if os.path.basename(path) == "mcp.json":
                parse_mcp_file(path, entries, errors)
        except PermissionError:
            errors.append("permission: " + path)
        except Exception as exc:
            errors.append("error: " + path + ": " + str(exc))

    list_apps(["/Applications", os.path.expanduser("~/Applications" )], entries)
    list_cli_tools(entries)
    list_browser_extensions(entries, errors)

    write_outputs(entries, output_dir, errors, skipped)
    try:
        with open(status_path, "w", encoding="utf-8") as fh:
            fh.write("completed pid=" + str(os.getpid()) + " ts=" + time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) + "\n")
    except Exception:
        pass


if __name__ == "__main__":
    sys.exit(main())
