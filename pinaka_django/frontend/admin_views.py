"""
Admin Frontend Views
Platform Admin interface - matches React app /admin/ routes
"""
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from domains.rbac.models import Admin, Role, UserRole, AdminAuditLog
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from domains.pmc.models import PropertyManagementCompany
from domains.property.models import Property
from domains.lease.models import Lease
from domains.payment.models import RentPayment
from domains.maintenance.models import MaintenanceRequest
from domains.support.models import SupportTicket
from domains.notification.models import Notification
from shared.rbac.permissions import has_role, get_user_roles


def check_admin_access(user):
    """Check if user has admin access (SUPER_ADMIN or PLATFORM_ADMIN)"""
    if not user.is_authenticated:
        return False
    
    # Get user_id from profile
    user_id = None
    user_type = None
    
    if hasattr(user, 'admin_profile'):
        user_id = str(user.admin_profile.id)
        user_type = 'ADMIN'
    elif hasattr(user, 'id'):
        user_id = str(user.id)
        user_type = getattr(user, 'user_type', 'ADMIN').upper()
    else:
        return False
    
    # Check for SUPER_ADMIN or PLATFORM_ADMIN role
    return has_role(user_id, user_type, 'SUPER_ADMIN') or has_role(user_id, user_type, 'PLATFORM_ADMIN')


