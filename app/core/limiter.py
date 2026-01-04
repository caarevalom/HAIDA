import os
from redis import Redis
from fastapi import HTTPException

redis = Redis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379/0"))

def rate_limit(user_id: str, endpoint: str, max_calls: int = 60, window_sec: int = 60):
    key = f"rate_limit:{user_id}:{endpoint}"
    current = redis.incr(key)
    redis.expire(key, window_sec)
    if current > max_calls:
        raise HTTPException(429, f"Rate limit exceeded for {endpoint}")
