from celery import shared_task
from django.db.models import F
from django.utils import timezone

from .models import Analytics


@shared_task
def track_url_click(short_code):
    Analytics.objects.filter(
        url_mapping__short_code=short_code
    ).update(
        click_count=F("click_count") + 1,
        last_accessed=timezone.now(),
    )