"""PMC Domain Serializers"""
from rest_framework import serializers
from .models import PropertyManagementCompany

class PropertyManagementCompanySerializer(serializers.ModelSerializer):
    is_approved = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PropertyManagementCompany
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class PropertyManagementCompanyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyManagementCompany
        fields = ['id', 'company_id', 'company_name', 'email', 'phone', 'is_active', 'approval_status', 'is_approved']

