"""
Pending Approval Views - User feedback during approval process
"""
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from domains.pmc.models import PropertyManagementCompany


@login_required
def pending_approval(request):
    """Pending approval page - shown to users waiting for admin approval"""
    user_email = request.user.email
    
    # Check user status
    user = None
    user_type = None
    approval_status = None
    
    # Check landlord
    try:
        landlord = Landlord.objects.get(email=user_email)
        user = landlord
        user_type = 'landlord'
        approval_status = landlord.approval_status
    except Landlord.DoesNotExist:
        pass
    
    # Check tenant
    if not user:
        try:
            tenant = Tenant.objects.get(email=user_email)
            user = tenant
            user_type = 'tenant'
            approval_status = tenant.approval_status
        except Tenant.DoesNotExist:
            pass
    
    # Check PMC
    if not user:
        try:
            pmc = PropertyManagementCompany.objects.get(email=user_email)
            user = pmc
            user_type = 'pmc'
            approval_status = pmc.approval_status
        except PropertyManagementCompany.DoesNotExist:
            pass
    
    # If user doesn't exist or is already approved, redirect
    if not user:
        return redirect('/')
    
    if approval_status == 'APPROVED':
        return redirect('/dashboard')
    
    # If rejected, show rejection message
    if approval_status == 'REJECTED':
        return render(request, 'frontend/pending_approval/rejected.html', {
            'user': user,
            'user_type': user_type,
        })
    
    # Show pending approval page
    context = {
        'user': user,
        'user_type': user_type,
        'approval_status': approval_status,
    }
    return render(request, 'frontend/pending_approval/index.html', context)

