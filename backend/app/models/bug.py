import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Enum as SQLEnum, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from app.models.enums import BugPriority, BugSeverity, BugStatus
from app.models.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User
    from app.models.comment import Comment


class Bug(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bugs"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[BugStatus] = mapped_column(
        SQLEnum(BugStatus), default=BugStatus.OPEN, index=True, nullable=False
    )
    priority: Mapped[BugPriority] = mapped_column(
        SQLEnum(BugPriority), default=BugPriority.MEDIUM, index=True, nullable=False
    )
    severity: Mapped[BugSeverity] = mapped_column(
        SQLEnum(BugSeverity), default=BugSeverity.MEDIUM, index=True, nullable=False
    )

    # Foreign Keys
    project_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False
    )
    reporter_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="RESTRICT"), index=True, nullable=False
    )
    assignee_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="bugs", lazy="raise")
    reporter: Mapped["User"] = relationship(
        "User", foreign_keys=[reporter_id], back_populates="created_bugs", lazy="raise"
    )
    assignee: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[assignee_id], back_populates="assigned_bugs", lazy="raise"
    )
    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="bug", cascade="all, delete-orphan", lazy="raise"
    )
