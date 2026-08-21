from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import FriendRequest, Follow
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()

class SocialViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def send_friend_request(self, request):
        receiver_id = request.data.get('user_id')
        username = request.data.get('username')
        
        if not receiver_id and not username:
            return Response({"error": "user_id or username required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            if receiver_id:
                receiver = User.objects.get(id=receiver_id)
            else:
                receiver = User.objects.get(username__iexact=username)
                
            if receiver == request.user:
                return Response({"error": "Cannot send request to yourself"}, status=status.HTTP_400_BAD_REQUEST)
                
            req, created = FriendRequest.objects.get_or_create(sender=request.user, receiver=receiver)
            
            if created:
                # Notify receiver via WebSocket
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f'social_{receiver.id}',
                    {
                        'type': 'social_event',
                        'action': 'friend_request_received',
                        'payload': {
                            'id': req.id,
                            'sender_id': request.user.id,
                            'sender_username': request.user.username
                        }
                    }
                )
            
            return Response({"message": "Friend request sent"}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def friends(self, request):
        # A simple list of accepted friend requests (either direction)
        sent = FriendRequest.objects.filter(sender=request.user, status='accepted').values_list('receiver_id', flat=True)
        received = FriendRequest.objects.filter(receiver=request.user, status='accepted').values_list('sender_id', flat=True)
        
        friend_ids = list(sent) + list(received)
        friends = User.objects.filter(id__in=friend_ids).values('id', 'username')
        
        return Response({"friends": list(friends)})

    @action(detail=False, methods=['get'])
    def pending_requests(self, request):
        requests = FriendRequest.objects.filter(receiver=request.user, status='pending')
        return Response([{"id": req.id, "sender_id": req.sender.id, "sender_username": req.sender.username} for req in requests])

    @action(detail=True, methods=['post'])
    def accept_request(self, request, pk=None):
        try:
            freq = FriendRequest.objects.get(id=pk, receiver=request.user)
            freq.status = 'accepted'
            freq.save()
            
            # Notify sender via WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'social_{freq.sender.id}',
                {
                    'type': 'social_event',
                    'action': 'friend_request_accepted',
                    'payload': {
                        'id': freq.id,
                        'receiver_id': request.user.id,
                        'receiver_username': request.user.username
                    }
                }
            )
            
            return Response({"message": "Request accepted"})
        except FriendRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def reject_request(self, request, pk=None):
        try:
            freq = FriendRequest.objects.get(id=pk, receiver=request.user)
            freq.status = 'rejected'
            freq.save()
            return Response({"message": "Request rejected"})
        except FriendRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)
