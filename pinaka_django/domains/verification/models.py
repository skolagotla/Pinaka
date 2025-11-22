"""
Verifications Domain Models
Single Source of Truth for unified verification system
"""
from django.db import models


class UnifiedVerification(models.Model):
    """Unified verification entity - handles all types of verifications"""
    
    # Verification Type and Entity Reference
    verification_type = models.CharField(
        max_length=50,
        choices=[
            ('PROPERTY_OWNERSHIP', 'Property Ownership'),
            ('TENANT_DOCUMENT', 'Tenant Document'),
            ('APPLICATION', 'Application'),
            ('ENTITY_APPROVAL', 'Entity Approval'),
            ('FINANCIAL_APPROVAL', 'Financial Approval'),
            ('INSPECTION', 'Inspection'),
            ('OTHER', 'Other'),
        ],
        db_index=True
    )
    entity_type = models.CharField(max_length=100)  # Model name
    entity_id = models.CharField(max_length=100)  # ID of entity being verified
    
    # Requester/Uploader Information
    requested_by = models.CharField(max_length=100, db_index=True)
    requested_by_role = models.CharField(max_length=20)
    requested_by_email = models.EmailField()
    requested_by_name = models.CharField(max_length=255)
    
    # Verifier Information
    assigned_to = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    assigned_to_role = models.CharField(max_length=20, blank=True, null=True)
    assigned_to_email = models.EmailField(blank=True, null=True)
    assigned_to_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Verification Result
    verified_by = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    verified_by_role = models.CharField(max_length=20, blank=True, null=True)
    verified_by_email = models.EmailField(blank=True, null=True)
    verified_by_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Status and Dates
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('VERIFIED', 'Verified'),
            ('REJECTED', 'Rejected'),
            ('EXPIRED', 'Expired'),
            ('CANCELLED', 'Cancelled'),
        ],
        default='PENDING',
        db_index=True
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('normal', 'Normal'),
            ('high', 'High'),
            ('urgent', 'Urgent'),
        ],
        default='normal'
    )
    requested_at = models.DateTimeField(auto_now_add=True, db_index=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    expired_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True, db_index=True)
    
    # Content
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    verification_notes = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # File/Document Information
    file_name = models.CharField(max_length=255, blank=True, null=True)
    original_name = models.CharField(max_length=255, blank=True, null=True)
    file_url = models.URLField(max_length=500, blank=True, null=True)
    file_size = models.IntegerField(blank=True, null=True)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    metadata = models.JSONField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'unified_verifications'
        unique_together = [['verification_type', 'entity_type', 'entity_id']]
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['verification_type', 'status']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['requested_by', 'status']),
            models.Index(fields=['verified_by', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['requested_at']),
            models.Index(fields=['due_date']),
        ]
        verbose_name = 'Unified Verification'
        verbose_name_plural = 'Unified Verifications'
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class UnifiedVerificationHistory(models.Model):
    """Verification history/audit trail"""
    
    verification = models.ForeignKey(
        UnifiedVerification,
        on_delete=models.CASCADE,
        related_name='history'
    )
    
    action = models.CharField(
        max_length=20,
        choices=[
            ('created', 'Created'),
            ('assigned', 'Assigned'),
            ('verified', 'Verified'),
            ('rejected', 'Rejected'),
            ('expired', 'Expired'),
            ('cancelled', 'Cancelled'),
            ('updated', 'Updated'),
        ],
        db_index=True
    )
    performed_by = models.CharField(max_length=100, db_index=True)
    performed_by_role = models.CharField(max_length=20)
    performed_by_email = models.EmailField()
    performed_by_name = models.CharField(max_length=255)
    
    previous_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'unified_verification_history'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['verification_id']),
            models.Index(fields=['action']),
            models.Index(fields=['created_at']),
            models.Index(fields=['performed_by']),
        ]
        verbose_name = 'Verification History'
        verbose_name_plural = 'Verification History'
    
    def __str__(self):
        return f"{self.action} on {self.verification.title} by {self.performed_by_name}"

