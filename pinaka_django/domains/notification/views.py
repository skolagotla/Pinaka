"""Notifications Domain API Views"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationPreferenceSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'user_id',
        'user_role',
        'notification_type',
        'is_read',
        'priority',
    ]
    search_fields = [
        'title',
        'message',
        'user_email',
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return NotificationListSerializer
        return NotificationSerializer


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_id', 'user_role', 'notification_type']

