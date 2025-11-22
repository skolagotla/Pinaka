"""
Tenant Domain Models
Single Source of Truth for Tenant data
"""
from django.db import models
from django.core.validators import EmailValidator


class Tenant(models.Model):
    """Tenant entity - represents renters/occupants"""
    
    # Primary identification
    tenant_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Personal information
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Address information
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    province_state = models.CharField(max_length=100, blank=True, null=True)
    postal_zip = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=200, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, null=True)
    
    # Employment information
    employer_name = models.CharField(max_length=200, blank=True, null=True)
    employer_phone = models.CharField(max_length=20, blank=True, null=True)
    employer_address = models.CharField(max_length=255, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
    # Tenant status
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('INACTIVE', 'Inactive'),
            ('PENDING', 'Pending'),
            ('EVICTED', 'Evicted'),
        ],
        default='PENDING'
    )
    
    # Approval workflow
    approval_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
        ],
        default='PENDING'
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Signature
    signature_file_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenants'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['approval_status']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        """Get tenant's full name"""
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        parts.append(self.last_name)
        return ' '.join(parts)
    
    @property
    def is_active(self):
        """Check if tenant is active"""
        return self.status == 'ACTIVE'


class TenantInvitation(models.Model):
    """Tenant invitation tracking"""
    
    # Identification
    email = models.EmailField(validators=[EmailValidator()])
    
    # Invitation details
    unit = models.ForeignKey('property.Unit', on_delete=models.CASCADE, related_name='tenant_invitations')
    invited_by_landlord_id = models.CharField(max_length=50)  # Reference to landlord
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('ACCEPTED', 'Accepted'),
            ('REJECTED', 'Rejected'),
            ('EXPIRED', 'Expired'),
        ],
        default='PENDING'
    )
    
    token = models.CharField(max_length=255, unique=True, db_index=True)
    expires_at = models.DateTimeField()
    
    # Metadata
    sent_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'tenant_invitations'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['token']),
            models.Index(fields=['expires_at']),
        ]
        verbose_name = 'Tenant Invitation'
        verbose_name_plural = 'Tenant Invitations'
    
    def __str__(self):
        return f"Invitation to {self.email} for Unit {self.unit}"
    
    @property
    def is_expired(self):
        """Check if invitation has expired"""
        from django.utils import timezone
        return timezone.now() > self.expires_at
