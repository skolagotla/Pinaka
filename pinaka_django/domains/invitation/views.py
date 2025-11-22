"""Invitations Domain API Views"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Invitation
from .serializers import InvitationSerializer, InvitationListSerializer


class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.select_related(
        'invited_by_admin', 'invited_by_landlord', 'invited_by_pmc'
    ).all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'invitation_type',
        'status',
        'invited_by',
        'invited_by_role',
        'email',
    ]
    search_fields = [
        'email',
        'token',
        'invited_by_name',
        'invited_by_email',
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InvitationListSerializer
        return InvitationSerializer

