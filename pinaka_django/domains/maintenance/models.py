"""
Maintenance Domain Models
Single Source of Truth for Maintenance Request data
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class MaintenanceRequest(models.Model):
    """Maintenance/repair request tracking"""
    
    # Primary identification
    request_id = models.CharField(max_length=50, unique=True, db_index=True)
    ticket_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    # Relationships
    property = models.ForeignKey('property.Property', on_delete=models.CASCADE, related_name='maintenance_requests')
    tenant = models.ForeignKey('tenant.Tenant', on_delete=models.CASCADE, related_name='maintenance_requests')
    
    # Request details
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    category = models.CharField(
        max_length=50,
        choices=[
            ('PLUMBING', 'Plumbing'),
            ('ELECTRICAL', 'Electrical'),
            ('HVAC', 'HVAC/Heating/Cooling'),
            ('APPLIANCE', 'Appliance'),
            ('STRUCTURAL', 'Structural'),
            ('PEST_CONTROL', 'Pest Control'),
            ('CLEANING', 'Cleaning'),
            ('LANDSCAPING', 'Landscaping'),
            ('PAINTING', 'Painting'),
            ('SECURITY', 'Security'),
            ('OTHER', 'Other'),
        ]
    )
    
    priority = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High'),
            ('URGENT', 'Urgent/Emergency'),
        ],
        default='MEDIUM'
    )
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('NEW', 'New'),
            ('ASSIGNED', 'Assigned'),
            ('IN_PROGRESS', 'In Progress'),
            ('ON_HOLD', 'On Hold'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled'),
        ],
        default='NEW'
    )
    
    # Initiation
    initiated_by = models.CharField(
        max_length=20,
        choices=[
            ('TENANT', 'Tenant'),
            ('LANDLORD', 'Landlord'),
            ('PMC', 'Property Management Company'),
        ],
        default='TENANT'
    )
    
    # Dates
    requested_date = models.DateTimeField(auto_now_add=True)
    scheduled_date = models.DateTimeField(blank=True, null=True)
    completed_date = models.DateTimeField(blank=True, null=True)
    
    # Assignment
    assigned_to_vendor_id = models.CharField(max_length=50, blank=True, null=True)  # Legacy field
    assigned_to_provider_id = models.CharField(max_length=50, blank=True, null=True)  # Service provider
    
    # Financial
    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)]
    )
    actual_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)]
    )
    
    # Approval workflow
    tenant_approved = models.BooleanField(default=False)
    landlord_approved = models.BooleanField(default=False)
    
    # PMC tracking
    created_by_pmc = models.BooleanField(default=False)
    pmc_id = models.CharField(max_length=50, blank=True, null=True)
    
    # Photos/Documentation
    photos = models.JSONField(blank=True, null=True)  # Array of photo URLs
    before_photos = models.JSONField(blank=True, null=True)
    after_photos = models.JSONField(blank=True, null=True)
    
    # Completion details
    completion_notes = models.TextField(blank=True, null=True)
    
    # Feedback
    rating = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    tenant_feedback = models.TextField(blank=True, null=True)
    
    # View tracking
    last_viewed_by_landlord = models.DateTimeField(blank=True, null=True)
    last_viewed_by_tenant = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'maintenance_requests'
        ordering = ['-requested_date']
        indexes = [
            models.Index(fields=['property']),
            models.Index(fields=['tenant']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['category']),
            models.Index(fields=['requested_date']),
            models.Index(fields=['ticket_number']),
        ]
        verbose_name = 'Maintenance Request'
        verbose_name_plural = 'Maintenance Requests'
    
    def __str__(self):
        ticket = f"[{self.ticket_number}] " if self.ticket_number else ""
        return f"{ticket}{self.title}"


class MaintenanceComment(models.Model):
    """Comments on maintenance requests"""
    
    # Primary identification
    comment_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Relationship
    maintenance_request = models.ForeignKey(
        MaintenanceRequest,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    
    # Author information
    author_email = models.EmailField()
    author_name = models.CharField(max_length=200)
    author_role = models.CharField(
        max_length=20,
        choices=[
            ('TENANT', 'Tenant'),
            ('LANDLORD', 'Landlord'),
            ('VENDOR', 'Vendor'),
            ('PMC', 'Property Management'),
        ]
    )
    
    # Comment content
    comment = models.TextField()
    
    # Status update tracking
    is_status_update = models.BooleanField(default=False)
    old_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'maintenance_comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['maintenance_request']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Maintenance Comment'
        verbose_name_plural = 'Maintenance Comments'
    
    def __str__(self):
        return f"Comment by {self.author_name} on {self.maintenance_request}"

