import pytest
from rest_framework.test import APIClient

from analytics.models import Analytics
from urls.models import URLMapping


@pytest.mark.django_db
def test_create_short_url():
    client = APIClient()

    response = client.post(
        "/api/v1/urls/",
        {
            "original_url": "https://example.com",
        },
        format="json",
    )

    assert response.status_code == 201

    assert URLMapping.objects.count() == 1

    mapping = URLMapping.objects.first()

    assert mapping.original_url == "https://example.com"
    assert mapping.short_code is not None

    assert response.data["short_code"] == mapping.short_code

@pytest.mark.django_db
def test_create_url_creates_analytics():
    client = APIClient()

    response = client.post(
        "/api/v1/urls/",
        {
            "original_url": "https://example.com",
        },
        format="json",
    )

    assert response.status_code == 201

    mapping = URLMapping.objects.get()

    analytics = Analytics.objects.get(
        url_mapping=mapping
    )

    assert analytics.click_count == 0
    assert analytics.last_accessed is None

@pytest.mark.django_db
def test_create_url_with_invalid_url():
    client = APIClient()

    response = client.post(
        "/api/v1/urls/",
        {
            "original_url": "not-a-valid-url",
        },
        format="json",
    )

    assert response.status_code == 400

    assert URLMapping.objects.count() == 0