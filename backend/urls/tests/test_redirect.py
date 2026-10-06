import pytest
from django.urls import reverse
from unittest.mock import patch

from urls.models import URLMapping


@pytest.mark.django_db
@patch("urls.views.track_url_click.delay")
def test_redirect_short_url(
    mock_track_click,
    client,
):
    mapping = URLMapping.objects.create(
        short_code="abc123",
        original_url="https://example.com",
    )

    response = client.get(
        reverse(
            "redirect-short-url",
            kwargs={
                "short_code": mapping.short_code,
            },
        )
    )

    assert response.status_code == 302
    assert response["Location"] == "https://example.com"

    mock_track_click.assert_called_once_with(
        "abc123"
    )