import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, project_id: uuid.UUID) -> Optional[Project]:
        res = await self.db.execute(select(Project).where(Project.id == project_id))
        return res.scalar_one_or_none()

    async def get_by_key(self, organization_id: uuid.UUID, key: str) -> Optional[Project]:
        res = await self.db.execute(
            select(Project).where(
                Project.organization_id == organization_id,
                Project.key == key.upper()
            )
        )
        return res.scalar_one_or_none()

    async def list_by_organization(self, organization_id: uuid.UUID) -> List[Project]:
        res = await self.db.execute(
            select(Project).where(Project.organization_id == organization_id).order_by(Project.created_at.desc())
        )
        return list(res.scalars().all())

    async def create(self, organization_id: uuid.UUID, data: ProjectCreate) -> Project:
        project = Project(
            name=data.name,
            key=data.key.upper(),
            description=data.description,
            organization_id=organization_id,
        )
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def update(self, project: Project, data: ProjectUpdate) -> Project:
        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def delete(self, project: Project) -> None:
        await self.db.delete(project)
        await self.db.commit()
