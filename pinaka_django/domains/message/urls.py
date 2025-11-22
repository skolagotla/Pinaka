"""Message Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, MessageViewSet, MessageAttachmentViewSet

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'message-attachments', MessageAttachmentViewSet, basename='message-attachment')
urlpatterns = router.urls

