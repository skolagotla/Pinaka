"""
Tax Reporting Views - T776 Tax Forms
"""
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime
from domains.property.models import Property
from domains.lease.models import Lease
from domains.payment.models import RentPayment
from domains.maintenance.models import MaintenanceRequest


@login_required
def tax_reporting(request):
    """Tax Reporting page - T776 form generation"""
    year = request.GET.get('year', timezone.now().year)
    
    try:
        year = int(year)
    except (ValueError, TypeError):
        year = timezone.now().year
    
    # Get all properties for the user (landlord)
    # Note: This assumes user is a landlord - you'd need to check user role
    properties = Property.objects.all()  # Filter by landlord in real implementation
    
    # Calculate tax data for each property
    tax_data = []
    total_rent = 0
    total_expenses = 0
    
    for property_obj in properties:
        # Get rent income for the year
        rent_payments = RentPayment.objects.filter(
            lease__unit__property=property_obj,
            paid_date__year=year,
            status='PAID'
        )
        property_rent = rent_payments.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Get expenses for the year (maintenance, etc.)
        # Note: You'd need an Expense model for full expense tracking
        expenses = 0  # Placeholder - would calculate from Expense model
        
        net_income = property_rent - expenses
        
        tax_data.append({
            'property': property_obj,
            'rent_income': property_rent,
            'expenses': expenses,
            'net_income': net_income,
        })
        
        total_rent += property_rent
        total_expenses += expenses
    
    total_net_income = total_rent - total_expenses
    
    context = {
        'year': year,
        'tax_data': tax_data,
        'total_rent': total_rent,
        'total_expenses': total_expenses,
        'total_net_income': total_net_income,
        'years': range(timezone.now().year - 5, timezone.now().year + 1),
    }
    return render(request, 'frontend/financials/tax_reporting.html', context)

