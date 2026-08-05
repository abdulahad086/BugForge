import uuid
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.bug import Bug
    from app.models.user import User


class Comment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "comments"

    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Foreign Keys
    bug_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("bugs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # Relationships
    bug: Mapped["Bug"] = relationship("Bug", back_populates="comments", lazy="raise")
    author: Mapped["User"] = relationship("User", back_populates="comments", lazy="raise")
