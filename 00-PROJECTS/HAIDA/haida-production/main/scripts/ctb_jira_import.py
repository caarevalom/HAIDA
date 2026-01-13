#!/usr/bin/env python3
"""
CTB Jira bootstrap and test case import.

Creates the CTB Jira project (if missing) and imports test cases
from ctb-master.csv as Jira issues.
"""

from __future__ import annotations

import csv
import os
import re
import sys
import time
from typing import Dict, Iterable, List, Optional, Set

from atlassian import Jira
from dotenv import load_dotenv


def load_env() -> None:
    load_dotenv()
    if not os.getenv("ATLASSIAN_URL"):
        load_dotenv(".env.local")


def require_env(*names: str) -> None:
    missing = [n for n in names if not os.getenv(n)]
    if missing:
        raise SystemExit(f"Missing environment variables: {', '.join(missing)}")


def get_account_id(jira: Jira) -> str:
    me = jira.get("rest/api/3/myself")
    account_id = me.get("accountId") if isinstance(me, dict) else None
    if not account_id:
        raise SystemExit("Unable to resolve accountId from Jira /myself.")
    return account_id


def get_project(jira: Jira, project_key: str) -> Optional[Dict]:
    try:
        return jira.get(f"rest/api/3/project/{project_key}")
    except Exception:
        return None


def get_templates(jira: Jira, project_type_key: str) -> List[str]:
    try:
        resp = jira.get(f"rest/api/3/project/type/{project_type_key}/template")
    except Exception:
        return []
    if not isinstance(resp, list):
        return []
    return [t.get("key") for t in resp if t.get("key")]


def create_project(jira: Jira, project_key: str, project_name: str) -> Dict:
    account_id = get_account_id(jira)
    project_type_key = os.getenv("JIRA_PROJECT_TYPE", "software")

    templates = get_templates(jira, project_type_key)
    if not templates:
        templates = [
            "com.pyxis.greenhopper.jira:gh-simplified-kanban-classic",
            "com.pyxis.greenhopper.jira:gh-simplified-scrum-classic",
            "com.atlassian.jira-core-project-templates:jira-core-simplified-project-management",
        ]

    last_error = None
    for template_key in templates:
        payload = {
            "key": project_key,
            "name": project_name,
            "projectTypeKey": project_type_key,
            "projectTemplateKey": template_key,
            "leadAccountId": account_id,
            "assigneeType": "PROJECT_LEAD",
        }
        try:
            created = jira.post("rest/api/3/project", json=payload)
            if isinstance(created, dict) and created.get("id"):
                return created
        except Exception as exc:
            last_error = exc
            continue

    raise SystemExit(f"Failed to create Jira project {project_key}. Last error: {last_error}")


def get_issue_type(jira: Jira, project_key: str, preferred: Iterable[str]) -> str:
    meta = jira.get(
        "rest/api/3/issue/createmeta",
        params={"projectKeys": project_key, "expand": "projects.issuetypes"},
    )
    if not isinstance(meta, dict):
        raise SystemExit("Unable to fetch issue create metadata.")
    projects = meta.get("projects") or []
    if not projects:
        raise SystemExit("No Jira project metadata returned for issue creation.")
    issue_types = projects[0].get("issuetypes") or []
    for name in preferred:
        for it in issue_types:
            if it.get("name") == name:
                return name
    if issue_types:
        return issue_types[0].get("name")
    raise SystemExit("No issue types available in Jira project.")


