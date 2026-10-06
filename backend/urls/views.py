from rest_framework.generics import (
    ListCreateAPIView,
)

from analytics.tasks import track_url_click

from django.http import Http404
from django.shortcuts import redirect

from .services.cache import (
    cache_url,
    get_url,
)

from .models import URLMapping
from .serializers import URLMappingSerializer


class URLListCreateView(
    ListCreateAPIView
):
    queryset = URLMapping.objects.all()
    serializer_class = URLMappingSerializer

def redirect_short_url(
    request,
    short_code,
):
    original_url = get_url(
        short_code
    )

    if original_url is None:
        try:
            mapping = URLMapping.objects.get(
                short_code=short_code
            )

        except URLMapping.DoesNotExist:
            raise Http404(
                "Short URL not found"
            )

        original_url = mapping.original_url

        cache_url(
            short_code,
            original_url,
        )

    track_url_click.delay(short_code)

    return redirect(original_url)