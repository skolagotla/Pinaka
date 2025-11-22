"""
Invitations Domain Models
Single Source of Truth for invitation system
"""
from django.db import models
import uuid


class Invitation(models.Model):
    """Invitation entity - for inviting landlords, tenants, vendors, contractors, PMCs"""
    
    # Primary identification
    email = models.EmailField()
    token = models.CharField(max_length=255, unique=True, db_index=True)
    
    # Invitation type
    invitation_type = models.CharField(
        max_length=30,
        choices=[
            ('landlord', 'Landlord'),
            ('tenant', 'Tenant'),
            ('vendor', 'Vendor'),
            ('contractor', 'Contractor'),
            ('pmc', 'Property Management Company'),
            ('admin', 'Admin'),
        ],
        db_index=True
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('sent', 'Sent'),
            ('opened', 'Opened'),
            ('completed', 'Completed'),
            ('expired', 'Expired'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending',
        db_index=True
    )
    
    # Who sent the invitation
    invited_by = models.CharField(max_length=100)  # ID of inviter
    invited_by_role = models.CharField(max_length=20)  # Role of inviter
    invited_by_name = models.CharField(max_length=255, blank=True, null=True)
    invited_by_email = models.EmailField(blank=True, null=True)
    
    invited_by_admin = models.ForeignKey(
        'rbac.Admin',
        on_delete=models.SET_NULL,
        related_name='invitations',
        null=True,
        blank=True
    )
    invited_by_landlord = models.ForeignKey(
        'landlord.Landlord',
        on_delete=models.SET_NULL,
        related_name='invitations',
        null=True,
        blank=True
    )
    invited_by_pmc = models.ForeignKey(
        'pmc.PropertyManagementCompany',
        on_delete=models.SET_NULL,
        related_name='invitations',
        null=True,
        blank=True
    )
    
    # Invitation details
    message = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True, db_index=True)
    
    # Tracking
    sent_at = models.DateTimeField(blank=True, null=True)
    opened_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    
    # Role-specific linking (only one will be set based on type)
    landlord_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    tenant_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    service_provider_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    pmc_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    # Optional property/unit linking (for tenant invitations)
    property_id = models.CharField(max_length=100, blank=True, null=True)
    unit_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Approval tracking
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    rejected_by = models.CharField(max_length=100, blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Metadata
    metadata = models.JSONField(blank=True, null=True)  # Additional context
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invitations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['token']),
            models.Index(fields=['invitation_type']),
            models.Index(fields=['status']),
            models.Index(fields=['invited_by']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Invitation'
        verbose_name_plural = 'Invitations'
    
    def __str__(self):
        return f"Invitation to {self.email} ({self.get_invitation_type_display()})"
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = uuid.uuid4().hex
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        """Check if invitation is expired"""
        if not self.expires_at:
            return False
        from django.utils import timezone
        return timezone.now() > self.expires_at

