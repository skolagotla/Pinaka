"""Activity Domain API Views"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ActivityLog, UserActivity
from .serializers import ActivityLogSerializer, ActivityLogListSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Activity Log API - Read-only"""
    queryset = ActivityLog.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'user_id',
        'user_role',
        'action',
        'entity_type',
        'property_id',
        'landlord_id',
        'tenant_id',
    ]
    search_fields = [
        'user_name',
        'user_email',
        'entity_name',
        'description',
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ActivityLogListSerializer
        return ActivityLogSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit = int(limit)
                return queryset[:limit]
            except ValueError:
                pass
        return queryset

