import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import BugPriority, BugSeverity, BugStatus


class BugCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=3)
    project_id: uuid.UUID
    priority: BugPriority = BugPriority.MEDIUM
    severity: BugSeverity = BugSeverity.MEDIUM
    assignee_id: Optional[uuid.UUID] = None


class BugUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    status: Optional[BugStatus] = None
    priority: Optional[BugPriority] = None
    severity: Optional[BugSeverity] = None
    assignee_id: Optional[uuid.UUID] = None


class BugResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    status: BugStatus
    priority: BugPriority
    severity: BugSeverity
    project_id: uuid.UUID
    reporter_id: uuid.UUID
    assignee_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
