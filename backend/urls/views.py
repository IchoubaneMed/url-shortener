from rest_framework.generics import (
    ListCreateAPIView,
)

from django.shortcuts import (
    get_object_or_404,
    redirect,
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
    mapping = get_object_or_404(
        URLMapping,
        short_code=short_code,
    )

    return redirect(
        mapping.original_url
    )