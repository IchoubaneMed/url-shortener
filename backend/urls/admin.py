from django.contrib import admin

from .models import URLMapping


@admin.register(URLMapping)
class URLMappingAdmin(admin.ModelAdmin):
    list_display = (
        "short_code",
        "original_url",
        "created_at",
        "tracking_enabled",
    )

    search_fields = (
        "short_code",
        "original_url",
    )