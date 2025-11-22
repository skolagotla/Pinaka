"""Landlord Domain Serializers"""
from rest_framework import serializers
from .models import Landlord

class LandlordSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Landlord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LandlordListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Landlord
        fields = ['id', 'landlord_id', 'full_name', 'email', 'phone', 'approval_status', 'is_approved']