@login_required
def admin_dashboard(request):
    """Admin dashboard - main admin page - OPTIMIZED"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    # OPTIMIZED: Cache admin dashboard stats
    from django.core.cache import cache
    cache_key = f'admin_dashboard_stats_{request.user.id}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        stats = cached_data['stats']
        monthly_users = cached_data['monthly_users']
    else:
        # Get admin stats
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        stats = {
            'total_admins': Admin.objects.filter(is_active=True).count(),
            'active_admins': Admin.objects.filter(is_active=True, is_locked=False).count(),
            'total_landlords': Landlord.objects.count(),
            'total_tenants': Tenant.objects.count(),
            'total_pmcs': PropertyManagementCompany.objects.count(),
            'total_properties': Property.objects.count(),
            'total_leases': Lease.objects.count(),
            'total_payments': RentPayment.objects.count(),
            'open_tickets': SupportTicket.objects.filter(status__in=['OPEN', 'IN_PROGRESS']).count(),
            'pending_verifications': 0,  # TODO: Add verification count
        }
        
        # OPTIMIZED: Monthly stats - use single aggregation query instead of loop
        cache_key_monthly = 'admin_monthly_stats'
        monthly_users = cache.get(cache_key_monthly)
        
        if monthly_users is None:
            monthly_users = []
            # Get all landlords and tenants with created_at in one query
            # Get all landlords created in last 6 months
            six_months_ago = start_of_month - timedelta(days=180)
            recent_landlords = Landlord.objects.filter(created_at__gte=six_months_ago).values('created_at')
            recent_tenants = Tenant.objects.filter(created_at__gte=six_months_ago).values('created_at')
            
            # Group by month
            for i in range(6):
                month_start = (start_of_month - timedelta(days=30*i)).replace(day=1)
                month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                
                # Count in Python (faster than 12 separate queries)
                landlord_count = sum(1 for ll in recent_landlords if month_start <= ll['created_at'] <= month_end)
                tenant_count = sum(1 for tt in recent_tenants if month_start <= tt['created_at'] <= month_end)
                
                monthly_users.append({
                    'month': month_start.strftime('%b %Y'),
                    'landlords': landlord_count,
                    'tenants': tenant_count,
                })
            monthly_users.reverse()
            # Cache for 10 minutes
            cache.set(cache_key_monthly, monthly_users, 600)
        
        # Cache dashboard stats for 5 minutes
        cache.set(cache_key, {'stats': stats, 'monthly_users': monthly_users}, 300)
    
    # Recent activity (not cached - always fresh)
    recent_audit_logs = AdminAuditLog.objects.select_related('admin').only(
        'id', 'action', 'resource_type', 'resource_id', 'timestamp',
        'admin__first_name', 'admin__last_name'
    ).order_by('-created_at')[:10]
    
    context = {
        'stats': stats,
        'recent_audit_logs': recent_audit_logs,
        'monthly_users': monthly_users,
    }
    return render(request, 'frontend/admin/dashboard.html', context)


@login_required
def admin_users(request):
    """Admin user management page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from django.db.models import Q, Count
    from domains.invitation.models import Invitation
    
    # Get active tab from query params
    active_tab = request.GET.get('tab', 'active')
    
    # Get filter params with validation
    role_filter = request.GET.get('role', 'all')
    search_query = request.GET.get('search', '')
    status_filter = request.GET.get('status', 'all')
    try:
        page = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        limit = max(1, min(100, int(request.GET.get('limit', 50))))  # Limit between 1-100
    except (ValueError, TypeError):
        limit = 50
    
    context = {
        'active_tab': active_tab,
        'role_filter': role_filter,
        'search_query': search_query,
        'status_filter': status_filter,
        'page': page,
        'limit': limit,
    }
    
    if active_tab == 'active':
        # OPTIMIZED: Use database-level pagination instead of loading all into memory
        from django.core.paginator import Paginator
        
        # Get all users (admins, landlords, tenants, PMCs) - build queryset efficiently
        all_users = []
        
        # Get admins
        if role_filter in ['all', 'admin']:
            admin_qs = Admin.objects.filter(is_active=True).only(
                'id', 'email', 'first_name', 'last_name', 'phone', 'is_locked', 'is_active', 'created_at'
            )
            if search_query:
                admin_qs = admin_qs.filter(
                    Q(email__icontains=search_query) |
                    Q(first_name__icontains=search_query) |
                    Q(last_name__icontains=search_query)
                )
            # Prefetch RBAC roles for all admins at once
            admin_ids = list(admin_qs.values_list('id', flat=True))
            admin_roles_map = {}
            if admin_ids:
                from domains.rbac.models import UserRole
                admin_roles = UserRole.objects.filter(
                    user_id__in=[str(aid) for aid in admin_ids],
                    user_type='ADMIN',
                    is_active=True
                ).select_related('role')
                for ur in admin_roles:
                    admin_id = ur.user_id
                    if admin_id not in admin_roles_map:
                        admin_roles_map[admin_id] = []
                    admin_roles_map[admin_id].append(ur)
            
            for admin in admin_qs:
                rbac_roles = admin_roles_map.get(str(admin.id), [])
                all_users.append({
                    'id': str(admin.id),
                    'type': 'admin',
                    'role': 'admin',
                    'email': admin.email,
                    'firstName': admin.first_name,
                    'lastName': admin.last_name,
                    'phone': admin.phone,
                    'status': 'locked' if admin.is_locked else ('active' if admin.is_active else 'inactive'),
                    'createdAt': admin.created_at,
                    'rbacRoles': [{'role': {'name': ur.role.name, 'displayName': ur.role.display_name}} for ur in rbac_roles],
                })
        
        # Get landlords
        if role_filter in ['all', 'landlord']:
            landlord_qs = Landlord.objects.only(
                'id', 'email', 'first_name', 'last_name', 'phone', 'approval_status', 'created_at'
            )
            if search_query:
                landlord_qs = landlord_qs.filter(
                    Q(email__icontains=search_query) |
                    Q(first_name__icontains=search_query) |
                    Q(last_name__icontains=search_query)
                )
            if status_filter != 'all':
                if status_filter == 'active':
                    landlord_qs = landlord_qs.filter(approval_status='APPROVED')
                elif status_filter == 'pending':
                    landlord_qs = landlord_qs.filter(approval_status='PENDING')
                elif status_filter == 'inactive':
                    landlord_qs = landlord_qs.filter(approval_status='REJECTED')
            
            for landlord in landlord_qs:
                all_users.append({
                    'id': str(landlord.id),
                    'type': 'landlord',
                    'role': 'landlord',
                    'email': landlord.email,
                    'firstName': landlord.first_name,
                    'lastName': landlord.last_name,
                    'phone': landlord.phone,
                    'status': 'active' if landlord.approval_status == 'APPROVED' else ('pending' if landlord.approval_status == 'PENDING' else 'inactive'),
                    'createdAt': landlord.created_at,
                })
        
        # Get tenants
        if role_filter in ['all', 'tenant']:
            tenant_qs = Tenant.objects.only(
                'id', 'email', 'first_name', 'last_name', 'phone', 'status', 'approval_status', 'created_at'
            )
            if search_query:
                tenant_qs = tenant_qs.filter(
                    Q(email__icontains=search_query) |
                    Q(first_name__icontains=search_query) |
                    Q(last_name__icontains=search_query)
                )
            for tenant in tenant_qs:
                # Determine status based on tenant.status and approval_status
                if tenant.status == 'ACTIVE' and tenant.approval_status == 'APPROVED':
                    tenant_status = 'active'
                elif tenant.approval_status == 'PENDING':
                    tenant_status = 'pending'
                else:
                    tenant_status = 'inactive'
                
                all_users.append({
                    'id': str(tenant.id),
                    'type': 'tenant',
                    'role': 'tenant',
                    'email': tenant.email,
                    'firstName': tenant.first_name,
                    'lastName': tenant.last_name,
                    'phone': tenant.phone,
                    'status': tenant_status,
                    'createdAt': tenant.created_at,
                })
        
        # Get PMCs
        if role_filter in ['all', 'pmc']:
            pmc_qs = PropertyManagementCompany.objects.only(
                'id', 'email', 'company_name', 'phone', 'approval_status', 'created_at'
            )
            if search_query:
                pmc_qs = pmc_qs.filter(
                    Q(email__icontains=search_query) |
                    Q(company_name__icontains=search_query)
                )
            if status_filter != 'all':
                if status_filter == 'active':
                    pmc_qs = pmc_qs.filter(approval_status='APPROVED')
                elif status_filter == 'pending':
                    pmc_qs = pmc_qs.filter(approval_status='PENDING')
                elif status_filter == 'inactive':
                    pmc_qs = pmc_qs.filter(approval_status='REJECTED')
            
            for pmc in pmc_qs:
                all_users.append({
                    'id': str(pmc.id),
                    'type': 'pmc',
                    'role': 'pmc',
                    'email': pmc.email,
                    'companyName': pmc.company_name,
                    'phone': pmc.phone,
                    'status': 'active' if pmc.approval_status == 'APPROVED' else ('pending' if pmc.approval_status == 'PENDING' else 'inactive'),
                    'createdAt': pmc.created_at,
                })
        
        # Paginate using Django Paginator
        paginator = Paginator(all_users, limit)
        try:
            page_obj = paginator.page(page)
        except:
            page_obj = paginator.page(1)
            page = 1
        
        context.update({
            'users': page_obj.object_list,
            'total_users': paginator.count,
            'total_pages': paginator.num_pages,
            'page_obj': page_obj,
        })
    else:
        # Invitations tabs (pending, rejected, archive)
        invitation_qs = Invitation.objects.all()
        
        if active_tab == 'pending':
            # Pending: completed but not approved/rejected, or still in progress
            invitation_qs = invitation_qs.filter(
                Q(status='completed', approved_by__isnull=True, rejected_by__isnull=True) |
                Q(status__in=['pending', 'sent', 'opened'])
            )
        elif active_tab == 'rejected':
            invitation_qs = invitation_qs.filter(status='completed', rejected_by__isnull=False)
        elif active_tab == 'archive':
            invitation_qs = invitation_qs.filter(status='completed', approved_by__isnull=False)
        
        if search_query:
            invitation_qs = invitation_qs.filter(email__icontains=search_query)
        
        invitations = list(invitation_qs.order_by('-created_at')[:100])
        
        # Get counts
        pending_count = Invitation.objects.filter(
            Q(status='completed', approved_by__isnull=True, rejected_by__isnull=True) |
            Q(status__in=['pending', 'sent', 'opened'])
        ).count()
        rejected_count = Invitation.objects.filter(status='completed', rejected_by__isnull=False).count()
        archive_count = Invitation.objects.filter(status='completed', approved_by__isnull=False).count()
        
        context.update({
            'invitations': invitations,
            'pending_count': pending_count,
            'rejected_count': rejected_count,
            'archive_count': archive_count,
        })
    
    # Get all roles for RBAC assignment
    roles = Role.objects.filter(is_active=True).order_by('name')
    context['roles'] = roles
    
    return render(request, 'frontend/admin/users.html', context)


