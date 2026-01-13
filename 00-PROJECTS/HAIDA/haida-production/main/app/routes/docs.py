"""Documentation management endpoints"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import re
from app.core.supabase_client import get_supabase_client
from app.core.request_context import get_tenant_id, get_user_id

router = APIRouter()

class DocCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "technical"
    tags: List[str] = []

class Doc(BaseModel):
    id: str
    title: str
    content: str
    category: str
    tags: List[str]
    version: int
    created_at: datetime
    updated_at: datetime

def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or f"doc-{uuid.uuid4().hex[:8]}"

def build_doc_response(doc: dict, version: dict) -> Doc:
    return Doc(
        id=doc["id"],
        title=version.get("title", doc.get("title", "")),
        content=version.get("content_md", ""),
        category=doc.get("category") or "technical",
        tags=doc.get("tags") or [],
        version=int(version.get("version", 0)),
        created_at=doc.get("created_at") or datetime.utcnow(),
        updated_at=doc.get("updated_at") or datetime.utcnow()
    )

@router.get("", response_model=List[Doc])
async def list_docs(request: Request):
    """List documentation"""
    tenant_id = get_tenant_id(request)
    supabase = get_supabase_client()

    docs_result = supabase.table("docs")\
        .select("*")\
        .eq("tenant_id", tenant_id)\
        .order("updated_at", desc=True)\
        .execute()

    docs = []
    for doc in docs_result.data or []:
        versions = supabase.table("doc_versions")\
            .select("*")\
            .eq("doc_id", doc["id"])\
            .order("version", desc=True)\
            .limit(1)\
            .execute()
        version = versions.data[0] if versions.data else {}
        docs.append(build_doc_response(doc, version))

    return docs

@router.post("", response_model=Doc)
async def create_doc(request: Request, doc: DocCreate):
    """Create documentation"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request, required=False)
    supabase = get_supabase_client()

    allowed_categories = {"user_guide", "api_docs", "technical", "process", "requirements"}
    category = doc.category if doc.category in allowed_categories else "technical"

    doc_payload = {
        "tenant_id": tenant_id,
        "slug": slugify(doc.title),
        "title": doc.title,
        "category": category,
        "tags": doc.tags,
        "is_published": False,
        "created_by": user_id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    doc_result = supabase.table("docs").insert(doc_payload).execute()
    if not doc_result.data:
        raise HTTPException(status_code=500, detail="Doc creation failed")
    created_doc = doc_result.data[0]

    version_payload = {
        "doc_id": created_doc["id"],
        "version": 1,
        "title": doc.title,
        "content_md": doc.content,
        "author_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    version_result = supabase.table("doc_versions").insert(version_payload).execute()
    if version_result.data:
        current_version_id = version_result.data[0]["id"]
        supabase.table("docs")\
            .update({"current_version_id": current_version_id, "updated_at": datetime.utcnow().isoformat()})\
            .eq("id", created_doc["id"])\
            .execute()

    version = version_result.data[0] if version_result.data else {}
    return build_doc_response(created_doc, version)

@router.get("/{doc_id}")
async def get_doc(request: Request, doc_id: str):
    """Get document"""
    tenant_id = get_tenant_id(request)
    supabase = get_supabase_client()

    doc_result = supabase.table("docs")\
        .select("*")\
        .eq("id", doc_id)\
        .eq("tenant_id", tenant_id)\
        .execute()
    if not doc_result.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = doc_result.data[0]
    versions = supabase.table("doc_versions")\
        .select("*")\
        .eq("doc_id", doc_id)\
        .order("version", desc=True)\
        .limit(1)\
        .execute()
    version = versions.data[0] if versions.data else {}
    return build_doc_response(doc, version)

@router.post("/search")
async def search_docs(request: Request, query: str):
    """Search documentation"""
    tenant_id = get_tenant_id(request)
    supabase = get_supabase_client()

    matched_docs = {}

    title_matches = supabase.table("docs")\
        .select("*")\
        .eq("tenant_id", tenant_id)\
        .ilike("title", f"%{query}%")\
        .execute()
    for doc in title_matches.data or []:
        matched_docs[doc["id"]] = doc

    content_matches = supabase.table("doc_versions")\
        .select("doc_id")\
        .ilike("content_md", f"%{query}%")\
        .execute()
    doc_ids = list({row["doc_id"] for row in content_matches.data or []})
    if doc_ids:
        docs_by_ids = supabase.table("docs")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .in_("id", doc_ids)\
            .execute()
        for doc in docs_by_ids.data or []:
            matched_docs[doc["id"]] = doc

    results = []
    for doc in matched_docs.values():
        versions = supabase.table("doc_versions")\
            .select("*")\
            .eq("doc_id", doc["id"])\
            .order("version", desc=True)\
            .limit(1)\
            .execute()
        version = versions.data[0] if versions.data else {}
        results.append(build_doc_response(doc, version))

    return results
