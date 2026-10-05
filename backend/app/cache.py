import redis

REDIS_URL = "redis://localhost:6379/0"
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)


def get_url(short_code: str):
    try:
        return redis_client.get(short_code)
    except redis.RedisError:
        return None


def set_url(short_code: str, original_url: str, ttl_seconds: int = 86400):
    try:
        redis_client.setex(short_code, ttl_seconds, original_url)
    except redis.RedisError:
        pass
