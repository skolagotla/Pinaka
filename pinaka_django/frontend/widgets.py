"""
Dashboard Widgets - Activity Log, Notifications, etc.
"""
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from domains.activity.models import ActivityLog
from domains.notification.models import Notification
from django.utils import timezone
from datetime import timedelta


@login_required
def activity_log_widget(request):
    """Activity Log Widget - returns JSON for AJAX"""
    limit = int(request.GET.get('limit', 10))
    
    # Get activities for current user or all if admin
    activities = ActivityLog.objects.all().order_by('-created_at')[:limit]
    
    # Format for widget
    data = []
    for activity in activities:
        data.append({
            'id': str(activity.id),
            'user_name': activity.user_name,
            'user_role': activity.user_role,
            'action': activity.action,
            'entity_type': activity.entity_type,
            'entity_name': activity.entity_name,
            'description': activity.description or f"{activity.action} {activity.entity_type}",
            'metadata': activity.metadata,
            'created_at': activity.created_at.isoformat(),
        })
    
    return JsonResponse({'success': True, 'data': data, 'activities': data})


@login_required
def notification_widget(request):
    """Notification Widget - returns JSON for AJAX"""
    user_email = request.user.email
    
    # Get unread notifications for user
    notifications = Notification.objects.filter(
        recipient_email=user_email,
        is_read=False
    ).order_by('-created_at')[:20]
    
    unread_count = Notification.objects.filter(
        recipient_email=user_email,
        is_read=False
    ).count()
    
    # Format for widget
    data = []
    for notification in notifications:
        data.append({
            'id': str(notification.id),
            'title': notification.title,
            'message': notification.message,
            'type': notification.notification_type,
            'priority': notification.priority,
            'is_read': notification.is_read,
            'action_url': notification.action_url,
            'created_at': notification.created_at.isoformat(),
        })
    
    return JsonResponse({
        'success': True,
        'notifications': data,
        'unreadCount': unread_count,
    })

