"""
Service Providers Domain Models
Single Source of Truth for vendors and contractors
"""
from django.db import models


class ServiceProvider(models.Model):
    """Unified Service Provider entity - consolidates Vendor and Contractor"""
    
    # Primary identification
    provider_id = models.CharField(max_length=100, unique=True, db_index=True)
    provider_type = models.CharField(
        max_length=20,
        choices=[
            ('vendor', 'Vendor'),
            ('contractor', 'Contractor'),
        ],
        db_index=True
    )
    
    # Company/Individual Information
    company_name = models.CharField(max_length=255, blank=True, null=True)
    contact_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    province_state = models.CharField(max_length=100, blank=True, null=True)
    postal_zip = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    country_code = models.CharField(max_length=2, blank=True, null=True)
    region_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Business Information
    tax_id = models.CharField(max_length=50, blank=True, null=True)
    license_number = models.CharField(max_length=100, blank=True, null=True)
    insurance_info = models.TextField(blank=True, null=True)
    
    # Services
    services = models.JSONField(
        default=list,
        blank=True,
        help_text="List of services provided"
    )
    specialties = models.JSONField(
        default=list,
        blank=True,
        help_text="Specialty areas"
    )
    
    # Status
    is_active = models.BooleanField(default=True, db_index=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(blank=True, null=True)
    verified_by = models.CharField(max_length=100, blank=True, null=True)
    
    # Approval workflow
    approval_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
        ],
        default='PENDING',
        db_index=True
    )
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    rejected_by = models.CharField(max_length=100, blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Invitation tracking
    invited_by = models.CharField(max_length=100, blank=True, null=True)
    invited_by_role = models.CharField(max_length=20, blank=True, null=True)
    invited_at = models.DateTimeField(blank=True, null=True)
    
    # Ratings
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Average rating (1-5)"
    )
    total_ratings = models.IntegerField(default=0)
    
    # Metadata
    notes = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'service_providers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['provider_id']),
            models.Index(fields=['provider_type']),
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['approval_status']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Service Provider'
        verbose_name_plural = 'Service Providers'
    
    def __str__(self):
        name = self.company_name or self.contact_name
        return f"{name} ({self.get_provider_type_display()})"
    
    @property
    def is_approved(self):
        """Check if service provider is approved"""
        return self.approval_status == 'APPROVED'


class ServiceProviderRating(models.Model):
    """Rating for service providers"""
    
    service_provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    
    # Rating details
    rated_by = models.CharField(max_length=100)  # User ID
    rated_by_type = models.CharField(max_length=20)  # 'tenant', 'landlord', 'pmc'
    rated_by_email = models.EmailField()
    rated_by_name = models.CharField(max_length=255)
    
    # Rating context
    work_order_id = models.CharField(max_length=100, blank=True, null=True)
    maintenance_request_id = models.CharField(max_length=100, blank=True, null=True)
    property_id = models.CharField(max_length=100, blank=True, null=True)
    unit_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Rating scores (1-5)
    quality = models.IntegerField()  # Quality of work
    timeliness = models.IntegerField()  # Timeliness
    communication = models.IntegerField()  # Communication
    professionalism = models.IntegerField()  # Professionalism
    
    # Overall rating (calculated average)
    overall_rating = models.DecimalField(max_digits=3, decimal_places=2)
    
    # Review
    review_text = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'service_provider_ratings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['service_provider_id']),
            models.Index(fields=['rated_by']),
            models.Index(fields=['rated_by_type']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Service Provider Rating'
        verbose_name_plural = 'Service Provider Ratings'
    
    def __str__(self):
        return f"Rating {self.overall_rating}/5 for {self.service_provider}"
    
    def save(self, *args, **kwargs):
        # Calculate overall rating as average
        self.overall_rating = (
            self.quality + self.timeliness + self.communication + self.professionalism
        ) / 4.0
        super().save(*args, **kwargs)

