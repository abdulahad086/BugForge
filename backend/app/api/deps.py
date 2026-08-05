import uuid
from typing import AsyncGenerator, List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import is_token_blacklisted
from app.core.security import decode_token
from app.database.session import AsyncSessionLocal
from app.models.enums import UserRole
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an asynchronous database session.
    Ensures that sessions are closed after the request completes.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI authentication dependency. Decodes JWT token, checks Redis blacklist,
    and returns current authenticated User model instance.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id_str: str = payload.get("sub")
        jti: str = payload.get("jti")
        token_type: str = payload.get("type")
        if not user_id_str or token_type != "access":
            raise credentials_exception
    except Exception:
        raise credentials_exception

    # Check token revocation blacklist in Redis
    if jti and await is_token_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    res = await db.execute(select(User).where(User.id == uuid.UUID(user_id_str)))
    user = res.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_role(allowed_roles: List[UserRole]) -> Callable:
    """
    FastAPI dependency factory for Role-Based Access Control (RBAC).
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role '{current_user.role.value}'",
            )
        return current_user

    return role_checker
