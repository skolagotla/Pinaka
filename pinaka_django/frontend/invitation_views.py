"""
Invitation Views - Accept Invitation and Complete Registration
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from domains.invitation.models import Invitation
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from domains.pmc.models import PropertyManagementCompany
from domains.service_provider.models import ServiceProvider
import uuid


def accept_invitation(request):
    """Accept invitation page - public access"""
    token = request.GET.get('token')
    
    if not token:
        return render(request, 'frontend/invitation/error.html', {
            'error': 'Invalid invitation link. No token provided.'
        })
    
    try:
        invitation = Invitation.objects.get(token=token)
    except Invitation.DoesNotExist:
        return render(request, 'frontend/invitation/error.html', {
            'error': 'Invalid invitation link. This invitation does not exist or has expired.'
        })
    
    # Check if invitation is expired
    if invitation.is_expired:
        return render(request, 'frontend/invitation/error.html', {
            'error': 'This invitation has expired. Please contact the person who invited you for a new invitation.'
        })
    
    # Check if already completed
    if invitation.status == 'completed':
        return render(request, 'frontend/invitation/success.html', {
            'invitation': invitation,
            'message': 'This invitation has already been accepted.'
        })
    
    # Handle POST - form submission
    if request.method == 'POST':
        form_data = request.POST
        
        try:
            if invitation.invitation_type == 'landlord':
                # Create landlord
                landlord = Landlord.objects.create(
                    email=invitation.email,
                    first_name=form_data.get('firstName', ''),
                    last_name=form_data.get('lastName', ''),
                    phone=form_data.get('phone', ''),
                    address_line1=form_data.get('addressLine1', ''),
                    city=form_data.get('city', ''),
                    province_state=form_data.get('provinceState', ''),
                    postal_zip=form_data.get('postalZip', ''),
                    country=form_data.get('country', 'CA'),
                    approval_status='PENDING',
                )
                invitation.landlord_id = str(landlord.id)
                
            elif invitation.invitation_type == 'tenant':
                # Create tenant
                tenant = Tenant.objects.create(
                    email=invitation.email,
                    first_name=form_data.get('firstName', ''),
                    last_name=form_data.get('lastName', ''),
                    phone=form_data.get('phone', ''),
                    current_address=form_data.get('currentAddress', ''),
                    city=form_data.get('city', ''),
                    province_state=form_data.get('provinceState', ''),
                    postal_zip=form_data.get('postalZip', ''),
                    country=form_data.get('country', 'CA'),
                    date_of_birth=form_data.get('dateOfBirth') or None,
                    approval_status='PENDING',
                )
                invitation.tenant_id = str(tenant.id)
                
            elif invitation.invitation_type == 'pmc':
                # Create PMC
                pmc = PropertyManagementCompany.objects.create(
                    email=invitation.email,
                    company_name=form_data.get('companyName', ''),
                    phone=form_data.get('phone', ''),
                    address_line1=form_data.get('addressLine1', ''),
                    city=form_data.get('city', ''),
                    province_state=form_data.get('provinceState', ''),
                    postal_zip=form_data.get('postalZip', ''),
                    country=form_data.get('country', 'CA'),
                    default_commission_rate=float(form_data.get('defaultCommissionRate', 0) or 0),
                    approval_status='PENDING',
                )
                invitation.pmc_id = str(pmc.id)
                
            elif invitation.invitation_type in ['vendor', 'contractor']:
                # Create service provider
                provider = ServiceProvider.objects.create(
                    provider_id=f"{invitation.invitation_type.upper()}-{uuid.uuid4().hex[:8].upper()}",
                    provider_type=invitation.invitation_type,
                    company_name=form_data.get('companyName', ''),
                    contact_name=form_data.get('contactName', ''),
                    email=invitation.email,
                    phone=form_data.get('phone', ''),
                    address_line1=form_data.get('addressLine1', ''),
                    city=form_data.get('city', ''),
                    province_state=form_data.get('provinceState', ''),
                    postal_zip=form_data.get('postalZip', ''),
                    country=form_data.get('country', 'CA'),
                    services=[form_data.get('services', '')] if invitation.invitation_type == 'vendor' else [],
                    specialties=form_data.get('specialties', '').split(',') if invitation.invitation_type == 'contractor' else [],
                    license_number=form_data.get('licenseNumber', ''),
                    approval_status='PENDING',
                )
                invitation.service_provider_id = str(provider.id)
            
            # Update invitation status
            invitation.status = 'completed'
            invitation.completed_at = timezone.now()
            invitation.save()
            
            return render(request, 'frontend/invitation/success.html', {
                'invitation': invitation,
                'message': 'Your profile has been created successfully! You will be notified once your account is approved.'
            })
            
        except Exception as e:
            return render(request, 'frontend/invitation/error.html', {
                'error': f'Error creating profile: {str(e)}'
            })
    
    # GET - show form
    return render(request, 'frontend/invitation/accept.html', {
        'invitation': invitation,
    })


def complete_registration(request):
    """Complete registration page - for Auth0 users"""
    # This would typically check Auth0 session
    # For now, redirect to accept invitation if token provided
    token = request.GET.get('token')
    if token:
        return redirect(f'/accept-invitation/?token={token}')
    
    return render(request, 'frontend/invitation/complete_registration.html', {
        'error': 'No invitation token provided. Please use the invitation link sent to your email.'
    })

