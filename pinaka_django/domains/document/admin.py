"""Document Domain Admin Interface"""
from django.contrib import admin
from .models import Document, DocumentAuditLog, DocumentMessage


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin interface for Document"""
    
    list_display = [
        'original_name',
        'category',
        'tenant',
        'is_verified',
        'is_deleted',
        'uploaded_at',
    ]
    
    list_filter = [
        'category',
        'is_verified',
        'is_deleted',
        'is_required',
        'visibility',
        'uploaded_at',
    ]
    
    search_fields = [
        'original_name',
        'file_name',
        'description',
        'tenant__email',
        'tenant__first_name',
        'tenant__last_name',
    ]
    
    readonly_fields = [
        'uploaded_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('File Information', {
            'fields': (
                'original_name',
                'file_name',
                'file_type',
                'file_size',
                'file_size_mb',
                'storage_path',
            )
        }),
        ('Document Details', {
            'fields': (
                'tenant',
                'property',
                'category',
                'subcategory',
                'description',
                'tags',
                'metadata',
            )
        }),
        ('Permissions', {
            'fields': (
                'visibility',
                'can_landlord_delete',
                'can_tenant_delete',
            )
        }),
        ('Verification', {
            'fields': (
                'is_verified',
                'verified_at',
                'verified_by',
                'verified_by_name',
                'verified_by_role',
                'verification_comment',
            ),
            'classes': ('collapse',)
        }),
        ('Rejection', {
            'fields': (
                'is_rejected',
                'rejected_at',
                'rejected_by',
                'rejected_by_name',
                'rejected_by_role',
                'rejection_reason',
            ),
            'classes': ('collapse',)
        }),
        ('Expiration', {
            'fields': (
                'expiration_date',
                'is_required',
                'reminder_sent',
                'reminder_sent_at',
                'is_expired',
            ),
            'classes': ('collapse',)
        }),
        ('Upload Tracking', {
            'fields': (
                'uploaded_by',
                'uploaded_by_email',
                'uploaded_by_name',
                'uploaded_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
        ('Deletion', {
            'fields': (
                'is_deleted',
                'deleted_at',
                'deleted_by',
                'deleted_by_email',
                'deleted_by_name',
                'deletion_reason',
            ),
            'classes': ('collapse',)
        }),
        ('Security', {
            'fields': ('document_hash',),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-uploaded_at']
    date_hierarchy = 'uploaded_at'


@admin.register(DocumentAuditLog)
class DocumentAuditLogAdmin(admin.ModelAdmin):
    """Admin interface for Document Audit Logs"""
    
    list_display = [
        'document',
        'action',
        'performed_by_name',
        'created_at',
    ]
    
    list_filter = [
        'action',
        'created_at',
    ]
    
    search_fields = [
        'document__original_name',
        'performed_by_name',
        'performed_by_email',
        'action',
    ]
    
    readonly_fields = [
        'document',
        'action',
        'performed_by',
        'performed_by_email',
        'performed_by_name',
        'ip_address',
        'user_agent',
        'details',
        'created_at',
    ]
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        """Audit logs are read-only"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Audit logs are read-only"""
        return False


@admin.register(DocumentMessage)
class DocumentMessageAdmin(admin.ModelAdmin):
    """Admin interface for Document Messages"""
    
    list_display = [
        'document',
        'sender_name',
        'sender_role',
        'is_read',
        'created_at',
    ]
    
    list_filter = [
        'sender_role',
        'is_read',
        'created_at',
    ]
    
    search_fields = [
        'document__original_name',
        'sender_name',
        'sender_email',
        'message',
    ]
    
    readonly_fields = [
        'document',
        'message',
        'sender_role',
        'sender_email',
        'sender_name',
        'is_read',
        'read_at',
        'created_at',
        'updated_at',
    ]
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'

