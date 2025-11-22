"""
Landlord Domain Models
Single Source of Truth for Landlord data
"""
from django.db import models
from django.core.validators import EmailValidator


class Landlord(models.Model):
    """Landlord entity - property owners"""
    
    # Primary identification
    landlord_id = models.CharField(max_length=100, unique=True, db_index=True)
    
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
    country_code = models.CharField(max_length=2, blank=True, null=True)
    region_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Organization (SaaS Multi-Tenancy)
    organization_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Settings
    timezone = models.CharField(max_length=50, default='America/Toronto')
    theme = models.CharField(max_length=50, default='default')
    signature_file_name = models.CharField(max_length=255, blank=True, null=True)
    
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
    approved_by = models.CharField(max_length=100, blank=True, null=True)  # Admin ID
    approved_at = models.DateTimeField(blank=True, null=True)
    rejected_by = models.CharField(max_length=100, blank=True, null=True)  # Admin ID
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Invitation tracking
    invited_by = models.CharField(max_length=100, blank=True, null=True)  # Admin ID
    invited_at = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'landlords'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['approval_status']),
            models.Index(fields=['country_code']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Landlord'
        verbose_name_plural = 'Landlords'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        """Get landlord's full name"""
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        parts.append(self.last_name)
        return ' '.join(parts)
    
    @property
    def is_approved(self):
        """Check if landlord is approved"""
        return self.approval_status == 'APPROVED'

