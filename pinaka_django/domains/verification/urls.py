"""Verifications Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import UnifiedVerificationViewSet, UnifiedVerificationHistoryViewSet

router = DefaultRouter()
router.register(r'verifications', UnifiedVerificationViewSet, basename='verification')
router.register(r'verification-history', UnifiedVerificationHistoryViewSet, basename='verification-history')
urlpatterns = router.urls

