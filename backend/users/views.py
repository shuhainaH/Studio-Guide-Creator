from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import UserSerializer, RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer
from .models import UserProfile, CoinPackage

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"status": "success", "message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

import stripe
import os
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_mock')

@api_view(['GET'])
def list_coin_packages(request):
    packages = CoinPackage.objects.all()
    return Response([{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "coin_amount": p.coin_amount,
        "price_usd": str(p.price_usd)
    } for p in packages])

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_checkout_session(request):
    try:
        package_id = request.data.get('package_id')
        if not package_id:
            return Response({'error': 'package_id required'}, status=400)
            
        package = CoinPackage.objects.get(id=package_id)
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': int(package.price_usd * 100), # amount in cents
                    'product_data': {
                        'name': package.name,
                        'description': package.description,
                    },
                },
                'quantity': 1,
            }],
            metadata={
                'user_id': request.user.id,
                'package_id': package.id,
                'coin_amount': package.coin_amount
            },
            mode='payment',
            success_url='http://localhost:5173/store?success=true',
            cancel_url='http://localhost:5173/store?canceled=true',
        )
        return Response({'url': checkout_session.url})
    except CoinPackage.DoesNotExist:
        return Response({'error': 'Package not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([]) # Webhook is public, verified by signature
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return Response(status=400)
    except stripe.error.SignatureVerificationError as e:
        return Response(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        coin_amount = session.get('metadata', {}).get('coin_amount', 0)
        
        if user_id and coin_amount:
            try:
                profile = UserProfile.objects.get(user__id=user_id)
                profile.boink_coins += int(coin_amount)
                profile.save()
            except UserProfile.DoesNotExist:
                pass

    return Response({'status': 'success'})
