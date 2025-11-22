"""Tenant Domain Serializers"""
from rest_framework import serializers
from .models import Tenant

class TenantSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Tenant
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class TenantListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Tenant
        fields = ['id', 'tenant_id', 'full_name', 'email', 'phone', 'status', 'approval_status']

