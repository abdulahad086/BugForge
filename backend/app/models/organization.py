from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from app.models.enums import OrganizationStatus
from app.models.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project


class Organization(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    logo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[OrganizationStatus] = mapped_column(
        SQLEnum(OrganizationStatus), default=OrganizationStatus.ACTIVE, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    # Relationships
    users: Mapped[List["User"]] = relationship(
        "User", back_populates="organization", cascade="all, delete-orphan", lazy="raise"
    )
    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="organization", cascade="all, delete-orphan", lazy="raise"
    )
