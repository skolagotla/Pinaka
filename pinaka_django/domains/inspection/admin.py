"""Inspection Domain Admin Interface"""
from django.contrib import admin
from .models import InspectionChecklist, InspectionChecklistItem


class InspectionChecklistItemInline(admin.TabularInline):
    """Inline admin for checklist items"""
    model = InspectionChecklistItem
    extra = 0
    readonly_fields = ['created_at', 'updated_at']


@admin.register(InspectionChecklist)
class InspectionChecklistAdmin(admin.ModelAdmin):
    """Admin interface for Inspection Checklist"""
    
    list_display = [
        'tenant',
        'checklist_type',
        'status',
        'inspection_date',
        'submitted_at',
        'created_at',
    ]
    
    list_filter = [
        'checklist_type',
        'status',
        'created_at',
    ]
    
    search_fields = [
        'tenant__first_name',
        'tenant__last_name',
        'tenant__email',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]
    
    inlines = [InspectionChecklistItemInline]

