"""
LTB Document API Views
Uses constants file (not database) - matching React app implementation
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .constants import (
    LTB_DOCUMENTS,
    get_ltb_documents_by_location,
    get_ltb_documents_by_audience,
    search_ltb_documents
)
import requests
from django.http import HttpResponse


class LTBDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """LTB Documents API - Read-only (forms from constants file, not database)"""
    
    def list(self, request, *args, **kwargs):
        """List all LTB documents - return format matching React app"""
        # Get query parameters
        country = request.query_params.get('country', 'CA')
        province = request.query_params.get('province', 'ON')
        category = request.query_params.get('category')
        audience = request.query_params.get('audience', 'all')
        search = request.query_params.get('search', '')
        
        # Get pagination params
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except (ValueError, TypeError):
            page = 1
        try:
            limit = max(1, min(100, int(request.query_params.get('limit', 50))))
        except (ValueError, TypeError):
            limit = 50
        
        # Start with all documents
        documents = list(LTB_DOCUMENTS)
        
        # Filter by location
        if country and province:
            documents = get_ltb_documents_by_location(country, province)
        
        # Filter by audience
        if audience and audience != 'all':
            documents = [doc for doc in documents if doc in get_ltb_documents_by_audience(audience)]
        
        # Filter by category
        if category:
            documents = [doc for doc in documents if doc['category'] == category]
        
        # Search
        if search:
            search_results = search_ltb_documents(search)
            documents = [doc for doc in documents if doc in search_results]
        
        # Sort by form number
        documents = sorted(documents, key=lambda x: x['form_number'])
        
        # Paginate
        total = len(documents)
        total_pages = (total + limit - 1) // limit  # Ceiling division
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_documents = documents[start_index:end_index]
        
        # Format response to match React app
        formatted_documents = []
        for doc in paginated_documents:
            formatted_documents.append({
                'id': doc['id'],
                'formNumber': doc['form_number'],  # React app format
                'form_number': doc['form_number'],  # Django format
                'name': doc['name'],
                'description': doc.get('description', ''),
                'category': doc['category'],
                'audience': doc['audience'],
                'pdfUrl': doc['pdf_url'],  # React app format
                'pdf_url': doc['pdf_url'],  # Django format
                'instructionUrl': doc.get('instruction_url'),  # React app format
                'instruction_url': doc.get('instruction_url'),  # Django format
                'country': doc['country'],
                'province': doc['province'],
            })
        
        # Return format matching React app: { success: true, data: [...] }
        return Response({
            'success': True,
            'data': formatted_documents,
            'pagination': {
                'current': page,
                'pageSize': limit,
                'total': total,
                'totalPages': total_pages,
            }
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Get single LTB document by form number"""
        form_number = kwargs.get('pk', '').upper()
        
        # Find document in constants
        document = None
        for doc in LTB_DOCUMENTS:
            if doc['form_number'].upper() == form_number:
                document = doc
                break
        
        if not document:
            return Response({
                'success': False,
                'error': 'Document not found'
            }, status=404)
        
        # Format response
        formatted_doc = {
            'id': document['id'],
            'formNumber': document['form_number'],
            'form_number': document['form_number'],
            'name': document['name'],
            'description': document.get('description', ''),
            'category': document['category'],
            'audience': document['audience'],
            'pdfUrl': document['pdf_url'],
            'pdf_url': document['pdf_url'],
            'instructionUrl': document.get('instruction_url'),
            'instruction_url': document.get('instruction_url'),
            'country': document['country'],
            'province': document['province'],
        }
        
        return Response({
            'success': True,
            'data': formatted_doc
        })
