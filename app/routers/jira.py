"""
Jira Integration Router
"""
from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/issues")
async def list_issues(project: str = None):
    """List Jira issues"""
    # TODO: Integrate with Atlassian API
    return {
        "issues": [
            {
                "key": "HAIDA-1",
                "summary": "Example bug from automated test",
                "status": "Open",
                "priority": "High"
            }
        ]
    }


@router.post("/issues")
async def create_issue(
    summary: str,
    description: str,
    issue_type: str = "Bug",
    priority: str = "Medium"
):
    """Create a Jira issue"""
    # TODO: Use Atlassian API to create issue
    return {
        "key": "HAIDA-123",
        "summary": summary,
        "status": "Created",
        "url": f"{settings.ATLASSIAN_URL}/browse/HAIDA-123"
    }


@router.put("/issues/{issue_key}")
async def update_issue(issue_key: str, status: str = None, comment: str = None):
    """Update Jira issue"""
    # TODO: Use Atlassian API
    return {
        "key": issue_key,
        "status": status or "Updated",
        "message": "Issue updated successfully"
    }
