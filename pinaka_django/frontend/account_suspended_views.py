"""
Account Suspended Views
"""
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from domains.pmc.models import PropertyManagementCompany


@login_required
def account_suspended(request):
    """Account suspended page"""
    user_email = request.user.email
    
    # Check user status
    user = None
    user_type = None
    
    try:
        landlord = Landlord.objects.get(email=user_email)
        if landlord.approval_status == 'SUSPENDED':
            user = landlord
            user_type = 'landlord'
    except Landlord.DoesNotExist:
        pass
    
    if not user:
        try:
            tenant = Tenant.objects.get(email=user_email)
            if tenant.approval_status == 'SUSPENDED':
                user = tenant
                user_type = 'tenant'
        except Tenant.DoesNotExist:
            pass
    
    if not user:
        try:
            pmc = PropertyManagementCompany.objects.get(email=user_email)
            if pmc.approval_status == 'SUSPENDED':
                user = pmc
                user_type = 'pmc'
        except PropertyManagementCompany.DoesNotExist:
            pass
    
    # If user doesn't exist or is not suspended, redirect
    if not user:
        return redirect('/dashboard')
    
    context = {
        'user': user,
        'user_type': user_type,
    }
    return render(request, 'frontend/account_suspended/index.html', context)

