"""Invitations Domain Serializers"""
from rest_framework import serializers
from .models import Invitation


class InvitationSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invitation
        fields = '__all__'
        read_only_fields = ['id', 'token', 'created_at', 'updated_at']


class InvitationListSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invitation
        fields = [
            'id',
            'email',
            'invitation_type',
            'status',
            'invited_by_name',
            'invited_by_role',
            'is_expired',
            'expires_at',
            'created_at',
        ]

