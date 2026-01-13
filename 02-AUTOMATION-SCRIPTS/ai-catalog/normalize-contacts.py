#!/usr/bin/env python3
import argparse
import json
import os
import re
import shutil
import stat
import time

DEFAULT_ROOTS = [
    "/Users/carlosa/00-PROJECTS",
    "/Users/carlosa/04-CONFIGURATION",
    "/Users/carlosa/02-AUTOMATION-SCRIPTS",
    "/Users/carlosa/Documents",
    "/Users/carlosa/Desktop",
]

EXCLUDE_DIRS = {
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
    ".vscode",
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

EXCLUDE_PATHS = [
    "/Users/carlosa/04-CONFIGURATION/ai-catalog",
    "/Users/carlosa/04-CONFIGURATION/ai-conversations",
    "/Users/carlosa/04-CONFIGURATION/normalize-contacts",
]

DOC_EXTS = {".md", ".mdx", ".txt", ".html", ".htm", ".rst"}
CONFIG_EXTS = {".env", ".ini", ".conf", ".toml", ".yaml", ".yml", ".json", ".config", ".cfg", ".properties"}
SOURCE_EXTS = {".js", ".ts", ".tsx", ".jsx", ".py", ".rb", ".go", ".java", ".kt", ".swift", ".php", ".cs", ".sql"}

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\b(?:\+?\d[\d\s().-]{6,}\d)\b")

EMAIL_CONTEXT = re.compile(r"\b(email|e-mail|correo|mail|support|soporte|contact|contacto|help|hola)\b", re.IGNORECASE)
PHONE_CONTEXT = re.compile(r"\b(phone|tel|telefono|telf|movil|mobile|cel|whatsapp|contact|contacto)\b", re.IGNORECASE)


def to_ascii(value: str) -> str:
    try:
        return value.encode("ascii", "ignore").decode("ascii")
    except Exception:
        return ""


def is_text_file(path: str) -> bool:
    try:
        with open(path, "rb") as fh:
            chunk = fh.read(4096)
        if b"\x00" in chunk:
            return False
        return True
    except Exception:
        return False


def categorize(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext in DOC_EXTS:
        return "doc"
    if ext in CONFIG_EXTS:
        return "config"
    if ext in SOURCE_EXTS:
        return "source"
    return "other"


def should_process(path: str, max_size: int) -> bool:
    if any(path.startswith(p) for p in EXCLUDE_PATHS):
        return False
    try:
        size = os.path.getsize(path)
        if size > max_size:
            return False
    except Exception:
        return False
    return True


def should_replace_email(line: str, category: str) -> bool:
    if category == "doc":
        return True
    if EMAIL_CONTEXT.search(line):
        return True
    return False


def should_replace_phone(line: str, category: str) -> bool:
    if category == "doc":
        return True
    if PHONE_CONTEXT.search(line):
        return True
    return False


def replace_emails(line: str, category: str, target_email: str):
    replaced = False
    def repl(match):
        nonlocal replaced
        value = match.group(0)
        if value.lower() == target_email.lower():
            return value
        if not should_replace_email(line, category):
            return value
        replaced = True
        return target_email
    new_line = EMAIL_RE.sub(repl, line)
    return new_line, replaced


def replace_phones(line: str, category: str, target_phone: str):
    replaced = False
    def repl(match):
        nonlocal replaced
        value = match.group(0)
        digits = re.sub(r"\D", "", value)
        if len(digits) < 8 or len(digits) > 15:
            return value
        if not should_replace_phone(line, category):
            return value
        replaced = True
        return target_phone
    new_line = PHONE_RE.sub(repl, line)
    return new_line, replaced


def backup_file(path: str, backup_root: str, root: str):
    rel = os.path.relpath(path, root)
    dest = os.path.join(backup_root, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(path, dest)


def process_file(path: str, target_email: str, target_phone: str, backup_root: str, backup_root_base: str, report_fh, max_context: int = 200):
    category = categorize(path)
    try:
        st = os.stat(path)
    except Exception:
        return False, 0

    changed = False
    replaced_count = 0
    lines_out = []
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as fh:
            for idx, line in enumerate(fh, 1):
                new_line, email_changed = replace_emails(line, category, target_email)
                new_line, phone_changed = replace_phones(new_line, category, target_phone)
                if email_changed or phone_changed:
                    changed = True
                    replaced_count += 1
                    context = to_ascii(line.strip())[:max_context]
                    entry = {
                        "path": path,
                        "line": idx,
                        "category": category,
                        "email_changed": email_changed,
                        "phone_changed": phone_changed,
                        "context": context,
                    }
                    report_fh.write(json.dumps(entry, ensure_ascii=True) + "\n")
                lines_out.append(new_line)
    except Exception:
        return False, 0

    if changed:
        backup_file(path, backup_root, backup_root_base)
        with open(path, "w", encoding="utf-8") as fh:
            fh.writelines(lines_out)
        os.chmod(path, stat.S_IMODE(st.st_mode))
    return changed, replaced_count


def walk_files(roots, max_size, exclude_paths):
    for root in roots:
        if not os.path.isdir(root):
            continue
        for dirpath, dirnames, filenames in os.walk(root, topdown=True):
            if any(dirpath.startswith(p) for p in exclude_paths):
                dirnames[:] = []
                continue
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
            for name in filenames:
                path = os.path.join(dirpath, name)
                if not should_process(path, max_size):
                    continue
                if not is_text_file(path):
                    continue
                yield root, path


def main():
    parser = argparse.ArgumentParser(description="Normalize emails and phones")
    parser.add_argument("--root", action="append", default=[])
    parser.add_argument("--email", default="hola@stayarta.com")
    parser.add_argument("--phone", default="+34662652300")
    parser.add_argument("--max-size", type=int, default=2_000_000)
    parser.add_argument("--output", default="/Users/carlosa/04-CONFIGURATION/normalize-contacts")
    args = parser.parse_args()

    roots = args.root if args.root else DEFAULT_ROOTS
    output_dir = args.output
    os.makedirs(output_dir, exist_ok=True)

    ts = time.strftime("%Y%m%d-%H%M%S", time.gmtime())
    backup_root = os.path.join(output_dir, "backups", ts)
    report_path = os.path.join(output_dir, "report.jsonl")
    dynamic_excludes = list(EXCLUDE_PATHS) + [output_dir, backup_root]

    changed_files = 0
    total_replacements = 0

    with open(report_path, "w", encoding="utf-8") as report_fh:
        for root, path in walk_files(roots, args.max_size, dynamic_excludes):
            changed, count = process_file(path, args.email, args.phone, backup_root, root, report_fh)
            if changed:
                changed_files += 1
                total_replacements += count

    summary_path = os.path.join(output_dir, "summary.txt")
    with open(summary_path, "w", encoding="utf-8") as fh:
        fh.write("normalized_email=" + args.email + "\n")
        fh.write("normalized_phone=" + args.phone + "\n")
        fh.write("changed_files=" + str(changed_files) + "\n")
        fh.write("replacements=" + str(total_replacements) + "\n")
        fh.write("backup_root=" + backup_root + "\n")
        fh.write("report=" + report_path + "\n")


if __name__ == "__main__":
    main()
