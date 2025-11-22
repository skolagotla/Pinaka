"""
Document/Library Domain Models
Single Source of Truth for Document management
"""
from django.db import models
from django.core.validators import FileExtensionValidator


class Document(models.Model):
    """Document entity - tenant documents, lease documents, etc."""
    
    # Primary identification
    tenant = models.ForeignKey(
        'tenant.Tenant',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    property = models.ForeignKey(
        'property.Property',
        on_delete=models.SET_NULL,
        related_name='documents',
        null=True,
        blank=True
    )
    
    # File information
    file_name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField()  # Size in bytes
    storage_path = models.CharField(max_length=500)
    
    # Document metadata
    category = models.CharField(max_length=100, db_index=True)
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(default='')
    tags = models.JSONField(default=list, blank=True)
    metadata = models.TextField(blank=True, null=True)
    
    # Upload tracking
    uploaded_by = models.CharField(max_length=100)
    uploaded_by_email = models.EmailField()
    uploaded_by_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Permissions
    can_landlord_delete = models.BooleanField(default=True)
    can_tenant_delete = models.BooleanField(default=True)
    visibility = models.CharField(
        max_length=20,
        choices=[
            ('shared', 'Shared'),
            ('private', 'Private'),
            ('public', 'Public'),
        ],
        default='shared'
    )
    
    # Verification
    is_verified = models.BooleanField(default=False, db_index=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    verified_by = models.CharField(max_length=100, blank=True, null=True)
    verified_by_name = models.CharField(max_length=255, blank=True, null=True)
    verified_by_role = models.CharField(max_length=50, blank=True, null=True)
    verification_comment = models.TextField(blank=True, null=True)
    
    # Rejection
    is_rejected = models.BooleanField(default=False)
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejected_by = models.CharField(max_length=100, blank=True, null=True)
    rejected_by_name = models.CharField(max_length=255, blank=True, null=True)
    rejected_by_role = models.CharField(max_length=50, blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Expiration
    expiration_date = models.DateTimeField(blank=True, null=True, db_index=True)
    is_required = models.BooleanField(default=False, db_index=True)
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Deletion
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    deleted_by = models.CharField(max_length=100, blank=True, null=True)
    deleted_by_email = models.EmailField(blank=True, null=True)
    deleted_by_name = models.CharField(max_length=255, blank=True, null=True)
    deletion_reason = models.TextField(blank=True, null=True)
    
    # Security
    document_hash = models.CharField(max_length=255, unique=True, blank=True, null=True)
    
    class Meta:
        db_table = 'documents'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['expiration_date']),
            models.Index(fields=['is_deleted']),
            models.Index(fields=['is_required']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['tenant_id']),
            models.Index(fields=['tenant_id', 'is_deleted']),
            models.Index(fields=['uploaded_at']),
            models.Index(fields=['tenant_id', 'category']),
            models.Index(fields=['property_id']),
            models.Index(fields=['property_id', 'is_deleted']),
        ]
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
    
    def __str__(self):
        return f"{self.original_name} ({self.category})"
    
    def get_file_size_mb(self):
        """Get file size in MB"""
        return round(self.file_size / (1024 * 1024), 2)
    
    def get_is_expired(self):
        """Check if document is expired"""
        if not self.expiration_date:
            return False
        from django.utils import timezone
        return timezone.now() > self.expiration_date


class DocumentAuditLog(models.Model):
    """Audit log for document actions"""
    
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    
    action = models.CharField(max_length=100, db_index=True)
    performed_by = models.CharField(max_length=100)
    performed_by_email = models.EmailField()
    performed_by_name = models.CharField(max_length=255)
    
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'document_audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action']),
            models.Index(fields=['document_id']),
        ]
        verbose_name = 'Document Audit Log'
        verbose_name_plural = 'Document Audit Logs'
    
    def __str__(self):
        return f"{self.action} on {self.document.original_name} by {self.performed_by_name}"


class DocumentMessage(models.Model):
    """Messages/comments on documents"""
    
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    
    message = models.TextField()
    sender_role = models.CharField(max_length=50, db_index=True)
    sender_email = models.EmailField()
    sender_name = models.CharField(max_length=255)
    
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'document_messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document_id']),
            models.Index(fields=['document_id', 'is_read']),
            models.Index(fields=['is_read']),
            models.Index(fields=['sender_role']),
        ]
        verbose_name = 'Document Message'
        verbose_name_plural = 'Document Messages'
    
    def __str__(self):
        return f"Message from {self.sender_name} on {self.document.original_name}"

