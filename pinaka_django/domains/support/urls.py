"""Support Tickets Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import SupportTicketViewSet, TicketNoteViewSet, TicketAttachmentViewSet

router = DefaultRouter()
router.register(r'support-tickets', SupportTicketViewSet, basename='support-ticket')
router.register(r'ticket-notes', TicketNoteViewSet, basename='ticket-note')
router.register(r'ticket-attachments', TicketAttachmentViewSet, basename='ticket-attachment')
urlpatterns = router.urls

