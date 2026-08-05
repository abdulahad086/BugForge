from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an asynchronous database session.
    Ensures that sessions are closed after the request completes, even if an exception occurs.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
