"""
Forms Management Views
"""
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from domains.document.models import Document


@login_required
def forms_management(request):
    """Forms management page for landlords/PMCs"""
    # Get form documents
    forms = Document.objects.filter(
        category__in=['LEASE_FORM', 'APPLICATION_FORM', 'INSPECTION_FORM', 'OTHER_FORM']
    ).order_by('-uploaded_at')
    
    context = {
        'forms': forms,
    }
    return render(request, 'frontend/forms/index.html', context)

