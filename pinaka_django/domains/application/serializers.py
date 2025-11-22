"""Application Domain Serializers"""
from rest_framework import serializers
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.property_name', read_only=True)
    unit_name = serializers.CharField(source='unit.unit_name', read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ApplicationListSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.property_name', read_only=True)
    unit_name = serializers.CharField(source='unit.unit_name', read_only=True)
    
    class Meta:
        model = Application
        fields = [
            'id',
            'applicant_name',
            'applicant_email',
            'property_name',
            'unit_name',
            'status',
            'deadline',
            'created_at',
        ]

