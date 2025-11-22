"""
Notifications Domain Models
Single Source of Truth for notifications
"""
from django.db import models


class Notification(models.Model):
    """Notification entity"""
    
    # User identification
    user_id = models.CharField(max_length=100, db_index=True)
    user_role = models.CharField(
        max_length=20,
        choices=[
            ('landlord', 'Landlord'),
            ('tenant', 'Tenant'),
            ('pmc', 'Property Management Company'),
            ('admin', 'Admin'),
        ],
        db_index=True
    )
    user_email = models.EmailField()
    
    # Notification details
    notification_type = models.CharField(
        max_length=50,
        choices=[
            ('rent_due', 'Rent Due'),
            ('rent_overdue', 'Rent Overdue'),
            ('maintenance_update', 'Maintenance Update'),
            ('approval_request', 'Approval Request'),
            ('document_expiring', 'Document Expiring'),
            ('lease_renewal', 'Lease Renewal'),
            ('payment_received', 'Payment Received'),
            ('message_received', 'Message Received'),
            ('ticket_update', 'Ticket Update'),
            ('verification_status', 'Verification Status'),
            ('other', 'Other'),
        ],
        db_index=True
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
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
    
    # Entity context
    entity_type = models.CharField(max_length=50, blank=True, null=True)
    entity_id = models.CharField(max_length=100, blank=True, null=True)
    verification_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Status tracking
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(blank=True, null=True)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(blank=True, null=True)
    
    # Delivery channels
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(blank=True, null=True)
    sms_sent = models.BooleanField(default=False)
    sms_sent_at = models.DateTimeField(blank=True, null=True)
    push_sent = models.BooleanField(default=False)
    push_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', 'user_role']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['entity_type', 'entity_id']),
        ]
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
    
    def __str__(self):
        return f"{self.title} for {self.user_email}"


class NotificationPreference(models.Model):
    """User notification preferences"""
    
    user_id = models.CharField(max_length=100, db_index=True)
    user_role = models.CharField(
        max_length=20,
        choices=[
            ('landlord', 'Landlord'),
            ('tenant', 'Tenant'),
            ('pmc', 'Property Management Company'),
            ('admin', 'Admin'),
        ],
        db_index=True
    )
    user_email = models.EmailField()
    
    # Notification type
    notification_type = models.CharField(max_length=50)
    
    # Channel preferences
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=True)
    
    # Timing preferences
    send_before_days = models.IntegerField(blank=True, null=True)
    send_on_day = models.BooleanField(default=True)
    send_after_days = models.IntegerField(blank=True, null=True)
    
    # Quiet hours
    quiet_hours_start = models.CharField(max_length=5, blank=True, null=True)  # e.g., "22:00"
    quiet_hours_end = models.CharField(max_length=5, blank=True, null=True)  # e.g., "08:00"
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        unique_together = [['user_id', 'user_role', 'notification_type']]
        indexes = [
            models.Index(fields=['user_id', 'user_role']),
            models.Index(fields=['notification_type']),
        ]
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"{self.notification_type} preferences for {self.user_email}"

