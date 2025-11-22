"""
Inspection Checklist Domain Models
Single Source of Truth for move-in/move-out inspections
"""
from django.db import models
from django.utils import timezone


class InspectionChecklist(models.Model):
    """Inspection Checklist entity - for move-in/move-out inspections"""
    
    tenant = models.ForeignKey(
        'tenant.Tenant',
        on_delete=models.CASCADE,
        related_name='inspection_checklists'
    )
    lease = models.ForeignKey(
        'lease.Lease',
        on_delete=models.SET_NULL,
        related_name='inspection_checklists',
        null=True,
        blank=True
    )
    property = models.ForeignKey(
        'property.Property',
        on_delete=models.SET_NULL,
        related_name='inspection_checklists',
        null=True,
        blank=True
    )
    unit = models.ForeignKey(
        'property.Unit',
        on_delete=models.SET_NULL,
        related_name='inspection_checklists',
        null=True,
        blank=True
    )
    
    checklist_type = models.CharField(
        max_length=20,
        choices=[
            ('move-in', 'Move-in'),
            ('move-out', 'Move-out'),
        ],
        db_index=True
    )
    
    inspection_date = models.DateTimeField(blank=True, null=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('submitted', 'Submitted'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending',
        db_index=True
    )
    
    submitted_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    approved_by_name = models.CharField(max_length=255, blank=True, null=True)
    
    rejection_reason = models.TextField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    rejected_by = models.CharField(max_length=100, blank=True, null=True)
    rejected_by_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inspection_checklists'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant_id']),
            models.Index(fields=['status']),
            models.Index(fields=['checklist_type']),
            models.Index(fields=['submitted_at']),
        ]
        verbose_name = 'Inspection Checklist'
        verbose_name_plural = 'Inspection Checklists'
    
    def __str__(self):
        return f"{self.get_checklist_type_display()} Checklist - {self.tenant.first_name} {self.tenant.last_name}"


class InspectionChecklistItem(models.Model):
    """Individual checklist item"""
    
    checklist = models.ForeignKey(
        InspectionChecklist,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    item_id = models.CharField(max_length=100, db_index=True)  # e.g., 'walls', 'floors'
    item_label = models.CharField(max_length=255)
    category = models.CharField(max_length=50)
    
    is_checked = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    photos = models.JSONField(blank=True, null=True)  # Array of photo objects
    
    landlord_notes = models.TextField(blank=True, null=True)
    landlord_approval = models.CharField(
        max_length=20,
        choices=[
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        blank=True,
        null=True
    )
    landlord_approved_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inspection_checklist_items'
        ordering = ['category', 'item_id']
        indexes = [
            models.Index(fields=['checklist_id']),
            models.Index(fields=['item_id']),
        ]
        verbose_name = 'Checklist Item'
        verbose_name_plural = 'Checklist Items'
    
    def __str__(self):
        return f"{self.item_label} - {self.checklist}"

