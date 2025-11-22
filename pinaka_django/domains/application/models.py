"""
Application Domain Models
Single Source of Truth for tenant applications
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta


class Application(models.Model):
    """Tenant Application entity"""
    
    # Property context
    unit = models.ForeignKey(
        'property.Unit',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    property = models.ForeignKey(
        'property.Property',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    
    # Applicant information
    applicant_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)  # Tenant ID if existing
    applicant_email = models.EmailField()
    applicant_name = models.CharField(max_length=255)
    applicant_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Co-applicants (stored as JSON array)
    co_applicant_ids = models.JSONField(default=list, blank=True)
    
    # Application details
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('submitted', 'Submitted'),
            ('under_review', 'Under Review'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('withdrawn', 'Withdrawn'),
        ],
        default='draft',
        db_index=True
    )
    deadline = models.DateTimeField()  # 1-week deadline from creation
    
    # Screening
    screening_requested = models.BooleanField(default=False)
    screening_requested_at = models.DateTimeField(blank=True, null=True)
    screening_provider = models.CharField(max_length=100, blank=True, null=True)
    screening_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        blank=True,
        null=True
    )
    screening_data = models.JSONField(blank=True, null=True)
    
    # Approval
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    approved_by_type = models.CharField(max_length=20, blank=True, null=True)
    approved_by_email = models.EmailField(blank=True, null=True)
    approved_by_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Rejection
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejected_by = models.CharField(max_length=100, blank=True, null=True)
    rejected_by_type = models.CharField(max_length=20, blank=True, null=True)
    rejected_by_email = models.EmailField(blank=True, null=True)
    rejected_by_name = models.CharField(max_length=255, blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Lease creation
    lease = models.ForeignKey(
        'lease.Lease',
        on_delete=models.SET_NULL,
        related_name='applications',
        null=True,
        blank=True
    )
    
    # Application data
    application_data = models.JSONField(blank=True, null=True)  # Full form data
    
    # Metadata
    metadata = models.JSONField(blank=True, null=True)
    is_archived = models.BooleanField(default=False, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'applications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['unit_id']),
            models.Index(fields=['property_id']),
            models.Index(fields=['applicant_id']),
            models.Index(fields=['status']),
            models.Index(fields=['deadline']),
            models.Index(fields=['is_archived']),
        ]
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
    
    def __str__(self):
        return f"Application by {self.applicant_name} for {self.unit.property.property_name}"
    
    def save(self, *args, **kwargs):
        # Set deadline to 1 week from creation if not set
        if not self.deadline and not self.pk:
            self.deadline = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

