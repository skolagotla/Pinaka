"""Message Domain Admin Interface"""
from django.contrib import admin
from .models import Conversation, Message, MessageAttachment


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin interface for Conversation"""
    
    list_display = [
        'subject',
        'property',
        'landlord',
        'tenant',
        'status',
        'conversation_type',
        'last_message_at',
    ]
    
    list_filter = [
        'status',
        'conversation_type',
        'priority',
        'created_at',
    ]
    
    search_fields = [
        'subject',
        'property__property_name',
        'landlord__email',
        'tenant__email',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin interface for Message"""
    
    list_display = [
        'conversation',
        'sender_role',
        'is_read',
        'is_deleted',
        'created_at',
    ]
    
    list_filter = [
        'sender_role',
        'is_read',
        'is_deleted',
        'created_at',
    ]
    
    search_fields = [
        'message_text',
        'conversation__subject',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    """Admin interface for Message Attachment"""
    
    list_display = [
        'original_name',
        'message',
        'file_type',
        'file_size',
        'uploaded_at',
    ]
    
    list_filter = [
        'file_type',
        'uploaded_at',
    ]
    
    search_fields = [
        'original_name',
        'file_name',
    ]

