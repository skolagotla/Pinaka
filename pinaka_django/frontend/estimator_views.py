"""
Estimator Views - Rent Estimator Tool
"""
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from domains.tenant.models import Tenant


@login_required
def estimator(request):
    """Rent Estimator page - for tenants"""
    try:
        tenant = Tenant.objects.get(email=request.user.email)
    except Tenant.DoesNotExist:
        return redirect('/')
    
    context = {
        'tenant': tenant,
    }
    return render(request, 'frontend/estimator/index.html', context)