@login_required
def admin_rbac(request):
    """RBAC settings page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from domains.rbac.models import RolePermission, Permission
    
    # Get active tab
    active_tab = request.GET.get('tab', 'roles')
    
    # Get all roles with their permissions
    roles = Role.objects.filter(is_active=True).prefetch_related('permissions__permission').order_by('name')
    
    # Get all permissions grouped by category
    permissions = Permission.objects.all().order_by('category', 'resource', 'action')
    permissions_by_category = {}
    for perm in permissions:
        if perm.category not in permissions_by_category:
            permissions_by_category[perm.category] = []
        permissions_by_category[perm.category].append(perm)
    
    # Build permission matrix (role_id -> list of permission_ids) for template
    # Use list for easier template "in" check
    permission_matrix = {}
    for role in roles:
        role_id = str(role.id)
        perm_ids = []
        for role_perm in role.permissions.all():
            perm_ids.append(str(role_perm.permission.id))
        permission_matrix[role_id] = perm_ids
    
    # Get RBAC audit logs (if available)
    audit_logs = []
    if active_tab == 'audit':
        from domains.rbac.models import AdminAuditLog
        audit_logs = AdminAuditLog.objects.filter(
            action__icontains='RBAC'
        ).select_related('admin').order_by('-created_at')[:100]
    
    context = {
        'roles': roles,
        'permissions_by_category': permissions_by_category,
        'permission_matrix': permission_matrix,
        'active_tab': active_tab,
        'audit_logs': audit_logs,
    }
    return render(request, 'frontend/admin/rbac.html', context)


@login_required
def admin_system(request):
    """System monitoring page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from django.db import connection
    from django.utils import timezone
    from datetime import timedelta
    
    # Database health check
    db_healthy = True
    db_response_time = 0
    try:
        import time
        start = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_response_time = int((time.time() - start) * 1000)
    except Exception:
        db_healthy = False
    
    # Get system metrics
    now = timezone.now()
    last_24h = now - timedelta(hours=24)
    
    # User metrics
    total_landlords = Landlord.objects.count()
    total_tenants = Tenant.objects.count()
    total_admins = Admin.objects.filter(is_active=True).count()
    total_users = total_landlords + total_tenants + total_admins
    
    # Property metrics
    total_properties = Property.objects.count()
    properties_with_leases = Property.objects.filter(
        units__leases__status='ACTIVE'
    ).distinct().count()
    
    # Activity metrics (last 24 hours)
    new_landlords_24h = Landlord.objects.filter(created_at__gte=last_24h).count()
    new_tenants_24h = Tenant.objects.filter(created_at__gte=last_24h).count()
    new_properties_24h = Property.objects.filter(created_at__gte=last_24h).count()
    
    # Get login count (from audit logs)
    logins_24h = AdminAuditLog.objects.filter(
        action__icontains='login',
        created_at__gte=last_24h
    ).count()
    
    # Get table count
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        table_count = cursor.fetchone()[0]
    
    health_data = {
        'database': {
            'status': 'Healthy' if db_healthy else 'Unhealthy',
            'healthy': db_healthy,
            'responseTime': db_response_time,
        },
        'metrics': {
            'system': {
                'activeSessions': 0,  # TODO: Track active sessions
                'recentErrors': 0,  # TODO: Track errors
                'tableCount': table_count,
            },
            'users': {
                'landlords': total_landlords,
                'tenants': total_tenants,
                'total': total_users,
            },
            'properties': {
                'total': total_properties,
                'withActiveLeases': properties_with_leases,
            },
        },
        'activity': {
            'last24Hours': {
                'logins': logins_24h,
                'newUsers': new_landlords_24h + new_tenants_24h,
                'newProperties': new_properties_24h,
            },
        },
        'timestamp': now.isoformat(),
    }
    
    context = {
        'health': health_data,
    }
    return render(request, 'frontend/admin/system.html', context)


