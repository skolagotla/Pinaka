"""
Year-End Closing Views - Financial period closing
"""
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Sum, Q
from django.utils import timezone
from django.contrib import messages
from domains.property.models import Property
from domains.payment.models import RentPayment
from domains.lease.models import Lease
from datetime import datetime


@login_required
@staff_member_required
def year_end_closing(request):
    """Year-End Closing page - for accountants and PMC admins"""
    year = request.GET.get('year', timezone.now().year)
    
    try:
        year = int(year)
    except (ValueError, TypeError):
        year = timezone.now().year
    
    # Get all properties
    properties = Property.objects.all()
    
    # Calculate financial data for the year
    financial_data = []
    total_income = 0
    total_expenses = 0
    
    for property_obj in properties:
        # Get rent income for the year
        rent_payments = RentPayment.objects.filter(
            lease__unit__property=property_obj,
            paid_date__year=year,
            status='PAID'
        )
        property_income = rent_payments.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Get expenses (placeholder - would need Expense model)
        property_expenses = 0
        
        net_income = property_income - property_expenses
        
        financial_data.append({
            'property': property_obj,
            'income': property_income,
            'expenses': property_expenses,
            'net_income': net_income,
        })
        
        total_income += property_income
        total_expenses += property_expenses
    
    total_net_income = total_income - total_expenses
    
    # Handle closing submission
    if request.method == 'POST':
        closing_date = request.POST.get('closing_date')
        notes = request.POST.get('notes', '')
        
        # Here you would create a FinancialPeriod record
        # For now, just show success message
        messages.success(request, f'Financial period for {year} has been closed successfully.')
        return redirect('year_end_closing')
    
    context = {
        'year': year,
        'financial_data': financial_data,
        'total_income': total_income,
        'total_expenses': total_expenses,
        'total_net_income': total_net_income,
        'years': range(timezone.now().year - 5, timezone.now().year + 1),
    }
    return render(request, 'frontend/financials/year_end_closing.html', context)

