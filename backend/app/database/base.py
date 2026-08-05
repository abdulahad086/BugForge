from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase


class Base(AsyncAttrs, DeclarativeBase):
    """
    Abstract Base Class for all SQLAlchemy models in BugForge.
    Inherits from AsyncAttrs for lazy-loading support in async contexts
    and DeclarativeBase for SQLAlchemy 2.0 style declarative mapping.
    """
    pass
