"""Maintenance Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import MaintenanceRequestViewSet, MaintenanceCommentViewSet

router = DefaultRouter()
router.register(r'maintenance-requests', MaintenanceRequestViewSet, basename='maintenance-request')
router.register(r'maintenance-comments', MaintenanceCommentViewSet, basename='maintenance-comment')
urlpatterns = router.urls