@login_required
def admin_audit_logs(request):
    """Audit logs page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    # Get filter params
    search_query = request.GET.get('search', '')
    action_filter = request.GET.get('action', '')
    try:
        page = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        limit = max(1, min(100, int(request.GET.get('limit', 50))))
    except (ValueError, TypeError):
        limit = 50
    
    # Build query
    audit_logs_qs = AdminAuditLog.objects.select_related('admin').all()
    
    if search_query:
        audit_logs_qs = audit_logs_qs.filter(
            Q(action__icontains=search_query) |
            Q(resource__icontains=search_query) |
            Q(admin__email__icontains=search_query)
        )
    
    if action_filter:
        audit_logs_qs = audit_logs_qs.filter(action__icontains=action_filter)
    
    total = audit_logs_qs.count()
    # Use Django Paginator for proper error handling
    from django.core.paginator import Paginator
    paginator = Paginator(audit_logs_qs.order_by('-created_at'), limit)
    try:
        page_obj = paginator.page(page)
        audit_logs = list(page_obj.object_list)
    except:
        page_obj = paginator.page(1)
        audit_logs = list(page_obj.object_list)
        page = 1
    
    context = {
        'audit_logs': audit_logs,
        'total': total,
        'page': page,
        'limit': limit,
        'total_pages': paginator.num_pages,
        'page_obj': page_obj,
        'search_query': search_query,
        'action_filter': action_filter,
    }
    return render(request, 'frontend/admin/audit_logs.html', context)


@login_required
def admin_analytics(request):
    """Analytics page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from domains.landlord.models import Landlord
    from domains.tenant.models import Tenant
    from domains.property.models import Property
    from domains.lease.models import Lease
    from domains.maintenance.models import MaintenanceRequest
    from domains.document.models import Document
    from domains.rbac.models import AdminAuditLog
    from django.db.models import Count
    from datetime import datetime, timedelta
    
    period = request.GET.get('period', '30d')
    
    # Calculate date range
    if period == '7d':
        days = 7
    elif period == '30d':
        days = 30
    elif period == '90d':
        days = 90
    elif period == '1y':
        days = 365
    else:
        days = 30
    
    start_date = datetime.now() - timedelta(days=days)
    
    # Overview statistics
    overview = {
        'users': {
            'landlords': Landlord.objects.count(),
            'tenants': Tenant.objects.count(),
        },
        'properties': {
            'total': Property.objects.count(),
        },
        'leases': {
            'active': Lease.objects.filter(status='ACTIVE').count(),
        },
        'maintenance': {
            'total': MaintenanceRequest.objects.count(),
            'open': MaintenanceRequest.objects.filter(status__in=['OPEN', 'IN_PROGRESS']).count(),
        },
        'documents': {
            'total': Document.objects.count(),
        },
    }
    
    # Recent activity (top actions)
    recent_activity = AdminAuditLog.objects.filter(
        created_at__gte=start_date
    ).select_related('admin').order_by('-created_at')[:50]
    
    # Top actions
    top_actions = AdminAuditLog.objects.filter(
        created_at__gte=start_date
    ).values('action').annotate(count=Count('id')).order_by('-count')[:10]
    
    context = {
        'overview': overview,
        'recent_activity': recent_activity,
        'top_actions': top_actions,
        'period': period,
    }
    return render(request, 'frontend/admin/analytics.html', context)


