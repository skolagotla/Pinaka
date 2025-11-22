"""Activity Domain Serializers"""
from rest_framework import serializers
from .models import ActivityLog, UserActivity


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class ActivityLogListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user_name',
            'user_role',
            'action',
            'entity_type',
            'entity_name',
            'description',
            'metadata',
            'created_at',
        ]

