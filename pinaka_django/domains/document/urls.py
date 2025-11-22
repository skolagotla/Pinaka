"""Document Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, DocumentAuditLogViewSet, DocumentMessageViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'document-audit-logs', DocumentAuditLogViewSet, basename='document-audit-log')
router.register(r'document-messages', DocumentMessageViewSet, basename='document-message')
urlpatterns = router.urls

