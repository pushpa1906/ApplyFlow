from rest_framework.decorators import api_view # type: ignore
from rest_framework.response import Response # type: ignore

from services.dashboard_service import DashboardService

dashboard_service = DashboardService()


@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "healthy",
        "service": "ApplyFlow API",
        "version": "1.0.0"
    })


@api_view(["GET"])
def dashboard(request):
    return Response(dashboard_service.get_dashboard())