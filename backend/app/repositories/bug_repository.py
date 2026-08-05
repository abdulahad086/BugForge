import uuid
from typing import List, Optional
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.bug import Bug
from app.models.enums import BugPriority, BugSeverity, BugStatus
from app.schemas.bug import BugCreate, BugUpdate


class BugRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, bug_id: uuid.UUID) -> Optional[Bug]:
        res = await self.db.execute(select(Bug).where(Bug.id == bug_id))
        return res.scalar_one_or_none()

    async def list_bugs(
        self,
        project_ids: List[uuid.UUID],
        status: Optional[BugStatus] = None,
        priority: Optional[BugPriority] = None,
        severity: Optional[BugSeverity] = None,
        assignee_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
    ) -> List[Bug]:
        query = select(Bug).where(Bug.project_id.in_(project_ids))
        if status:
            query = query.where(Bug.status == status)
        if priority:
            query = query.where(Bug.priority == priority)
        if severity:
            query = query.where(Bug.severity == severity)
        if assignee_id:
            query = query.where(Bug.assignee_id == assignee_id)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Bug.title.ilike(search_pattern),
                    Bug.description.ilike(search_pattern),
                )
            )
        query = query.order_by(Bug.created_at.desc())
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def create(self, reporter_id: uuid.UUID, data: BugCreate) -> Bug:
        bug = Bug(
            title=data.title,
            description=data.description,
            project_id=data.project_id,
            reporter_id=reporter_id,
            assignee_id=data.assignee_id,
            priority=data.priority,
            severity=data.severity,
            status=BugStatus.OPEN,
        )
        self.db.add(bug)
        await self.db.commit()
        await self.db.refresh(bug)
        return bug

    async def update(self, bug: Bug, data: BugUpdate) -> Bug:
        if data.title is not None:
            bug.title = data.title
        if data.description is not None:
            bug.description = data.description
        if data.status is not None:
            bug.status = data.status
        if data.priority is not None:
            bug.priority = data.priority
        if data.severity is not None:
            bug.severity = data.severity
        if data.assignee_id is not None:
            bug.assignee_id = data.assignee_id
        await self.db.commit()
        await self.db.refresh(bug)
        return bug

    async def delete(self, bug: Bug) -> None:
        await self.db.delete(bug)
        await self.db.commit()
