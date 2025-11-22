"""Support Tickets Domain Serializers"""
from rest_framework import serializers
from .models import SupportTicket, TicketNote, TicketAttachment


class TicketAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketAttachment
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_at']


class TicketNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketNote
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    notes = TicketNoteSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    property_name = serializers.CharField(source='property.property_name', read_only=True, allow_null=True)
    
    class Meta:
        model = SupportTicket
        fields = '__all__'
        read_only_fields = ['id', 'ticket_number', 'created_at', 'updated_at']


class SupportTicketListSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.property_name', read_only=True, allow_null=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'ticket_number',
            'subject',
            'status',
            'priority',
            'created_by_name',
            'assigned_to_name',
            'property_name',
            'created_at',
        ]

