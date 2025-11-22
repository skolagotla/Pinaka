"""
Property Domain API URLs
"""

from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, UnitViewSet

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'units', UnitViewSet, basename='unit')

urlpatterns = router.urls

