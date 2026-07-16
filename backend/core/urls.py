from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health, name='health-check'),
    path('config/', views.config_view, name='app-config'),
    path('sheets/validate/', views.validate_sheet, name='validate-sheet'),
    path('applications/', views.applications, name='applications'),
    path('applications/<str:row_id>/', views.application_detail, name='application-detail'),
]
