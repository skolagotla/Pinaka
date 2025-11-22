"""Support Tickets Domain API Views"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import SupportTicket, TicketNote, TicketAttachment
from .serializers import (
    SupportTicketSerializer,
    SupportTicketListSerializer,
    TicketNoteSerializer,
    TicketAttachmentSerializer
)


class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.select_related(
        'property', 'created_by_landlord', 'created_by_tenant',
        'assigned_to_admin', 'assigned_to_landlord', 'assigned_to_pmc'
    ).prefetch_related('notes', 'attachments').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'status',
        'priority',
        'created_by_role',
        'property',
        'assigned_to_admin',
        'assigned_to_landlord',
        'assigned_to_pmc',
    ]
    search_fields = [
        'ticket_number',
        'subject',
        'description',
        'created_by_email',
        'created_by_name',
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SupportTicketListSerializer
        return SupportTicketSerializer


class TicketNoteViewSet(viewsets.ModelViewSet):
    queryset = TicketNote.objects.select_related('ticket').all()
    serializer_class = TicketNoteSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['ticket', 'created_by_role', 'is_internal']
    ordering = ['created_at']


class TicketAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TicketAttachment.objects.select_related('ticket').all()
    serializer_class = TicketAttachmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ticket']

