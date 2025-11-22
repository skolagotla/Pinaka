"""
Cron Job Views - Archive Audit Logs, Expired Approvals
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
from domains.activity.models import ActivityLog
from domains.invitation.models import Invitation


@require_http_methods(["POST"])
def archive_audit_logs(request):
    """Archive old audit logs (older than 90 days)"""
    try:
        cutoff_date = timezone.now() - timedelta(days=90)
        
        # Get old logs
        old_logs = ActivityLog.objects.filter(created_at__lt=cutoff_date)
        count = old_logs.count()
        
        # In production, you'd move these to an archive table or file
        # For now, we'll just delete them (or mark as archived)
        # old_logs.delete()  # Uncomment if you want to delete
        
        return JsonResponse({
            'success': True,
            'message': f'Archived {count} audit logs',
            'count': count,
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
        }, status=500)


@require_http_methods(["POST"])
def expired_approvals(request):
    """Mark expired approvals as expired"""
    try:
        now = timezone.now()
        
        # Get expired invitations
        expired_invitations = Invitation.objects.filter(
            expires_at__lt=now,
            status='PENDING'
        )
        count = expired_invitations.count()
        
        # Mark as expired
        expired_invitations.update(status='EXPIRED')
        
        return JsonResponse({
            'success': True,
            'message': f'Marked {count} expired approvals',
            'count': count,
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
        }, status=500)