@login_required
def admin_settings(request):
    """Platform settings page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from shared.models import PlatformSettings
    
    # Get or create platform settings
    platform_settings = PlatformSettings.get_settings()
    settings = platform_settings.to_dict()
    
    context = {
        'settings': settings,
    }
    return render(request, 'frontend/admin/settings.html', context)


@login_required
def admin_library(request):
    """Library/Documents page for admin with Business and Legal tabs"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from domains.document.models import Document
    from domains.ltb_document.constants import (
        LTB_DOCUMENTS,
        get_ltb_documents_by_location,
        get_ltb_documents_by_audience,
        search_ltb_documents
    )
    from django.core.paginator import Paginator
    from django.db.models import Q
    
    # Get tab parameter (default to 'business')
    active_tab = request.GET.get('tab', 'business')
    
    # Get all documents
    all_documents = Document.objects.filter(is_deleted=False).select_related(
        'tenant', 'property'
    ).order_by('-uploaded_at')
    
    # Filter documents by category
    # Business documents: all non-legal documents
    business_documents = all_documents.exclude(
        category__icontains='legal'
    ).exclude(
        category__icontains='form'
    )
    
    # Legal documents: legal forms and documents (from Document model)
    legal_documents = all_documents.filter(
        category__icontains='legal'
    ) | all_documents.filter(
        category__icontains='form'
    )
    
    # Get LTB documents with filters (matching React app)
    country = request.GET.get('country', 'CA')
    province = request.GET.get('province', 'ON')
    category_filter = request.GET.get('category', '')
    audience_filter = request.GET.get('audience', 'all')
    search_query = request.GET.get('search', '')
    
    # Pagination for LTB documents
    try:
        page = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        limit = max(1, min(100, int(request.GET.get('limit', 50))))
    except (ValueError, TypeError):
        limit = 50
    
    # Filter LTB documents from constants (not database)
    documents_list = list(LTB_DOCUMENTS)
    
    # Filter by location
    if country and province:
        documents_list = get_ltb_documents_by_location(country, province)
    
    # Filter by audience
    if audience_filter and audience_filter != 'all':
        audience_docs = get_ltb_documents_by_audience(audience_filter)
        documents_list = [doc for doc in documents_list if doc in audience_docs]
    
    # Filter by category
    if category_filter:
        documents_list = [doc for doc in documents_list if doc['category'] == category_filter]
    
    # Search
    if search_query:
        search_results = search_ltb_documents(search_query)
        documents_list = [doc for doc in documents_list if doc in search_results]
    
    # Sort by form number
    documents_list = sorted(documents_list, key=lambda x: x['form_number'])
    
    # Paginate LTB documents
    total = len(documents_list)
    total_pages = (total + limit - 1) // limit
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_documents = documents_list[start_index:end_index]
    
    # Create paginator-like object for template compatibility
    class SimplePage:
        def __init__(self, items, page_num, total_items, items_per_page):
            self.object_list = items
            self.number = page_num
            self.paginator = type('Paginator', (), {
                'count': total_items,
                'num_pages': (total_items + items_per_page - 1) // items_per_page
            })()
            self.has_previous = page_num > 1
            self.has_next = page_num < self.paginator.num_pages
            self.previous_page_number = page_num - 1 if self.has_previous else None
            self.next_page_number = page_num + 1 if self.has_next else None
            self.start_index = start_index + 1
            self.end_index = min(start_index + len(items), total_items)
    
    ltb_page_obj = SimplePage(paginated_documents, page, total, limit)
    
    # Get all LTB documents for stats (no filters)
    all_ltb_documents = LTB_DOCUMENTS
    
    # Get filtered LTB documents for current region (for tab counts)
    filtered_ltb_documents = get_ltb_documents_by_location(country, province) if country and province else LTB_DOCUMENTS
    
    # Stats
    stats = {
        'total_documents': all_documents.count(),
        'business_documents': business_documents.count(),
        'legal_documents': legal_documents.count(),
        'ltb_documents': len(filtered_ltb_documents),  # Count for current region (from constants)
    }
    
    # Get documents for active tab
    if active_tab == 'legal':
        documents = legal_documents
    else:
        documents = business_documents
    
    # Tab counts for LTB documents (for audience tabs) - based on filtered region
    tab_counts = {
        'all': len(filtered_ltb_documents),
        'landlord': len([d for d in filtered_ltb_documents if d.get('audience') == 'landlord']),
        'tenant': len([d for d in filtered_ltb_documents if d.get('audience') == 'tenant']),
        'both': len([d for d in filtered_ltb_documents if d.get('audience') == 'both']),
    }
    
    # Categories for filter dropdown
    categories = [
        {'value': '', 'label': 'All Categories'},
        {'value': 'Rent', 'label': 'Rent'},
        {'value': 'Eviction', 'label': 'Eviction'},
        {'value': 'Application', 'label': 'Application'},
        {'value': 'Agreement', 'label': 'Agreement'},
        {'value': 'Notice Response', 'label': 'Notice Response'},
        {'value': 'Tenant Rights', 'label': 'Tenant Rights'},
        {'value': 'Maintenance', 'label': 'Maintenance'},
        {'value': 'Other', 'label': 'Other'},
    ]
    
    context = {
        'documents': documents,
        'business_documents': business_documents,
        'legal_documents': legal_documents,
        'ltb_documents': ltb_page_obj.object_list,
        'ltb_page_obj': ltb_page_obj,
        'active_tab': active_tab,
        'stats': stats,
        'country': country,
        'province': province,
        'category_filter': category_filter,
        'audience_filter': audience_filter,
        'search_query': search_query,
        'tab_counts': tab_counts,
        'categories': categories,
    }
    return render(request, 'frontend/admin/library.html', context)


