from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.enums import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse


class AuthService:
    @staticmethod
    async def register_organization_and_admin(
        db: AsyncSession, data: RegisterRequest
    ) -> User:
        # Check if email exists
        res_email = await db.execute(select(User).where(User.email == data.email))
        if res_email.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered.",
            )

        # Check if organization slug exists
        res_slug = await db.execute(
            select(Organization).where(Organization.slug == data.organization_slug)
        )
        if res_slug.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization slug is already taken.",
            )

        # Create Organization
        organization = Organization(
            name=data.organization_name,
            slug=data.organization_slug,
        )
        db.add(organization)
        await db.flush()

        # Create Admin User
        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role=UserRole.ADMIN,
            organization_id=organization.id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(
        db: AsyncSession, email: str, password: str
    ) -> User:
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated.",
            )
        return user

    @staticmethod
    def issue_tokens(user: User) -> TokenResponse:
        access_token = create_access_token(
            subject=user.id,
            role=user.role.value,
            organization_id=user.organization_id,
        )
        refresh_token = create_refresh_token(subject=user.id)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )
