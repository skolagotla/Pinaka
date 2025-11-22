"""
Messages/Conversations Domain Models
Single Source of Truth for messaging system
"""
from django.db import models


class Conversation(models.Model):
    """Conversation entity - messaging threads between landlord, tenant, PMC"""
    
    # Required Property Context
    property = models.ForeignKey(
        'property.Property',
        on_delete=models.CASCADE,
        related_name='conversations'
    )
    
    # Explicit Primary Participants (Required)
    landlord = models.ForeignKey(
        'landlord.Landlord',
        on_delete=models.CASCADE,
        related_name='conversations'
    )
    tenant = models.ForeignKey(
        'tenant.Tenant',
        on_delete=models.CASCADE,
        related_name='conversations'
    )
    
    # PMC Support (optional)
    pmc = models.ForeignKey(
        'pmc.PropertyManagementCompany',
        on_delete=models.SET_NULL,
        related_name='conversations',
        null=True,
        blank=True
    )
    
    # Conversation Metadata
    subject = models.CharField(max_length=255)
    conversation_type = models.CharField(
        max_length=30,
        choices=[
            ('LANDLORD_TENANT', 'Landlord-Tenant'),
            ('LANDLORD_PMC', 'Landlord-PMC'),
            ('TENANT_PMC', 'Tenant-PMC'),
            ('LANDLORD_TENANT_PMC', 'Landlord-Tenant-PMC'),
        ],
        default='LANDLORD_TENANT'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('ARCHIVED', 'Archived'),
            ('CLOSED', 'Closed'),
        ],
        default='ACTIVE',
        db_index=True
    )
    
    # Flexible Linking
    linked_entity_type = models.CharField(max_length=50, blank=True, null=True)
    linked_entity_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Tracking
    created_by = models.CharField(max_length=100)
    created_by_landlord = models.ForeignKey(
        'landlord.Landlord',
        on_delete=models.SET_NULL,
        related_name='created_conversations',
        null=True,
        blank=True
    )
    created_by_tenant = models.ForeignKey(
        'tenant.Tenant',
        on_delete=models.SET_NULL,
        related_name='created_conversations',
        null=True,
        blank=True
    )
    created_by_pmc = models.ForeignKey(
        'pmc.PropertyManagementCompany',
        on_delete=models.SET_NULL,
        related_name='created_conversations',
        null=True,
        blank=True
    )
    
    # Activity Tracking
    last_message_at = models.DateTimeField(blank=True, null=True, db_index=True)
    last_message = models.ForeignKey(
        'Message',
        on_delete=models.SET_NULL,
        related_name='+',
        null=True,
        blank=True
    )
    
    # Read Tracking (per primary participant)
    landlord_last_read_at = models.DateTimeField(blank=True, null=True)
    tenant_last_read_at = models.DateTimeField(blank=True, null=True)
    pmc_last_read_at = models.DateTimeField(blank=True, null=True)
    
    # Notification Settings
    notify_landlord = models.BooleanField(default=True)
    notify_tenant = models.BooleanField(default=True)
    notify_pmc = models.BooleanField(default=False)
    
    # Metadata
    metadata = models.JSONField(blank=True, null=True)
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('normal', 'Normal'),
            ('high', 'High'),
            ('urgent', 'Urgent'),
        ],
        blank=True,
        null=True
    )
    tags = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        db_table = 'conversations'
        ordering = ['-last_message_at', '-updated_at']
        indexes = [
            models.Index(fields=['property_id']),
            models.Index(fields=['landlord_id']),
            models.Index(fields=['tenant_id']),
            models.Index(fields=['pmc_id']),
            models.Index(fields=['status']),
            models.Index(fields=['conversation_type']),
            models.Index(fields=['created_by']),
            models.Index(fields=['last_message_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['property_id', 'landlord_id', 'tenant_id']),
        ]
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
    
    def __str__(self):
        return f"{self.subject} ({self.property.property_name})"


class Message(models.Model):
    """Message entity - individual messages in conversations"""
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    
    # Sender Tracking
    sender_id = models.CharField(max_length=100)  # Keep for backward compat
    sender_landlord = models.ForeignKey(
        'landlord.Landlord',
        on_delete=models.SET_NULL,
        related_name='messages',
        null=True,
        blank=True
    )
    sender_tenant = models.ForeignKey(
        'tenant.Tenant',
        on_delete=models.SET_NULL,
        related_name='messages',
        null=True,
        blank=True
    )
    sender_pmc = models.ForeignKey(
        'pmc.PropertyManagementCompany',
        on_delete=models.SET_NULL,
        related_name='messages',
        null=True,
        blank=True
    )
    sender_role = models.CharField(max_length=20)  # 'landlord', 'tenant', 'pmc'
    
    # Message Content
    message_text = models.TextField()
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(blank=True, null=True)
    
    # Read Tracking
    is_read = models.BooleanField(default=False, db_index=True)
    read_by_landlord = models.BooleanField(default=False)
    read_by_tenant = models.BooleanField(default=False)
    read_by_pmc = models.BooleanField(default=False)
    read_at_landlord = models.DateTimeField(blank=True, null=True)
    read_at_tenant = models.DateTimeField(blank=True, null=True)
    read_at_pmc = models.DateTimeField(blank=True, null=True)
    
    # Status
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    deleted_by = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation_id']),
            models.Index(fields=['sender_role']),
            models.Index(fields=['is_read']),
            models.Index(fields=['is_deleted']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
    
    def __str__(self):
        return f"Message from {self.sender_role} in {self.conversation.subject}"


class MessageAttachment(models.Model):
    """Message attachment entity"""
    
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    
    file_name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField()
    storage_path = models.CharField(max_length=500)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'message_attachments'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['message_id']),
            models.Index(fields=['uploaded_at']),
        ]
        verbose_name = 'Message Attachment'
        verbose_name_plural = 'Message Attachments'
    
    def __str__(self):
        return f"{self.original_name} attached to message {self.message.id}"

