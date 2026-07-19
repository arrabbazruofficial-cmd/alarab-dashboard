from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, UserDetailView, ChangePasswordView, LogoutView,
    AdminUserListView, AdminUserDetailView, SendOTPView, VerifyOTPView,
    CustomTokenObtainPairView, VerifyLoginOTPView
)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('verify-login-otp/', VerifyLoginOTPView.as_view(), name='verify_login_otp'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('users/<uuid:id>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
]
