"""
Confluence Integration Router
"""
from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/pages")
async def list_pages(space: str = None):
    """List Confluence pages"""
    # TODO: Integrate with Atlassian API
    return {
        "pages": [
            {
                "id": "page-1",
                "title": "HAIDA Documentation",
                "space": settings.CONFLUENCE_SPACE,
                "url": f"{settings.ATLASSIAN_URL}/wiki/spaces/{settings.CONFLUENCE_SPACE}"
            }
        ]
    }


@router.post("/pages")
async def create_page(title: str, content: str, space: str = None):
    """Create a Confluence page"""
    target_space = space or settings.CONFLUENCE_SPACE

    # TODO: Use Atlassian API to create page
    return {
        "id": "new-page-id",
        "title": title,
        "space": target_space,
        "status": "Created",
        "url": f"{settings.ATLASSIAN_URL}/wiki/spaces/{target_space}/pages/new-page-id"
    }


@router.put("/pages/{page_id}")
async def update_page(page_id: str, title: str = None, content: str = None):
    """Update Confluence page"""
    # TODO: Use Atlassian API
    return {
        "id": page_id,
        "title": title,
        "status": "Updated",
        "message": "Page updated successfully"
    }
