"""
Checklist Views - Tenant Move-in/Move-out Inspections
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.http import JsonResponse
from domains.inspection.models import InspectionChecklist, InspectionChecklistItem
from domains.tenant.models import Tenant
import json


# Checklist templates
MOVE_IN_CHECKLIST = [
    {'id': 'walls', 'label': 'Walls - Check for holes, cracks, or damage', 'category': 'Interior'},
    {'id': 'floors', 'label': 'Floors - Check for stains, scratches, or damage', 'category': 'Interior'},
    {'id': 'ceiling', 'label': 'Ceiling - Check for water stains or damage', 'category': 'Interior'},
    {'id': 'windows', 'label': 'Windows - Check for cracks, locks, and screens', 'category': 'Interior'},
    {'id': 'doors', 'label': 'Doors - Check locks, handles, and frames', 'category': 'Interior'},
    {'id': 'kitchen', 'label': 'Kitchen - Appliances, cabinets, and fixtures', 'category': 'Interior'},
    {'id': 'bathroom', 'label': 'Bathroom - Fixtures, tiles, and plumbing', 'category': 'Interior'},
    {'id': 'electrical', 'label': 'Electrical - Outlets, switches, and lighting', 'category': 'Interior'},
    {'id': 'heating', 'label': 'Heating/Cooling - HVAC system functionality', 'category': 'Interior'},
    {'id': 'smoke_detector', 'label': 'Smoke Detectors - Test all detectors', 'category': 'Safety'},
    {'id': 'carbon_monoxide', 'label': 'Carbon Monoxide Detectors - Test all detectors', 'category': 'Safety'},
    {'id': 'exterior', 'label': 'Exterior - Building exterior and common areas', 'category': 'Exterior'},
    {'id': 'parking', 'label': 'Parking - Assigned space and condition', 'category': 'Exterior'},
    {'id': 'keys', 'label': 'Keys - All keys received and tested', 'category': 'General'},
    {'id': 'utilities', 'label': 'Utilities - All utilities transferred to tenant', 'category': 'General'},
]

MOVE_OUT_CHECKLIST = [
    {'id': 'clean', 'label': 'All rooms cleaned thoroughly', 'category': 'Cleaning'},
    {'id': 'repairs', 'label': 'All repairs completed (beyond normal wear)', 'category': 'Repairs'},
    {'id': 'personal_items', 'label': 'All personal items removed', 'category': 'General'},
    {'id': 'appliances', 'label': 'Appliances cleaned and in working order', 'category': 'Cleaning'},
    {'id': 'keys_returned', 'label': 'All keys returned to landlord', 'category': 'General'},
    {'id': 'utilities_transferred', 'label': 'Utilities transferred out of tenant name', 'category': 'General'},
    {'id': 'mail_forwarded', 'label': 'Mail forwarding arranged', 'category': 'General'},
    {'id': 'final_inspection', 'label': 'Final inspection scheduled with landlord', 'category': 'General'},
]


@login_required
def checklist(request):
    """Tenant checklist page"""
    # Get tenant (assuming user is tenant - you'd need proper auth check)
    try:
        tenant = Tenant.objects.get(email=request.user.email)
    except Tenant.DoesNotExist:
        return redirect('/')
    
    checklist_type = request.GET.get('type', 'move-in')
    checklist_template = MOVE_IN_CHECKLIST if checklist_type == 'move-in' else MOVE_OUT_CHECKLIST
    
    # Get or create checklist
    checklist_obj, created = InspectionChecklist.objects.get_or_create(
        tenant=tenant,
        checklist_type=checklist_type,
        defaults={
            'status': 'pending',
        }
    )
    
    # Get existing items
    existing_items = {item.item_id: item for item in checklist_obj.items.all()}
    
    # Group checklist by category
    grouped_checklist = {}
    for item in checklist_template:
        category = item['category']
        if category not in grouped_checklist:
            grouped_checklist[category] = []
        grouped_checklist[category].append(item)
    
    # Calculate completion
    total_items = len(checklist_template)
    completed_items = sum(1 for item in checklist_template if existing_items.get(item['id'], {}).is_checked)
    completion_percentage = int((completed_items / total_items * 100)) if total_items > 0 else 0
    
    context = {
        'tenant': tenant,
        'checklist': checklist_obj,
        'checklist_type': checklist_type,
        'grouped_checklist': grouped_checklist,
        'existing_items': existing_items,
        'completion_percentage': completion_percentage,
        'completed_items': completed_items,
        'total_items': total_items,
    }
    return render(request, 'frontend/checklist/index.html', context)


@login_required
def save_checklist_item(request):
    """Save individual checklist item (AJAX)"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    try:
        tenant = Tenant.objects.get(email=request.user.email)
        checklist_obj = InspectionChecklist.objects.get(
            tenant=tenant,
            id=request.POST.get('checklist_id')
        )
        
        item_id = request.POST.get('item_id')
        is_checked = request.POST.get('is_checked') == 'true'
        notes = request.POST.get('notes', '')
        
        # Get or create item
        item, created = InspectionChecklistItem.objects.get_or_create(
            checklist=checklist_obj,
            item_id=item_id,
            defaults={
                'item_label': request.POST.get('item_label', ''),
                'category': request.POST.get('category', ''),
            }
        )
        
        item.is_checked = is_checked
        item.notes = notes
        item.save()
        
        return JsonResponse({'success': True, 'item_id': item.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@login_required
def submit_checklist(request):
    """Submit checklist for landlord review"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    try:
        tenant = Tenant.objects.get(email=request.user.email)
        checklist_obj = InspectionChecklist.objects.get(
            tenant=tenant,
            id=request.POST.get('checklist_id')
        )
        
        checklist_obj.status = 'submitted'
        checklist_obj.submitted_at = timezone.now()
        if request.POST.get('inspection_date'):
            from datetime import datetime
            checklist_obj.inspection_date = datetime.fromisoformat(request.POST.get('inspection_date'))
        checklist_obj.save()
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

