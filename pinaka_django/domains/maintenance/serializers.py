"""Maintenance Domain Serializers"""
from rest_framework import serializers
from .models import MaintenanceRequest, MaintenanceComment

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    property_display = serializers.CharField(source='property.property_name', read_only=True)
    tenant_display = serializers.CharField(source='tenant.full_name', read_only=True)
    
    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class MaintenanceCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceComment
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

