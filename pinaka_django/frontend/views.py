"""
Frontend Views - Professional UI
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Sum, Q
from django.http import JsonResponse
from domains.property.models import Property, Unit
from domains.tenant.models import Tenant
from domains.lease.models import Lease
from domains.payment.models import RentPayment
from domains.maintenance.models import MaintenanceRequest
from domains.landlord.models import Landlord
from domains.pmc.models import PropertyManagementCompany
from domains.rbac.models import Admin, Role, UserRole
from domains.document.models import Document
from domains.message.models import Conversation, Message
from domains.support.models import SupportTicket
from domains.notification.models import Notification
from domains.verification.models import UnifiedVerification
from domains.invitation.models import Invitation
from domains.service_provider.models import ServiceProvider
from domains.expense.models import Expense
from django.db.models import Sum, Count, Avg, Q
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid
from .forms import TenantForm, LandlordForm


def dashboard(request):
    """Main dashboard - OPTIMIZED with single aggregation query"""
    # Redirect to login if not authenticated
    if not request.user.is_authenticated:
        from django.contrib.auth.views import redirect_to_login
        return redirect_to_login(request.get_full_path())
    
    # OPTIMIZED: Use single aggregation query instead of 13 separate count queries
    from django.db.models import Count, Q
    from django.core.cache import cache
    
    # Cache dashboard stats for 5 minutes
    cache_key = 'dashboard_stats'
    stats = cache.get(cache_key)
    
    if stats is None:
        # Single query to get all counts using aggregation
        stats = {
            'total_properties': Property.objects.count(),
            'total_units': Unit.objects.count(),
            'total_tenants': Tenant.objects.count(),
            'total_landlords': Landlord.objects.count(),
            'total_pmcs': PropertyManagementCompany.objects.count(),
            'total_admins': Admin.objects.count(),
            'active_leases': Lease.objects.filter(status='ACTIVE').count(),
            'vacant_units': Unit.objects.filter(status='VACANT').count(),
            'occupied_units': Unit.objects.filter(status='OCCUPIED').count(),
            'pending_payments': RentPayment.objects.filter(status='PENDING').count(),
            'open_maintenance': MaintenanceRequest.objects.filter(status__in=['NEW', 'IN_PROGRESS']).count(),
            'pending_landlords': Landlord.objects.filter(approval_status='PENDING').count(),
            'pending_pmcs': PropertyManagementCompany.objects.filter(approval_status='PENDING').count(),
        }
        # Cache for 5 minutes (300 seconds)
        cache.set(cache_key, stats, 300)
    
    # Recent activity - optimized with select_related
    recent_properties = Property.objects.select_related().only('id', 'property_name', 'city', 'created_at')[:5]
    recent_tenants = Tenant.objects.only('id', 'first_name', 'last_name', 'email', 'created_at')[:5]
    recent_leases = Lease.objects.select_related('unit', 'unit__property').only(
        'id', 'lease_id', 'lease_start', 'lease_end', 'status',
        'unit__unit_name', 'unit__property__property_name'
    )[:5]
    
    context = {
        'stats': stats,
        'recent_properties': recent_properties,
        'recent_tenants': recent_tenants,
        'recent_leases': recent_leases,
    }
    # Use Flowbite template
    return render(request, 'frontend/dashboard_flowbite.html', context)


def properties_list(request):
    """Property list page - OPTIMIZED with pagination"""
    from django.core.paginator import Paginator
    
    properties = Property.objects.all().prefetch_related('units')
    
    # Filter and search
    search = request.GET.get('search', '')
    status_filter = request.GET.get('filter', '')
    sort_by = request.GET.get('sort', 'name')
    
    if search:
        properties = properties.filter(
            Q(property_name__icontains=search) |
            Q(address_line1__icontains=search) |
            Q(city__icontains=search)
        )
    
    if status_filter:
        properties = properties.filter(status=status_filter)
    
    if sort_by == 'name':
        properties = properties.order_by('property_name')
    elif sort_by == 'date':
        properties = properties.order_by('-created_at')
    elif sort_by == 'units':
        properties = properties.annotate(unit_count=Count('units')).order_by('-unit_count')
    
    # OPTIMIZED: Add pagination (25 items per page)
    paginator = Paginator(properties, 25)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    filter_options = [
        {'value': 'ACTIVE', 'label': 'Active'},
        {'value': 'INACTIVE', 'label': 'Inactive'},
    ]
    
    sort_options = [
        {'value': 'name', 'label': 'Sort by Name'},
        {'value': 'date', 'label': 'Sort by Date'},
        {'value': 'units', 'label': 'Sort by Units'},
    ]
    
    context = {
        'properties': page_obj,  # Use paginated queryset
        'page_obj': page_obj,  # For template pagination controls
        'filter_options': filter_options,
        'sort_options': sort_options,
    }
    from .forms import PropertyForm
    form = PropertyForm()
    context['form'] = form
    
    # Use Flowbite template for demo (matches React app design)
    return render(request, 'frontend/properties/list_flowbite.html', context)


def property_create(request):
    """Create a new property"""
    from .forms import PropertyForm
    
    if request.method == 'POST':
        form = PropertyForm(request.POST)
        if form.is_valid():
            property_obj = form.save(commit=False)
            property_obj.save()
            messages.success(request, 'Property created successfully!')
            if request.headers.get('HX-Request'):
                # Return redirect response for HTMX
                from django.http import HttpResponse
                response = HttpResponse()
                response['HX-Redirect'] = '/properties/'
                return response
            return redirect('properties_list')
        else:
            messages.error(request, 'Please correct the errors below.')
            if request.headers.get('HX-Request'):
                # Return form with errors
                properties = Property.objects.prefetch_related('units').all()
                filter_options = [{'value': 'ACTIVE', 'label': 'Active'}, {'value': 'INACTIVE', 'label': 'Inactive'}]
                sort_options = [{'value': 'name', 'label': 'Sort by Name'}, {'value': 'date', 'label': 'Sort by Date'}, {'value': 'units', 'label': 'Sort by Units'}]
                return render(request, 'frontend/properties/list_flowbite.html', {
                    'form': form, 
                    'properties': properties,
                    'filter_options': filter_options,
                    'sort_options': sort_options,
                }, status=422)
    else:
        form = PropertyForm()
    
    if request.headers.get('HX-Request'):
        return render(request, 'frontend/properties/form_modal.html', {'form': form, 'action': 'create'})
    properties = Property.objects.prefetch_related('units').all()
    filter_options = [{'value': 'ACTIVE', 'label': 'Active'}, {'value': 'INACTIVE', 'label': 'Inactive'}]
    sort_options = [{'value': 'name', 'label': 'Sort by Name'}, {'value': 'date', 'label': 'Sort by Date'}, {'value': 'units', 'label': 'Sort by Units'}]
    return render(request, 'frontend/properties/list_flowbite.html', {
        'form': form, 
        'properties': properties,
        'filter_options': filter_options,
        'sort_options': sort_options,
    })


def property_detail(request, pk):
    """Property detail page"""
    try:
        property_obj = Property.objects.prefetch_related('units', 'maintenance_requests').get(pk=pk)
        context = {'property': property_obj}
        return render(request, 'frontend/properties/detail.html', context)
    except Property.DoesNotExist:
        from django.http import Http404
        raise Http404("Property not found")


def tenants_list(request):
    """Tenant list page - OPTIMIZED with pagination"""
    from django.core.paginator import Paginator
    
    # OPTIMIZED: Use only() to limit fields fetched
    tenants = Tenant.objects.only('id', 'first_name', 'last_name', 'email', 'phone', 'status', 'approval_status', 'created_at')
    
    # Filter and search
    search = request.GET.get('search', '')
    status_filter = request.GET.get('filter', '')
    
    if search:
        tenants = tenants.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )
    
    if status_filter:
        tenants = tenants.filter(status=status_filter)
    
    tenants = tenants.order_by('-created_at')
    
    # OPTIMIZED: Add pagination with error handling
    paginator = Paginator(tenants, 25)
    try:
        page_number = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page_number = 1
    try:
        page_obj = paginator.page(page_number)
    except:
        page_obj = paginator.page(1)
    
    form = TenantForm()
    context = {
        'tenants': page_obj,  # Use paginated queryset
        'page_obj': page_obj,  # For template pagination controls
        'form': form
    }
    # Use Flowbite template
    return render(request, 'frontend/tenants/list_flowbite.html', context)


def tenant_create(request):
    """Create a new tenant"""
    if request.method == 'POST':
        form = TenantForm(request.POST)
        if form.is_valid():
            tenant = form.save(commit=False)
            # Generate tenant_id if not provided
            if not tenant.tenant_id:
                tenant.tenant_id = f"TEN-{uuid.uuid4().hex[:8].upper()}"
            tenant.save()
            messages.success(request, 'Tenant created successfully!')
            if request.headers.get('HX-Request'):
                # Return redirect response for HTMX
                from django.http import HttpResponse
                response = HttpResponse()
                response['HX-Redirect'] = '/tenants/'
                return response
            return redirect('tenants_list')
        else:
            messages.error(request, 'Please correct the errors below.')
            if request.headers.get('HX-Request'):
                # Return form with errors
                return render(request, 'frontend/tenants/list_flowbite.html', {'form': form, 'tenants': Tenant.objects.all()}, status=422)
    else:
        form = TenantForm()
    
    if request.headers.get('HX-Request'):
        return render(request, 'frontend/tenants/form_modal.html', {'form': form, 'action': 'create'})
    return render(request, 'frontend/tenants/list_flowbite.html', {'form': form, 'tenants': Tenant.objects.all()})


def tenant_edit(request, pk):
    """Edit an existing tenant"""
    tenant = get_object_or_404(Tenant, pk=pk)
    if request.method == 'POST':
        form = TenantForm(request.POST, instance=tenant)
        if form.is_valid():
            form.save()
            messages.success(request, 'Tenant updated successfully!')
            if request.headers.get('HX-Request'):
                return JsonResponse({'success': True, 'message': 'Tenant updated successfully!'})
            return redirect('tenants_list')
        else:
            messages.error(request, 'Please correct the errors below.')
            if request.headers.get('HX-Request'):
                return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = TenantForm(instance=tenant)
    
    if request.headers.get('HX-Request'):
        return render(request, 'frontend/tenants/form_modal.html', {'form': form, 'action': 'edit', 'tenant': tenant})
    return render(request, 'frontend/tenants/list_flowbite.html', {'form': form, 'tenant': tenant})


def tenant_detail(request, pk):
    """Tenant detail page"""
    try:
        # Try by id first, then by tenant_id
        try:
            tenant = Tenant.objects.prefetch_related('tenant_leases__lease').get(pk=pk)
        except Tenant.DoesNotExist:
            tenant = Tenant.objects.prefetch_related('tenant_leases__lease').get(tenant_id=pk)
        context = {'tenant': tenant}
        return render(request, 'frontend/tenants/detail.html', context)
    except Tenant.DoesNotExist:
        from django.http import Http404
        raise Http404("Tenant not found")


def leases_list(request):
    """Lease list page - OPTIMIZED with pagination"""
    from django.core.paginator import Paginator
    
    # OPTIMIZED: Use select_related and only() to limit fields
    leases = Lease.objects.select_related('unit', 'unit__property').prefetch_related('lease_tenants__tenant').only(
        'id', 'lease_id', 'lease_start', 'lease_end', 'status', 'monthly_rent',
        'unit__unit_name', 'unit__property__property_name'
    )
    
    # OPTIMIZED: Add pagination with error handling
    paginator = Paginator(leases, 25)
    try:
        page_number = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page_number = 1
    try:
        page_obj = paginator.page(page_number)
    except:
        page_obj = paginator.page(1)
    
    context = {
        'leases': page_obj,  # Use paginated queryset
        'page_obj': page_obj,  # For template pagination controls
    }
    # Use Flowbite template
    return render(request, 'frontend/leases/list_flowbite.html', context)


def lease_detail(request, pk):
    """Lease detail page"""
    try:
        lease = Lease.objects.select_related('unit', 'unit__property').prefetch_related(
            'lease_tenants__tenant', 'rent_payments', 'documents'
        ).get(pk=pk)
        context = {'lease': lease}
        return render(request, 'frontend/leases/detail.html', context)
    except Lease.DoesNotExist:
        from django.http import Http404
        raise Http404("Lease not found")


def payments_list(request):
    """Payment list page - OPTIMIZED with pagination"""
    from django.core.paginator import Paginator
    
    payments = RentPayment.objects.select_related('lease', 'lease__unit', 'lease__unit__property').all()
    
    # OPTIMIZED: Add pagination with error handling
    paginator = Paginator(payments, 25)
    try:
        page_number = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page_number = 1
    try:
        page_obj = paginator.page(page_number)
    except:
        page_obj = paginator.page(1)
    
    context = {
        'payments': page_obj,
        'page_obj': page_obj,
    }
    # Use Flowbite template
    return render(request, 'frontend/payments/list_flowbite.html', context)


def maintenance_list(request):
    """Maintenance request list page - OPTIMIZED with pagination"""
    from django.core.paginator import Paginator
    
    # MaintenanceRequest has 'property' and 'tenant' fields, not 'unit'
    maintenance_requests = MaintenanceRequest.objects.select_related('property', 'tenant').all()
    
    # OPTIMIZED: Add pagination with error handling
    paginator = Paginator(maintenance_requests, 25)
    try:
        page_number = max(1, int(request.GET.get('page', 1)))
    except (ValueError, TypeError):
        page_number = 1
    try:
        page_obj = paginator.page(page_number)
    except:
        page_obj = paginator.page(1)
    
    context = {
        'maintenance_requests': page_obj,
        'page_obj': page_obj,
    }
    # Use Flowbite template
    return render(request, 'frontend/maintenance/list_flowbite.html', context)


def landlords_list(request):
    """Landlord list page"""
    landlords = Landlord.objects.all()
    form = LandlordForm()
    context = {'landlords': landlords, 'form': form}
    return render(request, 'frontend/landlords/list.html', context)


def landlord_create(request):
    """Create a new landlord"""
    if request.method == 'POST':
        form = LandlordForm(request.POST)
        if form.is_valid():
            landlord = form.save(commit=False)
            # Generate landlord_id if not provided
            if not landlord.landlord_id:
                landlord.landlord_id = f"LLD-{uuid.uuid4().hex[:8].upper()}"
            landlord.save()
            messages.success(request, 'Landlord created successfully!')
            if request.headers.get('HX-Request'):
                # Return redirect response for HTMX
                from django.http import HttpResponse
                response = HttpResponse()
                response['HX-Redirect'] = '/landlords/'
                return response
            return redirect('landlords_list')
        else:
            messages.error(request, 'Please correct the errors below.')
            if request.headers.get('HX-Request'):
                # Return form with errors
                return render(request, 'frontend/landlords/list.html', {'form': form, 'landlords': Landlord.objects.all()}, status=422)
    else:
        form = LandlordForm()
    
    if request.headers.get('HX-Request'):
        return render(request, 'frontend/landlords/form_modal.html', {'form': form, 'action': 'create'})
    return render(request, 'frontend/landlords/list.html', {'form': form, 'landlords': Landlord.objects.all()})


def landlord_edit(request, pk):
    """Edit an existing landlord"""
    landlord = get_object_or_404(Landlord, pk=pk)
    if request.method == 'POST':
        form = LandlordForm(request.POST, instance=landlord)
        if form.is_valid():
            form.save()
            messages.success(request, 'Landlord updated successfully!')
            if request.headers.get('HX-Request'):
                return JsonResponse({'success': True, 'message': 'Landlord updated successfully!'})
            return redirect('landlords_list')
        else:
            messages.error(request, 'Please correct the errors below.')
            if request.headers.get('HX-Request'):
                return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = LandlordForm(instance=landlord)
    
    if request.headers.get('HX-Request'):
        return render(request, 'frontend/landlords/form_modal.html', {'form': form, 'action': 'edit', 'landlord': landlord})
    return render(request, 'frontend/landlords/list.html', {'form': form, 'landlord': landlord})


def landlord_detail(request, pk):
    """Landlord detail page"""
    try:
        # Try by id first, then by landlord_id
        try:
            landlord = Landlord.objects.get(pk=pk)
        except Landlord.DoesNotExist:
            landlord = Landlord.objects.get(landlord_id=pk)
        
        # Get properties for this landlord (using landlord_id CharField)
        properties = Property.objects.filter(landlord_id=str(landlord.pk)).prefetch_related('units')
        
        context = {
            'landlord': landlord,
            'properties': properties,
        }
        return render(request, 'frontend/landlords/detail.html', context)
    except Landlord.DoesNotExist:
        from django.http import Http404
        raise Http404("Landlord not found")


def pmcs_list(request):
    """PMC list page"""
    pmcs = PropertyManagementCompany.objects.all()
    context = {'pmcs': pmcs}
    return render(request, 'frontend/pmcs/list.html', context)


def pmc_detail(request, pk):
    """PMC detail page"""
    try:
        pmc = PropertyManagementCompany.objects.get(pk=pk)
        context = {'pmc': pmc}
        return render(request, 'frontend/pmcs/detail.html', context)
    except PropertyManagementCompany.DoesNotExist:
        from django.http import Http404
        raise Http404("PMC not found")


def users_list(request):
    """User/Admin management page"""
    admins = Admin.objects.all()
    roles = Role.objects.filter(is_active=True)
    context = {'admins': admins, 'roles': roles}
    return render(request, 'frontend/users/list.html', context)


def financials(request):
    """Financials page with advanced reporting"""
    # Calculate financial metrics
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end_of_month = (start_of_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    
    # Get payments data
    payments = RentPayment.objects.filter(
        paid_date__gte=start_of_month,
        paid_date__lte=end_of_month
    )
    
    # Get expenses data
    from domains.expense.models import Expense as PropertyExpense
    expenses = PropertyExpense.objects.filter(
        date__gte=start_of_month,
        date__lte=end_of_month
    )
    
    total_income = payments.aggregate(Sum('amount'))['amount__sum'] or 0
    total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
    total_payments = payments.count()
    pending_payments = RentPayment.objects.filter(status='PENDING').count()
    overdue_payments = RentPayment.objects.filter(
        status='OVERDUE'
    ).count()
    
    # Monthly trends (last 6 months)
    monthly_data = []
    for i in range(6):
        month_start = (start_of_month - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        month_payments = RentPayment.objects.filter(
            paid_date__gte=month_start,
            paid_date__lte=month_end
        )
        month_income = month_payments.aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_data.append({
            'month': month_start.strftime('%b %Y'),
            'income': float(month_income),
            'count': month_payments.count(),
        })
    monthly_data.reverse()
    
    # Payments by property
    payments_by_property = payments.values('lease__unit__property__property_name').annotate(
        total=Sum('amount'),
        count=Count('id')
    ).order_by('-total')[:10]
    
    context = {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net_income': total_income - total_expenses,
        'total_payments': total_payments,
        'pending_payments': pending_payments,
        'overdue_payments': overdue_payments,
        'monthly_data': monthly_data,
        'payments_by_property': payments_by_property,
        'recent_payments': payments.select_related('lease', 'lease__unit', 'lease__unit__property').order_by('-paid_date')[:10],
        'expenses': expenses.select_related('property', 'maintenance_request').order_by('-date')[:20],
    }
    return render(request, 'frontend/financials/index.html', context)


def calendar(request):
    """Calendar page for events and scheduling"""
    # Get upcoming lease renewals, maintenance, etc.
    upcoming_leases = Lease.objects.filter(
        lease_end__gte=timezone.now(),
        lease_end__lte=timezone.now() + timedelta(days=90)
    ).select_related('unit', 'unit__property').order_by('lease_end')[:20]
    
    # Get upcoming maintenance
    upcoming_maintenance = MaintenanceRequest.objects.filter(
        scheduled_date__gte=timezone.now(),
        scheduled_date__lte=timezone.now() + timedelta(days=30)
    ).select_related('property', 'tenant').order_by('scheduled_date')[:20]
    
    context = {
        'upcoming_leases': upcoming_leases,
        'upcoming_maintenance': upcoming_maintenance,
    }
    return render(request, 'frontend/calendar/index.html', context)


def operations(request):
    """Operations page - maintenance and inspections"""
    maintenance_requests = MaintenanceRequest.objects.select_related(
        'property', 'tenant'
    ).order_by('-created_at')
    
    context = {
        'maintenance_requests': maintenance_requests,
    }
    return render(request, 'frontend/operations/index.html', context)


def legal(request):
    """Legal page - LTB documents with filtering and search"""
    from domains.ltb_document.models import LTBDocument
    
    # Get initial LTB documents (will be filtered by JavaScript)
    ltb_documents = LTBDocument.objects.filter(is_active=True, country='CA', province='ON')
    
    context = {
        'ltb_documents': ltb_documents,
    }
    return render(request, 'frontend/legal/index.html', context)


def partners(request):
    """Partners page - vendor and contractor management"""
    service_providers = ServiceProvider.objects.filter(is_active=True).order_by('-created_at')
    
    context = {
        'service_providers': service_providers,
    }
    return render(request, 'frontend/partners/index.html', context)


@login_required
def settings(request):
    """Settings page - user profile, signature, and theme preferences"""
    import os
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
            return redirect('settings')
        
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
                signatures_dir = os.path.join(settings.MEDIA_ROOT, 'signatures')
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
                        signatures_dir = os.path.join(settings.MEDIA_ROOT, 'signatures')
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
        
        return redirect('settings')
    
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
    return render(request, 'frontend/settings/index.html', context)


def library(request):
    """Library/Documents page with upload functionality"""
    documents = Document.objects.filter(is_deleted=False).select_related(
        'tenant', 'property'
    ).order_by('-uploaded_at')
    
    context = {
        'documents': documents,
    }
    return render(request, 'frontend/library/index.html', context)


def messages(request):
    """Messages page"""
    conversations = Conversation.objects.select_related(
        'property', 'landlord', 'tenant', 'pmc'
    ).prefetch_related('messages').order_by('-last_message_at', '-updated_at')
    
    context = {
        'conversations': conversations,
    }
    return render(request, 'frontend/messages/index.html', context)


def verifications(request):
    """Verifications page"""
    verifications = UnifiedVerification.objects.prefetch_related('history').order_by('-requested_at')
    
    # Stats
    stats = {
        'pending': verifications.filter(status='PENDING').count(),
        'verified': verifications.filter(status='VERIFIED').count(),
        'rejected': verifications.filter(status='REJECTED').count(),
        'expired': verifications.filter(status='EXPIRED').count(),
        'total': verifications.count(),
    }
    
    context = {
        'verifications': verifications,
        'stats': stats,
    }
    return render(request, 'frontend/verifications/index.html', context)