@login_required
def admin_user_settings(request):
    """User profile settings page - for admin users"""
    import os
    from django.conf import settings as django_settings
    from django.core.files.storage import default_storage
    from django.core.files.base import ContentFile
    from PIL import Image
    import io
    
    # Handle POST requests (form submissions)
    if request.method == 'POST':
        tab = request.POST.get('tab', 'profile')
        
        # Get user profile
        user_data = None
        if hasattr(request.user, 'admin_profile'):
            user_data = request.user.admin_profile
        elif hasattr(request.user, 'landlord_profile'):
            user_data = request.user.landlord_profile
        elif hasattr(request.user, 'tenant_profile'):
            user_data = request.user.tenant_profile
        elif hasattr(request.user, 'pmc_profile'):
            user_data = request.user.pmc_profile
        
        if not user_data:
            messages.error(request, 'User profile not found')
            return redirect('admin_user_settings')
        
        if tab == 'profile':
            # Update profile information
            if 'first_name' in request.POST:
                user_data.first_name = request.POST.get('first_name')
            if 'middle_name' in request.POST:
                user_data.middle_name = request.POST.get('middle_name', '') or None
            if 'last_name' in request.POST:
                user_data.last_name = request.POST.get('last_name')
            if 'phone' in request.POST:
                user_data.phone = request.POST.get('phone')
            if 'address_line1' in request.POST:
                user_data.address_line1 = request.POST.get('address_line1')
            if 'city' in request.POST:
                user_data.city = request.POST.get('city')
            if 'province_state' in request.POST:
                user_data.province_state = request.POST.get('province_state')
            if 'postal_zip' in request.POST:
                user_data.postal_zip = request.POST.get('postal_zip')
            if 'country' in request.POST:
                user_data.country = request.POST.get('country')
            if 'timezone' in request.POST:
                user_data.timezone = request.POST.get('timezone')
            user_data.save()
            messages.success(request, 'Profile updated successfully')
            
        elif tab == 'signature':
            # Handle signature upload
            if 'signature' in request.FILES:
                # Save uploaded signature file
                signature_file = request.FILES['signature']
                # Create signatures directory if it doesn't exist
                signatures_dir = os.path.join(django_settings.MEDIA_ROOT, 'signatures')
                os.makedirs(signatures_dir, exist_ok=True)
                
                # Generate filename
                file_ext = os.path.splitext(signature_file.name)[1]
                filename = f"{user_data.email.replace('@', '_at_')}_signature{file_ext}"
                filepath = os.path.join(signatures_dir, filename)
                
                # Save file
                with open(filepath, 'wb+') as destination:
                    for chunk in signature_file.chunks():
                        destination.write(chunk)
                
                # Update user's signature_file_name
                user_data.signature_file_name = filename
                user_data.save()
                messages.success(request, 'Signature uploaded successfully')
                
            elif 'signature_type' in request.POST and request.POST.get('signature_type') == 'typed':
                # Handle typed signature - generate image from text
                typed_name = request.POST.get('typed_name')
                signature_font = request.POST.get('signature_font', 'Dancing Script')
                
                if typed_name:
                    try:
                        # Create image with signature text
                        from PIL import Image, ImageDraw, ImageFont
                        import textwrap
                        
                        # Create image
                        img = Image.new('RGB', (400, 100), color='white')
                        draw = ImageDraw.Draw(img)
                        
                        # Try to use the selected font, fallback to default
                        try:
                            # Try to load font (you may need to install fonts)
                            font = ImageFont.truetype(f"/System/Library/Fonts/Supplemental/{signature_font}.ttf", 40)
                        except:
                            font = ImageFont.load_default()
                        
                        # Draw text
                        draw.text((10, 30), typed_name, fill='black', font=font)
                        
                        # Save image
                        signatures_dir = os.path.join(django_settings.MEDIA_ROOT, 'signatures')
                        os.makedirs(signatures_dir, exist_ok=True)
                        filename = f"{user_data.email.replace('@', '_at_')}_signature_typed.png"
                        filepath = os.path.join(signatures_dir, filename)
                        img.save(filepath)
                        
                        # Update user's signature_file_name
                        user_data.signature_file_name = filename
                        user_data.save()
                        messages.success(request, 'Signature generated successfully')
                    except Exception as e:
                        messages.error(request, f'Error generating signature: {str(e)}')
        
        elif tab == 'appearance':
            # Update theme
            if 'theme' in request.POST:
                user_data.theme = request.POST.get('theme')
                user_data.save()
                messages.success(request, 'Theme updated successfully')
        
        return redirect('admin_user_settings')
    
    # GET request - display settings page
    # Get user profile based on their role
    user_role = None
    user_data = None
    
    if hasattr(request.user, 'admin_profile'):
        user_role = 'admin'
        user_data = request.user.admin_profile
    elif hasattr(request.user, 'landlord_profile'):
        user_role = 'landlord'
        user_data = request.user.landlord_profile
    elif hasattr(request.user, 'tenant_profile'):
        user_role = 'tenant'
        user_data = request.user.tenant_profile
    elif hasattr(request.user, 'pmc_profile'):
        user_role = 'pmc'
        user_data = request.user.pmc_profile
    
    # Get signature if available
    signature_url = None
    if user_data and hasattr(user_data, 'signature_file_name') and user_data.signature_file_name:
        # Construct signature URL (adjust based on your media setup)
        signature_url = f"/media/signatures/{user_data.signature_file_name}"
    
    # Get theme preference
    theme = 'default'
    if user_data and hasattr(user_data, 'theme'):
        theme = user_data.theme or 'default'
    
    context = {
        'user_role': user_role,
        'user_data': user_data,
        'signature_url': signature_url,
        'theme': theme,
    }
    # Use admin base template for admin users
    return render(request, 'frontend/admin/user_settings.html', context)


