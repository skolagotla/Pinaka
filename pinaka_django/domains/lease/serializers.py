"""Lease Domain Serializers"""
from rest_framework import serializers
from .models import Lease, LeaseTenant

class LeaseSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    unit_display = serializers.CharField(source='unit.unit_number', read_only=True)
    
    class Meta:
        model = Lease
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LeaseTenantSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    
    class Meta:
        model = LeaseTenant
        fields = '__all__'
        read_only_fields = ['id', 'added_at']

