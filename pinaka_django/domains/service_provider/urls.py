"""Service Providers Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import ServiceProviderViewSet, ServiceProviderRatingViewSet

router = DefaultRouter()
router.register(r'service-providers', ServiceProviderViewSet, basename='service-provider')
router.register(r'service-provider-ratings', ServiceProviderRatingViewSet, basename='service-provider-rating')
urlpatterns = router.urls

