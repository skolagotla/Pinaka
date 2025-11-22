"""Application Domain Admin Interface"""
from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Admin interface for Application"""
    
    list_display = [
        'applicant_name',
        'applicant_email',
        'property',
        'unit',
        'status',
        'deadline',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'screening_status',
        'is_archived',
        'created_at',
    ]
    
    search_fields = [
        'applicant_name',
        'applicant_email',
        'property__property_name',
        'unit__unit_name',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]
    
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        """Approve selected applications"""
        from django.utils import timezone
        count = 0
        for app in queryset.filter(status__in=['submitted', 'under_review']):
            app.status = 'approved'
            app.approved_at = timezone.now()
            app.approved_by = str(request.user.id) if hasattr(request.user, 'id') else ''
            app.approved_by_name = request.user.get_full_name() if hasattr(request.user, 'get_full_name') else str(request.user)
            app.save()
            count += 1
        self.message_user(request, f'{count} application(s) approved.')
    approve_applications.short_description = "Approve selected applications"
    
    def reject_applications(self, request, queryset):
        """Reject selected applications"""
        from django.utils import timezone
        count = 0
        for app in queryset.filter(status__in=['submitted', 'under_review']):
            app.status = 'rejected'
            app.rejected_at = timezone.now()
            app.rejected_by = str(request.user.id) if hasattr(request.user, 'id') else ''
            app.rejected_by_name = request.user.get_full_name() if hasattr(request.user, 'get_full_name') else str(request.user)
            app.save()
            count += 1
        self.message_user(request, f'{count} application(s) rejected.')
    reject_applications.short_description = "Reject selected applications"

