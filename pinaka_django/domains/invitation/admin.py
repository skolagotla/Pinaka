"""Invitations Domain Admin Interface"""
from django.contrib import admin
from .models import Invitation


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    """Admin interface for Invitation"""
    
    list_display = [
        'email',
        'invitation_type',
        'status',
        'invited_by_name',
        'invited_by_role',
        'is_expired',
        'created_at',
    ]
    
    list_filter = [
        'invitation_type',
        'status',
        'invited_by_role',
        'created_at',
    ]
    
    search_fields = [
        'email',
        'token',
        'invited_by_name',
        'invited_by_email',
    ]
    
    readonly_fields = [
        'token',
        'is_expired',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Invitation Details', {
            'fields': (
                'email',
                'token',
                'invitation_type',
                'status',
                'message',
            )
        }),
        ('Inviter Information', {
            'fields': (
                'invited_by',
                'invited_by_role',
                'invited_by_name',
                'invited_by_email',
                'invited_by_admin',
                'invited_by_landlord',
                'invited_by_pmc',
            )
        }),
        ('Tracking', {
            'fields': (
                'sent_at',
                'opened_at',
                'completed_at',
                'cancelled_at',
                'expires_at',
                'is_expired',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )

