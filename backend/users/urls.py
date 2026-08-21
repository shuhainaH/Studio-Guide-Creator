from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, CurrentUserView, UserProfileUpdateView, create_checkout_session, stripe_webhook, list_coin_packages, ChangePasswordView

urlpatterns = [
    # Authentication
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    
    # User Profile
    path('users/me/', CurrentUserView.as_view(), name='current_user'),
    path('users/me/profile/', UserProfileUpdateView.as_view(), name='update_profile'),
    path('users/me/change-password/', ChangePasswordView.as_view(), name='change_password'),

    # Payments
    path('store/packages/', list_coin_packages, name='coin_packages'),
    path('create-checkout-session/', create_checkout_session, name='checkout'),
    path('stripe-webhook/', stripe_webhook, name='webhook'),
]
