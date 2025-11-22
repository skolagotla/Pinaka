"""PMC Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import PropertyManagementCompanyViewSet

router = DefaultRouter()
router.register(r'pmcs', PropertyManagementCompanyViewSet, basename='pmc')
urlpatterns = router.urls

