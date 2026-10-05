from rest_framework.generics import (
    ListCreateAPIView,
)

from .models import URLMapping
from .serializers import URLMappingSerializer


class URLListCreateView(
    ListCreateAPIView
):
    queryset = URLMapping.objects.all()
    serializer_class = URLMappingSerializer