def read_test_cases(csv_path: str) -> List[Dict[str, str]]:
    if not os.path.exists(csv_path):
        raise SystemExit(f"CSV not found: {csv_path}")
    with open(csv_path, "r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="|")
        return list(reader)


def sanitize_label(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_-]+", "-", value.strip().lower())
    return cleaned.strip("-")


def build_labels(tc: Dict[str, str]) -> List[str]:
    labels = []
    raw = tc.get("ETIQUETA_AUTOMATIZACION", "")
    for part in raw.split("@"):
        if not part.strip():
            continue
        labels.append(sanitize_label(part))
    for key in ("COMPONENTE", "MODULO", "TIPO_PRUEBA"):
        value = tc.get(key, "")
        if value:
            labels.append(sanitize_label(value))
    return [l for l in labels if l]


def map_priority(priority: str) -> str:
    mapping = {
        "P0": "Highest",
        "P1": "High",
        "P2": "Medium",
        "P3": "Low",
        "P4": "Lowest",
    }
    return mapping.get(priority.upper(), "Medium")


def build_description(tc: Dict[str, str]) -> str:
    parts = [
        f"TEST_ID: {tc.get('TEST_ID', '')}",
        f"Tipo: {tc.get('TIPO_PRUEBA', '')}",
        f"Componente: {tc.get('COMPONENTE', '')}",
        f"Modulo: {tc.get('MODULO', '')}",
        f"Requisitos: {tc.get('REQUISITO_ID', '')}",
        "",
        "Precondiciones:",
        tc.get("PRECONDICIONES", "N/A"),
        "",
        "Pasos:",
        tc.get("PASOS", ""),
        "",
        "Resultado esperado:",
        tc.get("RESULTADO_ESPERADO", ""),
    ]
    return "\n".join(parts)


def fetch_existing_test_ids(jira: Jira, project_key: str) -> Set[str]:
    existing: Set[str] = set()
    start = 0
    while True:
        result = jira.jql(
            f'project = {project_key} AND summary ~ "TC_"',
            fields=["summary"],
            start=start,
            limit=100,
        )
        issues = result.get("issues", []) if isinstance(result, dict) else []
        if not issues:
            break
        for issue in issues:
            summary = issue.get("fields", {}).get("summary", "")
            test_id = summary.split(" - ")[0].strip()
            if test_id.startswith("TC_"):
                existing.add(test_id)
        start += len(issues)
    return existing


def main() -> None:
    load_env()
    require_env("ATLASSIAN_URL", "ATLASSIAN_EMAIL", "ATLASSIAN_API_TOKEN")

    project_key = os.getenv("JIRA_PROJECT_KEY", "CTB")
    project_name = os.getenv("JIRA_PROJECT_NAME", "CTB")
    csv_path = os.getenv(
        "CTB_CSV_PATH",
        "/Users/carlosa/00-PROJECTS/CTB/client-repos/main/docs/csv/ctb-master.csv",
    )

    jira = Jira(
        url=os.getenv("ATLASSIAN_URL"),
        username=os.getenv("ATLASSIAN_EMAIL"),
        password=os.getenv("ATLASSIAN_API_TOKEN"),
        cloud=True,
    )

    project = get_project(jira, project_key)
    if not project:
        print(f"Creating Jira project {project_key}...")
        project = create_project(jira, project_key, project_name)
    else:
        print(f"Jira project {project_key} already exists.")

    issue_type = get_issue_type(jira, project_key, ["Test", "Story", "Task"])
    print(f"Using issue type: {issue_type}")

    test_cases = read_test_cases(csv_path)
    existing_ids = fetch_existing_test_ids(jira, project_key)

    created = 0
    skipped = 0

    for tc in test_cases:
        test_id = tc.get("TEST_ID", "").strip()
        if not test_id:
            continue
        if test_id in existing_ids:
            skipped += 1
            continue

        summary = f"{test_id} - {tc.get('DESCRIPCION', '').strip()}"
        fields = {
            "project": {"key": project_key},
            "summary": summary,
            "description": build_description(tc),
            "issuetype": {"name": issue_type},
            "labels": build_labels(tc),
            "priority": {"name": map_priority(tc.get("PRIORIDAD", "P2"))},
        }

        try:
            jira.issue_create(fields)
            created += 1
        except Exception as exc:
            print(f"Failed to create {test_id}: {exc}")
        time.sleep(0.2)

    print(f"Done. Created: {created}, Skipped: {skipped}, Total: {len(test_cases)}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Error: {exc}")
        sys.exit(1)
