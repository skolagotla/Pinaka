"""
Payment Domain Admin Interface
"""
from django.contrib import admin
from .models import RentPayment, SecurityDeposit, Expense


@admin.register(RentPayment)
class RentPaymentAdmin(admin.ModelAdmin):
    """Admin interface for Rent Payments"""
    
    list_display = [
        'payment_id',
        'lease',
        'amount',
        'payment_date',
        'payment_for_month',
        'status',
        'is_late',
        'payment_method',
    ]
    
    list_filter = [
        'status',
        'payment_method',
        'is_late',
        'payment_date',
        'payment_for_month',
    ]
    
    search_fields = [
        'payment_id',
        'lease__lease_id',
        'reference_number',
    ]
    
    readonly_fields = [
        'payment_id',
        'is_paid',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('payment_id', 'lease', 'status')
        }),
        ('Payment Details', {
            'fields': (
                'amount',
                'payment_date',
                'payment_for_month',
                'payment_method',
                'reference_number',
            )
        }),
        ('Late Payment', {
            'fields': (
                'is_late',
                'late_fee',
            ),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': (
                'notes',
                'receipt_url',
                'recorded_by',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'is_paid',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-payment_date']
    date_hierarchy = 'payment_date'


@admin.register(SecurityDeposit)
class SecurityDepositAdmin(admin.ModelAdmin):
    """Admin interface for Security Deposits"""
    
    list_display = [
        'deposit_id',
        'lease',
        'amount',
        'received_date',
        'status',
        'amount_returned',
        'amount_deducted',
    ]
    
    list_filter = [
        'status',
        'received_date',
        'return_date',
    ]
    
    search_fields = [
        'deposit_id',
        'lease__lease_id',
    ]
    
    readonly_fields = [
        'deposit_id',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('deposit_id', 'lease', 'status')
        }),
        ('Deposit Details', {
            'fields': (
                'amount',
                'received_date',
                'payment_method',
                'receipt_url',
            )
        }),
        ('Return/Deduction', {
            'fields': (
                'return_date',
                'amount_returned',
                'amount_deducted',
                'deduction_reason',
                'return_receipt_url',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-received_date']
    date_hierarchy = 'received_date'


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """Admin interface for Expenses"""
    
    list_display = [
        'expense_id',
        'property_id',
        'category',
        'amount',
        'expense_date',
        'vendor',
        'status',
    ]
    
    list_filter = [
        'category',
        'status',
        'expense_date',
    ]
    
    search_fields = [
        'expense_id',
        'property_id',
        'description',
        'vendor',
        'reference_number',
    ]
    
    readonly_fields = [
        'expense_id',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('expense_id', 'property_id', 'category', 'status')
        }),
        ('Expense Details', {
            'fields': (
                'amount',
                'expense_date',
                'description',
                'vendor',
                'payment_method',
                'reference_number',
            )
        }),
        ('Documentation', {
            'fields': (
                'receipt_url',
                'maintenance_request_id',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'recorded_by',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-expense_date']
    date_hierarchy = 'expense_date'

