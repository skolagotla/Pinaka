"""
Expense Domain Models
Single Source of Truth for expense tracking
"""
from django.db import models
from django.utils import timezone


class Expense(models.Model):
    """Expense entity - tracks property and maintenance expenses"""
    
    property = models.ForeignKey(
        'property.Property',
        on_delete=models.SET_NULL,
        related_name='expenses',
        null=True,
        blank=True
    )
    maintenance_request = models.ForeignKey(
        'maintenance.MaintenanceRequest',
        on_delete=models.SET_NULL,
        related_name='expenses',
        null=True,
        blank=True
    )
    
    category = models.CharField(max_length=100, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(db_index=True)
    description = models.TextField()
    receipt_url = models.URLField(blank=True, null=True)
    paid_to = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    
    is_recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(max_length=20, blank=True, null=True)
    
    created_by = models.CharField(max_length=100)
    
    # PMC tracking
    created_by_pmc = models.BooleanField(default=False)
    pmc_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    pmc_approval_request_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'property_expenses'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['property_id']),
            models.Index(fields=['category']),
            models.Index(fields=['date']),
            models.Index(fields=['created_by']),
            models.Index(fields=['maintenance_request_id']),
            models.Index(fields=['property_id', 'date']),
            models.Index(fields=['pmc_id']),
        ]
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
    
    def __str__(self):
        return f"{self.category} - ${self.amount} - {self.date}"

