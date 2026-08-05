import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db
from app.models.enums import BugPriority, BugSeverity, BugStatus
from app.models.user import User
from app.repositories.bug_repository import BugRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.bug import BugCreate, BugResponse, BugUpdate

router = APIRouter(prefix="/bugs", tags=["Bugs"])


@router.get("", response_model=List[BugResponse])
async def list_bugs(
    status: Optional[BugStatus] = Query(None),
    priority: Optional[BugPriority] = Query(None),
    severity: Optional[BugSeverity] = Query(None),
    assignee_id: Optional[uuid.UUID] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List bugs with optional filtering and text search across organization projects."""
    project_repo = ProjectRepository(db)
    projects = await project_repo.list_by_organization(current_user.organization_id)
    if not projects:
        return []
    project_ids = [p.id for p in projects]

    bug_repo = BugRepository(db)
    return await bug_repo.list_bugs(
        project_ids=project_ids,
        status=status,
        priority=priority,
        severity=severity,
        assignee_id=assignee_id,
        search=search,
    )


@router.post("", response_model=BugResponse, status_code=status.HTTP_201_CREATED)
async def create_bug(
    data: BugCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new bug issue ticket."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(data.project_id)
    if not project or project.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    bug_repo = BugRepository(db)
    return await bug_repo.create(current_user.id, data)


@router.get("/{bug_id}", response_model=BugResponse)
async def get_bug(
    bug_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get bug details by ID."""
    bug_repo = BugRepository(db)
    bug = await bug_repo.get_by_id(bug_id)
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found.")
    return bug


@router.put("/{bug_id}", response_model=BugResponse)
async def update_bug(
    bug_id: uuid.UUID,
    data: BugUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update bug details or status transition."""
    bug_repo = BugRepository(db)
    bug = await bug_repo.get_by_id(bug_id)
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found.")
    return await bug_repo.update(bug, data)


@router.delete("/{bug_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bug(
    bug_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete bug ticket."""
    bug_repo = BugRepository(db)
    bug = await bug_repo.get_by_id(bug_id)
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found.")
    await bug_repo.delete(bug)
