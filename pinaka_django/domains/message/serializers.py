"""Message Domain Serializers"""
from rest_framework import serializers
from .models import Conversation, Message, MessageAttachment


class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_at']


class MessageSerializer(serializers.ModelSerializer):
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    sender_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_sender_id(self, obj):
        """Get sender ID from sender_tenant, sender_landlord, or sender_pmc"""
        if obj.sender_tenant:
            return str(obj.sender_tenant.id)
        elif obj.sender_landlord:
            return str(obj.sender_landlord.id)
        elif obj.sender_pmc:
            return str(obj.sender_pmc.id)
        return obj.sender_id or ''


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    property_name = serializers.CharField(source='property.property_name', read_only=True)
    landlord_name = serializers.CharField(source='landlord.full_name', read_only=True)
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    
    class Meta:
        model = Conversation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ConversationListSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.property_name', read_only=True)
    landlord_name = serializers.CharField(source='landlord.full_name', read_only=True)
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id',
            'subject',
            'property_name',
            'landlord_name',
            'tenant_name',
            'status',
            'conversation_type',
            'last_message_at',
            'last_message',
            'unread_count',
            'created_at',
        ]
    
    def get_unread_count(self, obj):
        """Get count of unread messages"""
        return obj.messages.filter(is_read=False).count()
    
    def get_last_message(self, obj):
        """Get last message content"""
        last_msg = obj.messages.filter(is_deleted=False).order_by('-created_at').first()
        return last_msg.content[:100] if last_msg else None

