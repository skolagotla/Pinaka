"""Verifications Domain Admin Interface"""
from django.contrib import admin
from .models import UnifiedVerification, UnifiedVerificationHistory


class UnifiedVerificationHistoryInline(admin.TabularInline):
    """Inline admin for verification history"""
    model = UnifiedVerificationHistory
    extra = 0
    readonly_fields = [
        'action',
        'performed_by',
        'performed_by_role',
        'performed_by_email',
        'performed_by_name',
        'previous_status',
        'new_status',
        'notes',
        'metadata',
        'created_at',
    ]
    can_delete = False


@admin.register(UnifiedVerification)
class UnifiedVerificationAdmin(admin.ModelAdmin):
    """Admin interface for Unified Verification"""
    
    list_display = [
        'title',
        'verification_type',
        'status',
        'priority',
        'requested_by_name',
        'assigned_to_name',
        'requested_at',
    ]
    
    list_filter = [
        'verification_type',
        'status',
        'priority',
        'requested_by_role',
        'requested_at',
    ]
    
    search_fields = [
        'title',
        'description',
        'requested_by_email',
        'requested_by_name',
        'entity_type',
        'entity_id',
    ]
    
    inlines = [UnifiedVerificationHistoryInline]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]


@admin.register(UnifiedVerificationHistory)
class UnifiedVerificationHistoryAdmin(admin.ModelAdmin):
    """Admin interface for Verification History"""
    
    list_display = [
        'verification',
        'action',
        'performed_by_name',
        'previous_status',
        'new_status',
        'created_at',
    ]
    
    list_filter = [
        'action',
        'created_at',
    ]
    
    search_fields = [
        'verification__title',
        'performed_by_name',
        'performed_by_email',
    ]
    
    readonly_fields = [
        'verification',
        'action',
        'performed_by',
        'performed_by_role',
        'performed_by_email',
        'performed_by_name',
        'previous_status',
        'new_status',
        'notes',
        'metadata',
        'created_at',
    ]
    
    def has_add_permission(self, request):
        """History is read-only"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """History is read-only"""
        return False

