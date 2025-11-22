"""
LTB Document URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LTBDocumentViewSet
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import requests
from django.http import HttpResponse

router = DefaultRouter()
router.register(r'ltb-documents', LTBDocumentViewSet, basename='ltb-document')

@csrf_exempt
@require_http_methods(["GET"])
def view_ltb_pdf(request, form_number):
    """View LTB PDF by form number - fetches from constants, not database"""
    try:
        from .constants import LTB_DOCUMENTS
        
        # Find document in constants
        document = None
        form_number_upper = form_number.upper()
        for doc in LTB_DOCUMENTS:
            if doc['form_number'].upper() == form_number_upper:
                document = doc
                break
        
        if not document:
            return HttpResponse('Document not found', status=404)
        
        # Fetch PDF from LTB website with proper headers to avoid 403 errors
        try:
            # Use browser-like headers to avoid 403 Forbidden errors
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,application/octet-stream,*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://tribunalsontario.ca/',
            }
            
            response = requests.get(document['pdf_url'], headers=headers, timeout=30, stream=True)
            response.raise_for_status()
            
            # Check if we got HTML instead of PDF (error page)
            content_type = response.headers.get('content-type', '').lower()
            if 'text/html' in content_type:
                return HttpResponse(
                    'LTB website returned HTML instead of PDF. The PDF link may have changed. Please try downloading directly from the LTB website.',
                    status=502,
                    content_type='text/plain'
                )
            
            # Return PDF as response
            http_response = HttpResponse(
                response.content,
                content_type='application/pdf'
            )
            http_response['Content-Disposition'] = f'inline; filename="{document["form_number"]}.pdf"'
            http_response['Cache-Control'] = 'public, max-age=86400'  # Cache for 24 hours
            return http_response
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                return HttpResponse(
                    f'Access denied (403) by LTB website. Please try downloading directly from: {document["pdf_url"]}',
                    status=403,
                    content_type='text/plain'
                )
            return HttpResponse(f'Failed to fetch PDF: {e.response.status_code} {e.response.reason}', status=502)
        except requests.RequestException as e:
            return HttpResponse(f'Failed to fetch PDF: {str(e)}', status=502)
    except Exception as e:
        return HttpResponse(f'Error: {str(e)}', status=500)

urlpatterns = [
    path('', include(router.urls)),
    # Custom view endpoint for PDF proxy by form number
    path('ltb-documents/<str:form_number>/view/', view_ltb_pdf, name='ltb-document-view'),
]

