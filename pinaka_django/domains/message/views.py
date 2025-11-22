"""Message Domain API Views"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Conversation, Message, MessageAttachment
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    MessageSerializer,
    MessageAttachmentSerializer
)


class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.select_related(
        'property', 'landlord', 'tenant', 'pmc'
    ).prefetch_related('messages').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'status',
        'conversation_type',
        'property',
        'landlord',
        'tenant',
        'pmc',
        'priority',
    ]
    search_fields = [
        'subject',
        'property__property_name',
        'landlord__email',
        'tenant__email',
    ]
    ordering = ['-last_message_at', '-updated_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer
    
    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def conversation_messages(self, request, pk=None):
        """Get or create messages for a conversation"""
        from rest_framework.response import Response
        from rest_framework import status
        
        conversation = self.get_object()
        
        if request.method == 'GET':
            # Get messages
            messages = Message.objects.filter(
                conversation=conversation,
                is_deleted=False
            ).order_by('created_at')
            serializer = MessageSerializer(messages, many=True)
            return Response({
                'success': True,
                'data': {
                    'id': conversation.id,
                    'property_name': conversation.property.property_name if conversation.property else None,
                    'messages': serializer.data
                }
            })
        else:
            # Create new message
            content = request.data.get('content')
            if not content:
                return Response({
                    'success': False,
                    'error': 'Message content is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Determine sender
            sender_role = 'TENANT'  # Default, should be determined from user
            sender_tenant = None
            sender_landlord = None
            sender_pmc = None
            
            if hasattr(request.user, 'tenant_profile'):
                sender_role = 'TENANT'
                sender_tenant = request.user.tenant_profile
            elif hasattr(request.user, 'landlord_profile'):
                sender_role = 'LANDLORD'
                sender_landlord = request.user.landlord_profile
            elif hasattr(request.user, 'pmc_profile'):
                sender_role = 'PMC'
                sender_pmc = request.user.pmc_profile
            
            message = Message.objects.create(
                conversation=conversation,
                content=content,
                sender_role=sender_role,
                sender_tenant=sender_tenant,
                sender_landlord=sender_landlord,
                sender_pmc=sender_pmc,
            )
            
            # Update conversation
            conversation.last_message_at = message.created_at
            conversation.save()
            
            serializer = MessageSerializer(message)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.select_related(
        'conversation', 'sender_landlord', 'sender_tenant', 'sender_pmc'
    ).prefetch_related('attachments').all()
    serializer_class = MessageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = [
        'conversation',
        'sender_role',
        'is_read',
        'is_deleted',
    ]
    ordering = ['created_at']


class MessageAttachmentViewSet(viewsets.ModelViewSet):
    queryset = MessageAttachment.objects.select_related('message').all()
    serializer_class = MessageAttachmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['message']

