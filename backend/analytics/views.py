from rest_framework.generics import (
    RetrieveAPIView,
)

from .models import Analytics
from .serializers import AnalyticsSerializer


class AnalyticsDetailView(
    RetrieveAPIView
):
    queryset = Analytics.objects.select_related(
        "url_mapping"
    )

    serializer_class = AnalyticsSerializer

    lookup_field = (
        "url_mapping__short_code"
    )

    lookup_url_kwarg = "short_code"