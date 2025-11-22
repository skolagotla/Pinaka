"""Service Providers Domain Serializers"""
from rest_framework import serializers
from .models import ServiceProvider, ServiceProviderRating


class ServiceProviderRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceProviderRating
        fields = '__all__'
        read_only_fields = ['id', 'overall_rating', 'created_at', 'updated_at']


class ServiceProviderSerializer(serializers.ModelSerializer):
    ratings = ServiceProviderRatingSerializer(many=True, read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ServiceProvider
        fields = '__all__'
        read_only_fields = ['id', 'provider_id', 'created_at', 'updated_at']


class ServiceProviderListSerializer(serializers.ModelSerializer):
    is_approved = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ServiceProvider
        fields = [
            'id',
            'provider_id',
            'company_name',
            'contact_name',
            'email',
            'phone',
            'provider_type',
            'is_active',
            'is_verified',
            'approval_status',
            'is_approved',
            'average_rating',
            'total_ratings',
            'created_at',
        ]

