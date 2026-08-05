import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from app.core.config import settings

# Initialize OWASP recommended Argon2id password hasher
password_hash = PasswordHash((Argon2Hasher(),))


def hash_password(password: str) -> str:
    """Hash plain text password using Argon2id."""
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain text password against Argon2id hash."""
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(
    subject: str | uuid.UUID,
    role: str,
    organization_id: str | uuid.UUID,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create JWT Access Token with claims."""
    now = datetime.now(timezone.utc)
    expires = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "org_id": str(organization_id),
        "type": "access",
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    subject: str | uuid.UUID,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create JWT Refresh Token."""
    now = datetime.now(timezone.utc)
    expires = now + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT token."""
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
