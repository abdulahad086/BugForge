from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None


async def get_redis_client() -> Optional[aioredis.Redis]:
    """Get async Redis client connection instance."""
    global redis_client
    if redis_client is None:
        try:
            redis_client = aioredis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                decode_responses=True,
                socket_connect_timeout=2,
            )
        except Exception:
            redis_client = None
    return redis_client


async def blacklist_token(jti: str, expire_seconds: int = 1800) -> bool:
    """Add JWT ID to Redis token revocation blacklist."""
    try:
        client = await get_redis_client()
        if client:
            await client.setex(f"blacklist:{jti}", expire_seconds, "revoked")
            return True
    except Exception:
        pass
    return False


async def is_token_blacklisted(jti: str) -> bool:
    """Check if JWT ID exists in Redis revocation blacklist."""
    try:
        client = await get_redis_client()
        if client:
            val = await client.get(f"blacklist:{jti}")
            return val is not None
    except Exception:
        pass
    return False
