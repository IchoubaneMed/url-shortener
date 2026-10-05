from django.db import models

from urls.models import URLMapping


class Analytics(models.Model):
    url_mapping = models.OneToOneField(
        URLMapping,
        on_delete=models.CASCADE,
        related_name="analytics",
    )

    click_count = models.PositiveBigIntegerField(
        default=0,
    )

    last_accessed = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return (
            f"{self.url_mapping.short_code} "
            f"({self.click_count} clicks)"
        )