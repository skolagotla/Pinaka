"""Verifications Domain API Views"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import UnifiedVerification, UnifiedVerificationHistory
from .serializers import (
    UnifiedVerificationSerializer,
    UnifiedVerificationListSerializer,
    UnifiedVerificationHistorySerializer
)


class UnifiedVerificationViewSet(viewsets.ModelViewSet):
    queryset = UnifiedVerification.objects.prefetch_related('history').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'verification_type',
        'status',
        'priority',
        'requested_by',
        'requested_by_role',
        'assigned_to',
        'verified_by',
        'entity_type',
    ]
    search_fields = [
        'title',
        'description',
        'requested_by_email',
        'requested_by_name',
        'entity_id',
    ]
    ordering = ['-requested_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UnifiedVerificationListSerializer
        return UnifiedVerificationSerializer


class UnifiedVerificationHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UnifiedVerificationHistory.objects.select_related('verification').all()
    serializer_class = UnifiedVerificationHistorySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['verification', 'action', 'performed_by']
    ordering = ['-created_at']

