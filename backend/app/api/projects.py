import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all projects within the user's organization."""
    repo = ProjectRepository(db)
    return await repo.list_by_organization(current_user.organization_id)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.TECH_LEAD])),
    db: AsyncSession = Depends(get_db),
):
    """Create a new project (Admin/Manager only)."""
    repo = ProjectRepository(db)
    existing = await repo.get_by_key(current_user.organization_id, data.key)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project key '{data.key.upper()}' already exists in organization.",
        )
    return await repo.create(current_user.organization_id, data)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get project details by ID."""
    repo = ProjectRepository(db)
    project = await repo.get_by_id(project_id)
    if not project or project.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.TECH_LEAD])),
    db: AsyncSession = Depends(get_db),
):
    """Update project metadata."""
    repo = ProjectRepository(db)
    project = await repo.get_by_id(project_id)
    if not project or project.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return await repo.update(project, data)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.TECH_LEAD])),
    db: AsyncSession = Depends(get_db),
):
    """Delete project (Admin only)."""
    repo = ProjectRepository(db)
    project = await repo.get_by_id(project_id)
    if not project or project.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    await repo.delete(project)
