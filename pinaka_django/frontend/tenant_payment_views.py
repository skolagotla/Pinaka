"""
Tenant Payment Views - Tenant-specific payment history
"""
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Q
from django.utils import timezone
from domains.tenant.models import Tenant
from domains.payment.models import RentPayment
from domains.lease.models import Lease


@login_required
def tenant_payments(request):
    """Tenant payments page - shows tenant's payment history"""
    try:
        tenant = Tenant.objects.get(email=request.user.email)
    except Tenant.DoesNotExist:
        return redirect('/')
    
    # Get all leases for this tenant
    leases = Lease.objects.filter(
        leasetenant__tenant=tenant
    ).select_related('unit', 'unit__property')
    
    # Get all payments for this tenant
    payments = RentPayment.objects.filter(
        lease__in=leases
    ).select_related('lease', 'lease__unit', 'lease__unit__property').order_by('-paid_date')
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter:
        payments = payments.filter(status=status_filter)
    
    # Calculate statistics
    total_paid = payments.filter(status='PAID').aggregate(Sum('amount'))['amount__sum'] or 0
    total_pending = payments.filter(status='PENDING').aggregate(Sum('amount'))['amount__sum'] or 0
    total_overdue = payments.filter(status='OVERDUE').aggregate(Sum('amount'))['amount__sum'] or 0
    
    # Group payments by lease
    payments_by_lease = {}
    for payment in payments:
        lease_id = payment.lease.id
        if lease_id not in payments_by_lease:
            payments_by_lease[lease_id] = {
                'lease': payment.lease,
                'payments': []
            }
        payments_by_lease[lease_id]['payments'].append(payment)
    
    context = {
        'tenant': tenant,
        'payments': payments,
        'payments_by_lease': payments_by_lease,
        'total_paid': total_paid,
        'total_pending': total_pending,
        'total_overdue': total_overdue,
        'status_filter': status_filter,
    }
    return render(request, 'frontend/tenant/payments.html', context)

