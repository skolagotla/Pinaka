"""
Payment Domain Models
Single Source of Truth for Payment data
"""
from django.db import models
from django.core.validators import MinValueValidator


class RentPayment(models.Model):
    """Rent payment tracking"""
    
    # Primary identification
    payment_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Relationship
    lease = models.ForeignKey('lease.Lease', on_delete=models.CASCADE, related_name='rent_payments')
    
    # Payment details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    payment_date = models.DateField()
    payment_method = models.CharField(
        max_length=50,
        choices=[
            ('CASH', 'Cash'),
            ('CHECK', 'Check'),
            ('E_TRANSFER', 'E-Transfer'),
            ('CREDIT_CARD', 'Credit Card'),
            ('DEBIT_CARD', 'Debit Card'),
            ('BANK_TRANSFER', 'Bank Transfer'),
            ('OTHER', 'Other'),
        ],
        default='E_TRANSFER'
    )
    
    # Payment period
    payment_for_month = models.DateField()  # Which month this payment is for
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('PAID', 'Paid'),
            ('PENDING', 'Pending'),
            ('OVERDUE', 'Overdue'),
            ('PARTIAL', 'Partial'),
            ('FAILED', 'Failed'),
        ],
        default='PAID'
    )
    
    # Additional details
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    receipt_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Late payment tracking
    is_late = models.BooleanField(default=False)
    late_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)]
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    recorded_by = models.CharField(max_length=50, blank=True, null=True)  # User who recorded
    
    class Meta:
        db_table = 'rent_payments'
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['lease']),
            models.Index(fields=['payment_date']),
            models.Index(fields=['payment_for_month']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Rent Payment'
        verbose_name_plural = 'Rent Payments'
    
    def __str__(self):
        return f"${self.amount} payment for {self.lease} on {self.payment_date}"
    
    @property
    def is_paid(self):
        """Check if payment is completed"""
        return self.status == 'PAID'


class SecurityDeposit(models.Model):
    """Security deposit tracking"""
    
    # Primary identification
    deposit_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Relationship
    lease = models.ForeignKey('lease.Lease', on_delete=models.CASCADE, related_name='security_deposits')
    
    # Deposit details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    received_date = models.DateField()
    payment_method = models.CharField(max_length=50)
    
    # Return/Deduction tracking
    status = models.CharField(
        max_length=20,
        choices=[
            ('HELD', 'Held'),
            ('RETURNED', 'Returned'),
            ('PARTIALLY_RETURNED', 'Partially Returned'),
            ('FORFEITED', 'Forfeited'),
        ],
        default='HELD'
    )
    
    return_date = models.DateField(blank=True, null=True)
    amount_returned = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)]
    )
    amount_deducted = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)]
    )
    deduction_reason = models.TextField(blank=True, null=True)
    
    # Documentation
    receipt_url = models.URLField(max_length=500, blank=True, null=True)
    return_receipt_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'security_deposits'
        ordering = ['-received_date']
        indexes = [
            models.Index(fields=['lease']),
            models.Index(fields=['status']),
            models.Index(fields=['received_date']),
        ]
        verbose_name = 'Security Deposit'
        verbose_name_plural = 'Security Deposits'
    
    def __str__(self):
        return f"${self.amount} deposit for {self.lease}"


class Expense(models.Model):
    """Property-related expenses"""
    
    # Primary identification
    expense_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Expense details
    property_id = models.CharField(max_length=50, db_index=True)  # Reference to Property
    category = models.CharField(
        max_length=50,
        choices=[
            ('MAINTENANCE', 'Maintenance'),
            ('REPAIR', 'Repair'),
            ('UTILITIES', 'Utilities'),
            ('INSURANCE', 'Insurance'),
            ('PROPERTY_TAX', 'Property Tax'),
            ('MANAGEMENT_FEE', 'Management Fee'),
            ('LEGAL', 'Legal'),
            ('MARKETING', 'Marketing'),
            ('OTHER', 'Other'),
        ]
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    expense_date = models.DateField()
    
    # Details
    description = models.TextField()
    vendor = models.CharField(max_length=200, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Documentation
    receipt_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('PAID', 'Paid'),
            ('PENDING', 'Pending'),
            ('REIMBURSED', 'Reimbursed'),
        ],
        default='PAID'
    )
    
    # Tracking
    maintenance_request_id = models.CharField(max_length=50, blank=True, null=True)  # Link to maintenance request
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    recorded_by = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        db_table = 'expenses'
        ordering = ['-expense_date']
        indexes = [
            models.Index(fields=['property_id']),
            models.Index(fields=['category']),
            models.Index(fields=['expense_date']),
            models.Index(fields=['status']),
        ]
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
    
    def __str__(self):
        return f"{self.category}: ${self.amount} on {self.expense_date}"

