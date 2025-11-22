"""
Support Tickets Domain Models
Single Source of Truth for customer support
"""
from django.db import models
import uuid


class SupportTicket(models.Model):
    """Support Ticket entity"""
    
    # Primary identification
    ticket_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Ticket details
    subject = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High'),
            ('URGENT', 'Urgent'),
        ],
        default='MEDIUM',
        db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('OPEN', 'Open'),
            ('IN_PROGRESS', 'In Progress'),
            ('RESOLVED', 'Resolved'),
            ('CLOSED', 'Closed'),
        ],
        default='OPEN',
        db_index=True
    )
    
    # Property context
    property = models.ForeignKey(
        'property.Property',
        on_delete=models.SET_NULL,
        related_name='support_tickets',
        null=True,
        blank=True
    )
    
    # Creator tracking
    created_by = models.CharField(max_length=100, db_index=True)
    created_by_email = models.EmailField()
    created_by_name = models.CharField(max_length=255)
    created_by_role = models.CharField(max_length=20)  # 'landlord', 'tenant', 'pmc'
    
    created_by_landlord = models.ForeignKey(
        'landlord.Landlord',
        on_delete=models.SET_NULL,
        related_name='support_tickets',
        null=True,
        blank=True
    )
    created_by_tenant = models.ForeignKey(
        'tenant.Tenant',
        on_delete=models.SET_NULL,
        related_name='support_tickets',
        null=True,
        blank=True
    )
    
    # Assignment
    assigned_to = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    assigned_to_email = models.EmailField(blank=True, null=True)
    assigned_to_name = models.CharField(max_length=255, blank=True, null=True)
    
    assigned_to_admin = models.ForeignKey(
        'rbac.Admin',
        on_delete=models.SET_NULL,
        related_name='assigned_support_tickets',
        null=True,
        blank=True
    )
    assigned_to_landlord = models.ForeignKey(
        'landlord.Landlord',
        on_delete=models.SET_NULL,
        related_name='assigned_support_tickets',
        null=True,
        blank=True
    )
    assigned_to_pmc = models.ForeignKey(
        'pmc.PropertyManagementCompany',
        on_delete=models.SET_NULL,
        related_name='assigned_support_tickets',
        null=True,
        blank=True
    )
    
    # Related entities
    contractor_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    vendor_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    service_provider_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    # Resolution
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolved_by = models.CharField(max_length=100, blank=True, null=True)
    resolution = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'support_tickets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['created_by']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['property_id']),
            models.Index(fields=['created_by_landlord_id']),
            models.Index(fields=['created_by_tenant_id']),
            models.Index(fields=['assigned_to_admin_id']),
            models.Index(fields=['assigned_to_landlord_id']),
            models.Index(fields=['assigned_to_pmc_id']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Support Ticket'
        verbose_name_plural = 'Support Tickets'
    
    def __str__(self):
        return f"{self.ticket_number}: {self.subject}"
    
    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f"TICKET-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class TicketNote(models.Model):
    """Notes/comments on support tickets"""
    
    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    
    content = models.TextField()
    created_by = models.CharField(max_length=100)
    created_by_email = models.EmailField()
    created_by_name = models.CharField(max_length=255)
    created_by_role = models.CharField(max_length=20)
    
    is_internal = models.BooleanField(default=False)  # Internal notes not visible to customer
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ticket_notes'
        ordering = ['created_at']
        verbose_name = 'Ticket Note'
        verbose_name_plural = 'Ticket Notes'
    
    def __str__(self):
        return f"Note on {self.ticket.ticket_number} by {self.created_by_name}"


class TicketAttachment(models.Model):
    """Attachments on support tickets"""
    
    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    
    file_name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField()
    storage_path = models.CharField(max_length=500)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ticket_attachments'
        ordering = ['-uploaded_at']
        verbose_name = 'Ticket Attachment'
        verbose_name_plural = 'Ticket Attachments'
    
    def __str__(self):
        return f"{self.original_name} on {self.ticket.ticket_number}"

