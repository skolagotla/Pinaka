"""Verifications Domain Serializers"""
from rest_framework import serializers
from .models import UnifiedVerification, UnifiedVerificationHistory


class UnifiedVerificationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UnifiedVerificationHistory
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class UnifiedVerificationSerializer(serializers.ModelSerializer):
    history = UnifiedVerificationHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = UnifiedVerification
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class UnifiedVerificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnifiedVerification
        fields = [
            'id',
            'title',
            'verification_type',
            'status',
            'priority',
            'requested_by_name',
            'assigned_to_name',
            'verified_by_name',
            'requested_at',
            'due_date',
            'entity_type',
            'entity_id',
        ]

