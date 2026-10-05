from django.urls import path

from .views import URLListCreateView


urlpatterns = [
    path(
        "urls/",
        URLListCreateView.as_view(),
        name="url-list-create",
    ),
]