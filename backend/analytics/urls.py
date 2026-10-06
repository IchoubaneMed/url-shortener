from django.urls import path

from .views import AnalyticsDetailView


urlpatterns = [
    path(
        "urls/<str:short_code>/analytics/",
        AnalyticsDetailView.as_view(),
        name="url-analytics",
    ),
]