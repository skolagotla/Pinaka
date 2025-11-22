"""
Activity Log Domain Models
Single Source of Truth for activity tracking
"""
from django.db import models
from django.utils import timezone


class ActivityLog(models.Model):
    """Activity Log entity - tracks all user actions"""
    
    # User information
    user_id = models.CharField(max_length=100, db_index=True)
    user_email = models.EmailField(db_index=True)
    user_name = models.CharField(max_length=255)
    user_role = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Admin'),
            ('landlord', 'Landlord'),
            ('pmc', 'PMC'),
            ('tenant', 'Tenant'),
            ('vendor', 'Vendor'),
            ('contractor', 'Contractor'),
        ],
        db_index=True
    )
    user_type = models.CharField(max_length=50, blank=True, null=True)  # More specific role
    
    # Action information
    action = models.CharField(max_length=50, db_index=True)  # create, update, delete, view, approve, etc.
    entity_type = models.CharField(max_length=50)  # property, tenant, maintenance, etc.
    entity_id = models.CharField(max_length=100)
    entity_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Description and metadata
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)  # Additional context
    
    # Context FKs for better querying
    property_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    landlord_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    tenant_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    pmc_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    vendor_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    contractor_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    # Request/Approval context
    approval_request_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Conversation context
    conversation_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Request metadata
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['user_role']),
            models.Index(fields=['action']),
            models.Index(fields=['entity_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['property_id']),
            models.Index(fields=['landlord_id']),
            models.Index(fields=['tenant_id']),
        ]
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
    
    def __str__(self):
        return f"{self.user_name} {self.action} {self.entity_type} {self.entity_id}"


class UserActivity(models.Model):
    """User Activity entity - simpler tracking for landlords/tenants"""
    
    user_id = models.CharField(max_length=100, db_index=True)
    user_email = models.EmailField(db_index=True)
    user_name = models.CharField(max_length=255)
    user_role = models.CharField(
        max_length=20,
        choices=[
            ('landlord', 'Landlord'),
            ('tenant', 'Tenant'),
        ],
        db_index=True
    )
    
    action = models.CharField(max_length=50, db_index=True)
    resource = models.CharField(max_length=100, blank=True, null=True)
    resource_id = models.CharField(max_length=100, blank=True, null=True)
    
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    details = models.JSONField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'user_activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['user_role']),
            models.Index(fields=['action']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user_email']),
        ]
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
    
    def __str__(self):
        return f"{self.user_name} {self.action} {self.resource}"