@login_required
def admin_security(request):
    """Security center page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    # For now, we'll show placeholder data
    # In production, you'd track failed logins and active sessions
    failed_logins = []
    sessions = []
    stats = {
        'failedLogins24h': 0,
        'activeSessions': 0,
    }
    
    context = {
        'failed_logins': failed_logins,
        'sessions': sessions,
        'stats': stats,
    }
    return render(request, 'frontend/admin/security.html', context)


@login_required
def admin_api_keys(request):
    """API keys management page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    # For now, we'll use a simple approach
    # In production, you'd have an APIKey model
    api_keys = []
    
    context = {
        'api_keys': api_keys,
    }
    return render(request, 'frontend/admin/api_keys.html', context)


@login_required
def admin_database(request):
    """Database management page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from domains.landlord.models import Landlord
    from domains.tenant.models import Tenant
    from domains.property.models import Property
    from domains.lease.models import Lease
    from domains.document.models import Document
    from domains.maintenance.models import MaintenanceRequest
    
    stats = {
        'landlords': Landlord.objects.count(),
        'tenants': Tenant.objects.count(),
        'properties': Property.objects.count(),
        'leases': Lease.objects.count(),
        'documents': Document.objects.count(),
        'maintenanceRequests': MaintenanceRequest.objects.count(),
    }
    
    context = {
        'stats': stats,
    }
    return render(request, 'frontend/admin/database.html', context)


@login_required
def admin_content(request):
    """Content management page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    # For now, we'll use a simple approach
    # In production, you might have a Content model
    content_items = []
    
    context = {
        'content_items': content_items,
    }
    return render(request, 'frontend/admin/content.html', context)


@login_required
def admin_data_export(request):
    """Data export page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    # Export types available
    export_types = [
        ('properties', 'Properties'),
        ('tenants', 'Tenants'),
        ('landlords', 'Landlords'),
        ('leases', 'Leases'),
        ('payments', 'Payments'),
        ('maintenance', 'Maintenance Requests'),
        ('documents', 'Documents'),
        ('all', 'All Data'),
    ]
    
    context = {
        'export_types': export_types,
    }
    return render(request, 'frontend/admin/data_export.html', context)


@login_required
def admin_notifications(request):
    """Notifications management page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from domains.notification.models import Notification
    # For announcements, we'll use a simple approach
    # In production, you might have a separate Announcement model
    announcements = []
    
    context = {
        'announcements': announcements,
    }
    return render(request, 'frontend/admin/notifications.html', context)


