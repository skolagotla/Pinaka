"""
Property Management Company (PMC) Domain Models
"""
from django.db import models
from django.core.validators import EmailValidator


class PropertyManagementCompany(models.Model):
    """Property Management Company entity"""
    
    # Primary identification
    company_id = models.CharField(max_length=100, unique=True, db_index=True)
    company_name = models.CharField(max_length=255)
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
    
    # Commission structure
    default_commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Default commission rate percentage"
    )
    commission_structure = models.JSONField(
        blank=True,
        null=True,
        help_text="Flexible commission structure configuration"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
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
        db_table = 'property_management_companies'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['company_id']),
            models.Index(fields=['approval_status']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Property Management Company'
        verbose_name_plural = 'Property Management Companies'
    
    def __str__(self):
        return f"{self.company_name} ({self.email})"
    
    @property
    def is_approved(self):
        """Check if PMC is approved"""
        return self.approval_status == 'APPROVED'

