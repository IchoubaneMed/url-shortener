from django.core.cache import cache


CACHE_TIMEOUT = 60 * 60 * 24


def get_url(short_code):
    return cache.get(
        f"url:{short_code}"
    )


def cache_url(
    short_code,
    original_url,
):
    cache.set(
        f"url:{short_code}",
        original_url,
        timeout=CACHE_TIMEOUT,
    )