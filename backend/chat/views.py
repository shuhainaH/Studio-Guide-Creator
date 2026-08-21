from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.db.models import Q
from .models import DirectMessage
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()

class DirectMessageViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            # return recent conversations
            messages = DirectMessage.objects.filter(Q(sender=request.user) | Q(recipient=request.user))
            # Just returning all for now, in a real app group by user
            return Response([{"id": m.id, "sender": m.sender.id, "recipient": m.recipient.id, "content": m.content, "timestamp": m.timestamp} for m in messages[:50]])
            
        messages = DirectMessage.objects.filter(
            (Q(sender=request.user) & Q(recipient_id=user_id)) |
            (Q(sender_id=user_id) & Q(recipient=request.user))
        ).order_by('timestamp')
        
        return Response([{
            "id": m.id, 
            "sender_id": m.sender.id, 
            "sender_name": m.sender.username,
            "content": m.content, 
            "timestamp": m.timestamp,
            "is_read": m.is_read
        } for m in messages])

    def create(self, request):
        recipient_id = request.data.get('recipient_id')
        content = request.data.get('content')
        if not recipient_id or not content:
            return Response({"error": "recipient_id and content required"}, status=400)
            
        try:
            recipient = User.objects.get(id=recipient_id)
            msg = DirectMessage.objects.create(sender=request.user, recipient=recipient, content=content)
            
            payload = {
                "id": msg.id, 
                "sender_id": msg.sender.id, 
                "sender_name": msg.sender.username,
                "content": msg.content, 
                "timestamp": msg.timestamp,
                "is_read": msg.is_read
            }
            
            # Notify recipient via WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'social_{recipient.id}',
                {
                    'type': 'social_event',
                    'action': 'direct_message_received',
                    'payload': payload
                }
            )
            
            return Response(payload, status=201)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
