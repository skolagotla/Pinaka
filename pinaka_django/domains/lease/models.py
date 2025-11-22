"""
Lease Domain Models
Single Source of Truth for Lease/Rental Agreement data
"""
from django.db import models
from django.core.validators import MinValueValidator


class Lease(models.Model):
    """Lease/Rental Agreement entity"""
    
    # Primary identification
    lease_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Lease relationship
    unit = models.ForeignKey('property.Unit', on_delete=models.CASCADE, related_name='leases')
    
    # Lease period
    lease_start = models.DateField()
    lease_end = models.DateField(blank=True, null=True)  # Null for month-to-month
    
    # Financial terms
    rent_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    rent_due_day = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    security_deposit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)]
    )
    
    # Payment details
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('EXPIRED', 'Expired'),
            ('TERMINATED', 'Terminated'),
            ('PENDING', 'Pending'),
        ],
        default='ACTIVE'
    )
    
    # Renewal tracking
    renewal_reminder_sent = models.BooleanField(default=False)
    renewal_reminder_sent_at = models.DateTimeField(blank=True, null=True)
    renewal_decision = models.CharField(
        max_length=20,
        choices=[
            ('RENEW', 'Renew'),
            ('TERMINATE', 'Terminate'),
            ('MONTH_TO_MONTH', 'Month to Month'),
        ],
        blank=True,
        null=True
    )
    renewal_decision_at = models.DateTimeField(blank=True, null=True)
    renewal_decision_by = models.CharField(max_length=50, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'leases'
        ordering = ['-lease_start']
        indexes = [
            models.Index(fields=['unit']),
            models.Index(fields=['status']),
            models.Index(fields=['lease_end']),
            models.Index(fields=['renewal_reminder_sent']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Lease'
        verbose_name_plural = 'Leases'
    
    def __str__(self):
        return f"Lease for {self.unit} ({self.lease_start} - {self.lease_end or 'Month-to-Month'})"
    
    @property
    def is_active(self):
        """Check if lease is currently active"""
        return self.status == 'ACTIVE'
    
    @property
    def is_expired(self):
        """Check if lease has expired"""
        if not self.lease_end:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.lease_end


class LeaseTenant(models.Model):
    """Many-to-Many relationship between Leases and Tenants"""
    
    lease = models.ForeignKey('Lease', on_delete=models.CASCADE, related_name='lease_tenants')
    tenant = models.ForeignKey('tenant.Tenant', on_delete=models.CASCADE, related_name='tenant_leases')
    
    is_primary_tenant = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lease_tenants'
        unique_together = [('lease', 'tenant')]
        indexes = [
            models.Index(fields=['tenant']),
            models.Index(fields=['lease']),
        ]
        verbose_name = 'Lease-Tenant Relationship'
        verbose_name_plural = 'Lease-Tenant Relationships'
    
    def __str__(self):
        primary = "Primary " if self.is_primary_tenant else ""
        return f"{primary}Tenant {self.tenant} on {self.lease}"


class LeaseDocument(models.Model):
    """Documents associated with a lease"""
    
    # Identification
    document_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Relationship
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='documents')
    
    # File information
    file_name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField()  # Size in bytes
    storage_path = models.CharField(max_length=500)
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lease_documents'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['lease']),
            models.Index(fields=['uploaded_at']),
        ]
        verbose_name = 'Lease Document'
        verbose_name_plural = 'Lease Documents'
    
    def __str__(self):
        return f"{self.original_name} for {self.lease}"


class LeaseTermination(models.Model):
    """Lease termination tracking"""
    
    # Identification
    termination_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Relationship
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='terminations')
    
    # Termination details
    initiated_by = models.CharField(max_length=50)  # User ID who initiated
    reason = models.TextField()
    termination_date = models.DateField()
    
    # Financial
    actual_loss = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)]
    )
    
    # Form type (Ontario specific)
    form_type = models.CharField(
        max_length=10,
        choices=[
            ('N11', 'N11 - Agreement to End Tenancy'),
            ('N9', 'N9 - Tenant Notice to End Tenancy'),
            ('N15', 'N15 - Termination for Persistent Late Rent'),
        ]
    )
    
    # Status workflow
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
            ('COMPLETED', 'Completed'),
        ],
        default='PENDING'
    )
    
    # Approval tracking
    approved_by = models.CharField(max_length=50, blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    rejected_by = models.CharField(max_length=50, blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lease_terminations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lease']),
            models.Index(fields=['status']),
            models.Index(fields=['termination_date']),
        ]
        verbose_name = 'Lease Termination'
        verbose_name_plural = 'Lease Terminations'
    
    def __str__(self):
        return f"Termination of {self.lease} ({self.form_type})"
