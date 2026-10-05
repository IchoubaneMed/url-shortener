from rest_framework import serializers

from analytics.models import Analytics

from .models import URLMapping
from .services.base62 import encode


class URLMappingSerializer(
    serializers.ModelSerializer
):
    short_url = serializers.SerializerMethodField()

    class Meta:
        model = URLMapping

        fields = (
            "short_code",
            "short_url",
            "original_url",
            "created_at",
        )

        read_only_fields = (
            "short_code",
            "short_url",
            "created_at",
        )

    def create(self, validated_data):
        mapping = URLMapping.objects.create(
            **validated_data
        )

        mapping.short_code = encode(
            mapping.pk
        )

        mapping.save(
            update_fields=["short_code"]
        )

        Analytics.objects.create(
            url_mapping=mapping
        )

        return mapping

    def get_short_url(self, obj):
        request = self.context.get(
            "request"
        )

        path = f"/{obj.short_code}"

        if request:
            return request.build_absolute_uri(
                path
            )

        return path