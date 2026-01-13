from fastapi import APIRouter, HTTPException, Request
from typing import Any, Dict, List
import httpx
import time

from app.core.request_context import get_tenant_id, get_user_id
from app.core.tenants import require_tenant_membership
from app.core.db import fetch_one


router = APIRouter()


def _get_microsoft_metadata(user_id: str) -> Dict[str, Any] | None:
    user = fetch_one("SELECT metadata FROM users WHERE id = %s", (user_id,))
    if not user or not user.get("metadata"):
        return None
    metadata = user["metadata"] or {}
    return metadata.get("microsoft")


def _token_ready(microsoft_meta: Dict[str, Any]) -> bool:
    expires_at = int(microsoft_meta.get("expires_at") or 0)
    return expires_at > int(time.time()) + 10 and bool(microsoft_meta.get("access_token"))


async def _graph_get(access_token: str, path: str) -> Dict[str, Any]:
    url = f"https://graph.microsoft.com/v1.0{path}"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url, headers=headers)
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()


@router.get("/apps")
async def list_apps(request: Request):
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    microsoft_meta = _get_microsoft_metadata(user_id)
    if not microsoft_meta:
        raise HTTPException(status_code=401, detail="Microsoft session not found. Please sign in again.")
    if not _token_ready(microsoft_meta):
        raise HTTPException(status_code=401, detail="Microsoft session expired. Please sign in again.")

    access_token = microsoft_meta["access_token"]

    apps: List[Dict[str, Any]] = []
    profile = await _graph_get(access_token, "/me")

    def _add_app(name: str, url: str, status: str, detail: str | None = None):
        apps.append(
            {
                "name": name,
                "url": url,
                "status": status,
                "detail": detail,
            }
        )

    try:
        await _graph_get(access_token, "/me/messages?$top=1")
        _add_app("Outlook", "https://outlook.office.com/mail/", "available")
    except HTTPException as exc:
        _add_app("Outlook", "https://outlook.office.com/mail/", "unavailable", str(exc.detail))

    try:
        await _graph_get(access_token, "/me/drive")
        _add_app("OneDrive", "https://www.office.com/launch/onedrive", "available")
    except HTTPException as exc:
        _add_app("OneDrive", "https://www.office.com/launch/onedrive", "unavailable", str(exc.detail))

    try:
        await _graph_get(access_token, "/sites/root")
        _add_app("SharePoint", "https://www.office.com/launch/sharepoint", "available")
    except HTTPException as exc:
        _add_app("SharePoint", "https://www.office.com/launch/sharepoint", "unavailable", str(exc.detail))

    try:
        await _graph_get(access_token, "/me/joinedTeams?$top=1")
        _add_app("Teams", "https://teams.microsoft.com", "available")
    except HTTPException as exc:
        _add_app("Teams", "https://teams.microsoft.com", "unavailable", str(exc.detail))

    _add_app("Copilot", "https://m365.cloud.microsoft/chat", "available")

    return {
        "profile": {
            "id": profile.get("id"),
            "displayName": profile.get("displayName"),
            "mail": profile.get("mail") or profile.get("userPrincipalName"),
        },
        "apps": apps,
    }
