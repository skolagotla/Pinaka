"""Support Tickets Domain Admin Interface"""
from django.contrib import admin
from .models import SupportTicket, TicketNote, TicketAttachment


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    """Admin interface for Support Ticket"""
    
    list_display = [
        'ticket_number',
        'subject',
        'status',
        'priority',
        'created_by_name',
        'assigned_to_name',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'priority',
        'created_by_role',
        'created_at',
    ]
    
    search_fields = [
        'ticket_number',
        'subject',
        'description',
        'created_by_email',
        'created_by_name',
    ]
    
    readonly_fields = [
        'ticket_number',
        'created_at',
        'updated_at',
    ]


@admin.register(TicketNote)
class TicketNoteAdmin(admin.ModelAdmin):
    """Admin interface for Ticket Note"""
    
    list_display = [
        'ticket',
        'created_by_name',
        'created_by_role',
        'is_internal',
        'created_at',
    ]
    
    list_filter = [
        'is_internal',
        'created_by_role',
        'created_at',
    ]


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    """Admin interface for Ticket Attachment"""
    
    list_display = [
        'original_name',
        'ticket',
        'file_type',
        'file_size',
        'uploaded_at',
    ]

