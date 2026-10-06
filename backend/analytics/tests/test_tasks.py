import pytest

from analytics.models import Analytics
from analytics.tasks import track_url_click
from urls.models import URLMapping


@pytest.mark.django_db
def test_track_url_click():
    mapping = URLMapping.objects.create(
        short_code="abc123",
        original_url="https://example.com",
    )

    analytics = Analytics.objects.create(
        url_mapping=mapping,
    )

    track_url_click(
        mapping.short_code
    )

    analytics.refresh_from_db()

    assert analytics.click_count == 1
    assert analytics.last_accessed is not None