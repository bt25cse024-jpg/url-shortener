import json

import redis

REDIS_URL = "redis://localhost:6379/0"
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)


def get_link(short_code: str):
    try:
        cached_link = redis_client.get(short_code)
        if cached_link is None:
            return None

        link_data = json.loads(cached_link)
        return int(link_data["link_id"]), link_data["original_url"]
    except (redis.RedisError, ValueError, TypeError, KeyError):
        return None


def set_link(
    short_code: str,
    link_id: int,
    original_url: str,
    ttl_seconds: int = 86400,
):
    try:
        redis_client.setex(
            short_code,
            ttl_seconds,
            json.dumps({"link_id": link_id, "original_url": original_url}),
        )
    except redis.RedisError:
        pass
