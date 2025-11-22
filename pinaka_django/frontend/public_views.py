"""
Public Views - Homepage, Rent Listings, Success Pages
"""
from django.shortcuts import render
from domains.property.models import Property, Unit
from domains.lease.models import Lease


def homepage_rent(request):
    """Public rent listing page"""
    # Get available units
    available_units = Unit.objects.filter(
        status='VACANT'
    ).select_related('property').order_by('-created_at')[:20]
    
    context = {
        'available_units': available_units,
    }
    return render(request, 'frontend/public/rent_listings.html', context)


def success_page(request):
    """Success confirmation page"""
    message = request.GET.get('message', 'Operation completed successfully!')
    context = {
        'message': message,
    }
    return render(request, 'frontend/public/success.html', context)

