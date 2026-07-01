from django.urls import path # type: ignore
from .views import health_check, dashboard

urlpatterns = [
    path("health/", health_check),
    path("dashboard/", dashboard),
]