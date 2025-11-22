"""Lease Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import LeaseViewSet, LeaseTenantViewSet

router = DefaultRouter()
router.register(r'leases', LeaseViewSet, basename='lease')
router.register(r'lease-tenants', LeaseTenantViewSet, basename='lease-tenant')
urlpatterns = router.urls

