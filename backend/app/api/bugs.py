import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db, require_role
from app.models.enums import BugPriority, BugSeverity, BugStatus, UserRole
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
    """List bugs with tenant isolation and optional filtering."""
    if current_user.role == UserRole.SUPER_ADMIN:
        # Super admin list all bugs across system
        bug_repo = BugRepository(db)
        res = await db.execute(select(Bug))
        return list(res.scalars().all())

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
    """
    Create a new bug ticket.
    DEVELOPER & VIEWER roles cannot assign bugs. Bug assignment is restricted to
    ORGANIZATION_ADMIN and TECH_LEAD roles.
    """
    # Verify assignment permissions
    if data.assignee_id and current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.TECH_LEAD]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Organization Admin or Tech Lead can assign bugs.",
        )

    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(data.project_id)
    if not project or (current_user.role != UserRole.SUPER_ADMIN and project.organization_id != current_user.organization_id):
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
    """
    Update bug details or status.
    Reassigning assignee_id requires ORGANIZATION_ADMIN or TECH_LEAD role.
    """
    bug_repo = BugRepository(db)
    bug = await bug_repo.get_by_id(bug_id)
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found.")

    # Restrict bug reassignment
    if data.assignee_id is not None and data.assignee_id != bug.assignee_id:
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.TECH_LEAD]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Organization Admin or Tech Lead can reassign bugs.",
            )

    return await bug_repo.update(bug, data)


@router.delete("/{bug_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bug(
    bug_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Delete bug ticket (Super Admin & Organization Admin only)."""
    bug_repo = BugRepository(db)
    bug = await bug_repo.get_by_id(bug_id)
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found.")
    await bug_repo.delete(bug)
