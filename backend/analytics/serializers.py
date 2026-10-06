from rest_framework import serializers

from .models import Analytics


class AnalyticsSerializer(
    serializers.ModelSerializer
):
    short_code = serializers.CharField(
        source="url_mapping.short_code",
        read_only=True,
    )

    class Meta:
        model = Analytics

        fields = (
            "short_code",
            "click_count",
            "last_accessed",
        )