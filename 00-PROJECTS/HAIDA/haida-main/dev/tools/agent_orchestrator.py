#!/usr/bin/env python3
"""
Simple multi-agent orchestrator for parallel executor/tester task runs.
Reads a JSON tasks file and runs executor/tester tasks concurrently.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Tuple


def _load_tasks(path: Path) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict) and ("executor" in data or "tester" in data):
        executor_tasks = data.get("executor", []) or []
        tester_tasks = data.get("tester", []) or []
        return executor_tasks, tester_tasks
    if isinstance(data, list):
        executor_tasks = [task for task in data if task.get("role") == "executor"]
        tester_tasks = [task for task in data if task.get("role") == "tester"]
        return executor_tasks, tester_tasks
    raise ValueError("Tasks file must be a list or a dict with executor/tester keys.")


async def _run_command(command: str) -> Tuple[int, str, str]:
    process = await asyncio.create_subprocess_shell(
        command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    return process.returncode or 0, stdout.decode(), stderr.decode()


def _write_log(log_path: Path, message: str) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.write_text(message, encoding="utf-8")


async def _run_tasks(role: str, tasks: List[Dict[str, Any]], log_path: Path, status: Dict[str, Any]) -> int:
    exit_code = 0
    output_chunks: List[str] = []

    for index, task in enumerate(tasks, start=1):
        command = task.get("command")
        task_id = task.get("id") or f"{role}-{index}"
        if not command:
            output_chunks.append(f"[{task_id}] skipped (missing command)\n")
            continue

        start = time.time()
        output_chunks.append(f"[{task_id}] start: {command}\n")
        code, stdout, stderr = await _run_command(command)
        duration = time.time() - start
        status_entry = {
            "id": task_id,
            "command": command,
            "exit_code": code,
            "duration_sec": round(duration, 2),
            "timestamp": int(time.time()),
        }
        status[role] = status_entry
        output_chunks.append(f"[{task_id}] exit={code} duration={duration:.2f}s\n")
        if stdout:
            output_chunks.append(f"[{task_id}] stdout:\n{stdout}\n")
        if stderr:
            output_chunks.append(f"[{task_id}] stderr:\n{stderr}\n")
        if code != 0:
            exit_code = code

        _write_log(log_path, "".join(output_chunks))

    return exit_code


async def run(tasks_path: Path) -> int:
    executor_tasks, tester_tasks = _load_tasks(tasks_path)
    reports_dir = tasks_path.parent.parent / "reports"
    executor_log = reports_dir / "agent-executor.log"
    tester_log = reports_dir / "agent-tester.log"
    status_path = reports_dir / "agent-status.json"

    status: Dict[str, Any] = {"executor": None, "tester": None}

    exit_codes = await asyncio.gather(
        _run_tasks("executor", executor_tasks, executor_log, status),
        _run_tasks("tester", tester_tasks, tester_log, status),
    )
    status_path.parent.mkdir(parents=True, exist_ok=True)
    status_path.write_text(json.dumps(status, indent=2), encoding="utf-8")

    return max(exit_codes)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run executor/tester tasks concurrently.")
    parser.add_argument(
        "--tasks",
        type=Path,
        default=Path(__file__).with_name("agent_tasks.json"),
        help="Path to tasks JSON file.",
    )
    args = parser.parse_args()

    if not args.tasks.exists():
        print(f"Tasks file not found: {args.tasks}", file=sys.stderr)
        return 2

    return asyncio.run(run(args.tasks))


if __name__ == "__main__":
    raise SystemExit(main())
