import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_role, get_db
from app.core.security import hash_password
from app.models.enums import OrganizationStatus, UserRole
from app.models.organization import Organization
from app.models.user import User
from app.models.project import Project
from app.models.bug import Bug

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])


# Pydantic Schemas for Super Admin Operations
class CreateSoftwareHouseRequest(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=255)
    organization_slug: str = Field(..., min_length=2, max_length=255)
    logo: Optional[str] = None
    domain: Optional[str] = None
    admin_name: str = Field(..., min_length=2, max_length=255)
    admin_email: EmailStr
    admin_password: str = Field(..., min_length=8, max_length=100)


class SoftwareHouseResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    logo: Optional[str]
    domain: Optional[str]
    status: OrganizationStatus
    is_active: bool
    created_at: datetime
    admin_email: Optional[str] = None
    project_count: int = 0
    bug_count: int = 0

    class Config:
        from_attributes = True


class UpdateStatusRequest(BaseModel):
    status: OrganizationStatus


class AnalyticsResponse(BaseModel):
    total_organizations: int
    active_organizations: int
    suspended_organizations: int
    total_users: int
    total_projects: int
    total_bugs: int


# Super Admin Routes (Protected by SUPER_ADMIN role guard)
@router.post(
    "/organizations",
    response_model=SoftwareHouseResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role([UserRole.SUPER_ADMIN]))],
)
async def create_software_house(
    data: CreateSoftwareHouseRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Super Admin endpoint to onboard a new Software House (Organization) and
    automatically provision its initial Organization Admin account.
    """
    # Verify slug uniqueness
    res_slug = await db.execute(
        select(Organization).where(Organization.slug == data.organization_slug)
    )
    if res_slug.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization slug is already registered.",
        )

    # Verify admin email uniqueness
    res_email = await db.execute(select(User).where(User.email == data.admin_email))
    if res_email.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin email address is already registered.",
        )

    # Create Organization
    org = Organization(
        name=data.organization_name,
        slug=data.organization_slug.lower().strip(),
        logo=data.logo,
        domain=data.domain,
        status=OrganizationStatus.ACTIVE,
    )
    db.add(org)
    await db.flush()

    # Provision first Organization Admin user
    admin_user = User(
        email=data.admin_email,
        hashed_password=hash_password(data.admin_password),
        full_name=data.admin_name,
        role=UserRole.ORGANIZATION_ADMIN,
        organization_id=org.id,
    )
    db.add(admin_user)
    await db.commit()
    await db.refresh(org)

    return SoftwareHouseResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        logo=org.logo,
        domain=org.domain,
        status=org.status,
        is_active=org.is_active,
        created_at=org.created_at,
        admin_email=admin_user.email,
        project_count=0,
        bug_count=0,
    )


@router.get(
    "/organizations",
    response_model=List[SoftwareHouseResponse],
    dependencies=[Depends(require_role([UserRole.SUPER_ADMIN]))],
)
async def list_software_houses(
    db: AsyncSession = Depends(get_db),
):
    """List all registered Software Houses for Super Admin management."""
    res = await db.execute(select(Organization).order_by(Organization.created_at.desc()))
    orgs = list(res.scalars().all())

    output = []
    for org in orgs:
        # Fetch admin email
        res_admin = await db.execute(
            select(User.email).where(
                User.organization_id == org.id,
                User.role == UserRole.ORGANIZATION_ADMIN,
            ).limit(1)
        )
        admin_email = res_admin.scalar_one_or_none()

        # Count projects & bugs
        res_p = await db.execute(
            select(func.count(Project.id)).where(Project.organization_id == org.id)
        )
        p_count = res_p.scalar() or 0

        res_b = await db.execute(
            select(func.count(Bug.id)).join(Project).where(Project.organization_id == org.id)
        )
        b_count = res_b.scalar() or 0

        output.append(
            SoftwareHouseResponse(
                id=org.id,
                name=org.name,
                slug=org.slug,
                logo=org.logo,
                domain=org.domain,
                status=org.status,
                is_active=org.is_active,
                created_at=org.created_at,
                admin_email=admin_email,
                project_count=p_count,
                bug_count=b_count,
            )
        )

    return output


@router.put(
    "/organizations/{org_id}/status",
    response_model=SoftwareHouseResponse,
    dependencies=[Depends(require_role([UserRole.SUPER_ADMIN]))],
)
async def update_organization_status(
    org_id: uuid.UUID,
    data: UpdateStatusRequest,
    db: AsyncSession = Depends(get_db),
):
    """Suspend or Activate a Software House Organization."""
    res = await db.execute(select(Organization).where(Organization.id == org_id))
    org = res.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")

    org.status = data.status
    org.is_active = (data.status == OrganizationStatus.ACTIVE)
    await db.commit()
    await db.refresh(org)

    return SoftwareHouseResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        logo=org.logo,
        domain=org.domain,
        status=org.status,
        is_active=org.is_active,
        created_at=org.created_at,
    )


@router.delete(
    "/organizations/{org_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role([UserRole.SUPER_ADMIN]))],
)
async def delete_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a Software House Organization and cascade delete associated data."""
    res = await db.execute(select(Organization).where(Organization.id == org_id))
    org = res.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")

    await db.delete(org)
    await db.commit()


@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
    dependencies=[Depends(require_role([UserRole.SUPER_ADMIN]))],
)
async def get_system_analytics(
    db: AsyncSession = Depends(get_db),
):
    """Get system-wide analytics for Super Admin dashboard."""
    tot_orgs = (await db.execute(select(func.count(Organization.id)))).scalar() or 0
    act_orgs = (await db.execute(select(func.count(Organization.id)).where(Organization.status == OrganizationStatus.ACTIVE))).scalar() or 0
    sus_orgs = (await db.execute(select(func.count(Organization.id)).where(Organization.status == OrganizationStatus.SUSPENDED))).scalar() or 0
    tot_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    tot_projs = (await db.execute(select(func.count(Project.id)))).scalar() or 0
    tot_bugs = (await db.execute(select(func.count(Bug.id)))).scalar() or 0

    return AnalyticsResponse(
        total_organizations=tot_orgs,
        active_organizations=act_orgs,
        suspended_organizations=sus_orgs,
        total_users=tot_users,
        total_projects=tot_projs,
        total_bugs=tot_bugs,
    )