@login_required
def admin_user_activity(request):
    """User activity page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from domains.rbac.models import AdminAuditLog
    from domains.activity.models import UserActivity
    from django.db.models import Q
    from datetime import datetime, timedelta
    
    # Get filter params
    user_role = request.GET.get('userRole', '')
    action_filter = request.GET.get('action', '')
    start_date = request.GET.get('startDate', '')
    end_date = request.GET.get('endDate', '')
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 50))
    
    # Build query - combine AdminAuditLog and UserActivity
    activities = []
    
    # Get admin audit logs
    admin_logs = AdminAuditLog.objects.all()
    if user_role:
        # Filter by role if needed
        pass
    if action_filter:
        admin_logs = admin_logs.filter(action__icontains=action_filter)
    
    # Convert to activity format
    for log in admin_logs[:limit]:
        activities.append({
            'id': log.id,
            'userName': log.admin.full_name if log.admin else 'System',
            'userEmail': log.admin.email if log.admin else 'system@admin.local',
            'userRole': 'admin',
            'action': log.action,
            'resource': log.resource,
            'ipAddress': None,
            'createdAt': log.created_at,
        })
    
    # Get stats
    last_24h = datetime.now() - timedelta(days=1)
    stats = {
        'last24Hours': AdminAuditLog.objects.filter(created_at__gte=last_24h).count(),
        'last7Days': AdminAuditLog.objects.filter(created_at__gte=datetime.now() - timedelta(days=7)).count(),
        'last30Days': AdminAuditLog.objects.filter(created_at__gte=datetime.now() - timedelta(days=30)).count(),
    }
    
    context = {
        'activities': activities,
        'stats': stats,
        'user_role': user_role,
        'action_filter': action_filter,
        'page': page,
        'limit': limit,
    }
    return render(request, 'frontend/admin/user_activity.html', context)


@login_required
def admin_support_tickets(request):
    """Support tickets page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from domains.support.models import SupportTicket
    from django.db.models import Q
    
    # Get filter params
    status_filter = request.GET.get('status', '')
    priority_filter = request.GET.get('priority', '')
    search_query = request.GET.get('search', '')
    try:
        page = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        limit = max(1, min(100, int(request.GET.get('limit', 50))))
    except (ValueError, TypeError):
        limit = 50
    
    # Build query
    tickets_qs = SupportTicket.objects.all()
    
    if status_filter:
        tickets_qs = tickets_qs.filter(status=status_filter)
    if priority_filter:
        tickets_qs = tickets_qs.filter(priority=priority_filter)
    if search_query:
        tickets_qs = tickets_qs.filter(
            Q(subject__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(ticket_number__icontains=search_query)
        )
    
    # Paginate
    total = tickets_qs.count()
    # Use Django Paginator for proper error handling
    from django.core.paginator import Paginator
    paginator = Paginator(tickets_qs.order_by('-created_at'), limit)
    try:
        page_obj = paginator.page(page)
        tickets = list(page_obj.object_list)
    except:
        page_obj = paginator.page(1)
        tickets = list(page_obj.object_list)
        page = 1
    
    context = {
        'tickets': tickets,
        'status_filter': status_filter,
        'priority_filter': priority_filter,
        'search_query': search_query,
        'page': page,
        'limit': limit,
        'total': total,
        'total_pages': paginator.num_pages,
        'page_obj': page_obj,
    }
    return render(request, 'frontend/admin/support_tickets.html', context)


@login_required
def admin_verifications(request):
    """Verifications page - matches React app functionality"""
    if not check_admin_access(request.user):
        return redirect('/')
    
    from domains.verification.models import UnifiedVerification
    from django.db.models import Count, Q
    
    # Get filter params
    active_tab = request.GET.get('tab', 'all')
    verification_type = request.GET.get('type', '')
    status_filter = request.GET.get('status', '')
    search_query = request.GET.get('search', '')
    try:
        page = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        limit = max(1, min(100, int(request.GET.get('limit', 50))))
    except (ValueError, TypeError):
        limit = 50
    
    # Build query
    # Note: UnifiedVerification uses CharField for requested_by, not ForeignKey
    verifications_qs = UnifiedVerification.objects.all()
    
    # Tab filtering
    if active_tab == 'pending':
        verifications_qs = verifications_qs.filter(status='PENDING')
    elif active_tab == 'verified':
        verifications_qs = verifications_qs.filter(status='VERIFIED')
    elif active_tab == 'rejected':
        verifications_qs = verifications_qs.filter(status='REJECTED')
    
    # Additional filters
    if verification_type:
        verifications_qs = verifications_qs.filter(verification_type=verification_type)
    if status_filter:
        verifications_qs = verifications_qs.filter(status=status_filter)
    if search_query:
        verifications_qs = verifications_qs.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    
    # Get stats
    stats = {
        'pending': UnifiedVerification.objects.filter(status='PENDING').count(),
        'verified': UnifiedVerification.objects.filter(status='VERIFIED').count(),
        'rejected': UnifiedVerification.objects.filter(status='REJECTED').count(),
        'expired': UnifiedVerification.objects.filter(status='EXPIRED').count(),
        'total': UnifiedVerification.objects.count(),
    }
    
    # Paginate
    total = verifications_qs.count()
    # Use Django Paginator for proper error handling
    from django.core.paginator import Paginator
    paginator = Paginator(verifications_qs.order_by('-requested_at'), limit)
    try:
        page_obj = paginator.page(page)
        verifications = list(page_obj.object_list)
    except:
        page_obj = paginator.page(1)
        verifications = list(page_obj.object_list)
        page = 1
    
    context = {
        'verifications': verifications,
        'stats': stats,
        'active_tab': active_tab,
        'verification_type': verification_type,
        'status_filter': status_filter,
        'search_query': search_query,
        'page': page,
        'limit': limit,
        'total': total,
        'total_pages': paginator.num_pages,
        'page_obj': page_obj,
    }
    return render(request, 'frontend/admin/verifications.html', context)
