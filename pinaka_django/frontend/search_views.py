"""
Global Search Views
"""
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from domains.property.models import Property
from domains.tenant.models import Tenant
from domains.lease.models import Lease
from domains.payment.models import RentPayment
from domains.maintenance.models import MaintenanceRequest
from domains.document.models import Document


@login_required
def global_search(request):
    """Global search endpoint - returns JSON for AJAX"""
    query = request.GET.get('q', '').strip()
    
    if not query or len(query) < 2:
        return JsonResponse({'success': True, 'results': []})
    
    results = []
    
    # Search Properties
    properties = Property.objects.filter(
        Q(property_name__icontains=query) |
        Q(address_line1__icontains=query) |
        Q(city__icontains=query)
    )[:5]
    for prop in properties:
        results.append({
            'type': 'property',
            'id': str(prop.id),
            'title': prop.property_name,
            'subtitle': f"{prop.address_line1}, {prop.city}",
            'url': f'/properties/{prop.id}/',
            'icon': '🏠',
        })
    
    # Search Tenants
    tenants = Tenant.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(email__icontains=query)
    )[:5]
    for tenant in tenants:
        results.append({
            'type': 'tenant',
            'id': str(tenant.id),
            'title': f"{tenant.first_name} {tenant.last_name}",
            'subtitle': tenant.email,
            'url': f'/tenants/{tenant.id}/',
            'icon': '👤',
        })
    
    # Search Leases
    leases = Lease.objects.filter(
        Q(id__icontains=query)
    ).select_related('unit', 'unit__property')[:5]
    for lease in leases:
        results.append({
            'type': 'lease',
            'id': str(lease.id),
            'title': f"Lease {lease.id[:8]}",
            'subtitle': f"{lease.unit.property.property_name} - {lease.unit.unit_name}",
            'url': f'/leases/{lease.id}/',
            'icon': '📄',
        })
    
    # Search Maintenance Requests
    maintenance = MaintenanceRequest.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query)
    )[:5]
    for maint in maintenance:
        results.append({
            'type': 'maintenance',
            'id': str(maint.id),
            'title': maint.title,
            'subtitle': maint.status,
            'url': f'/operations?tab=maintenance&id={maint.id}',
            'icon': '🔧',
        })
    
    return JsonResponse({'success': True, 'results': results})

