from django.db import models


class URLMapping(models.Model):
    short_code = models.CharField(
        max_length=6,
        unique=True,
        blank=True,
    )

    original_url = models.URLField(
        max_length=2048,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    tracking_enabled = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.short_code or str(self.pk)