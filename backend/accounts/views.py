hafta2-jwt-auth-abdullah
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    CompanyTokenObtainPairSerializer,
    ProfileSerializer,
    RegisterSerializer,
)


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — herkese açık kayıt, cevapta token da döner."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        # SimpleJWT claim'leriyle tutarlı olması için token'a ek alanlar
        refresh['email'] = user.email
        refresh['company_id'] = user.company_id
        refresh['role'] = user.role.code
        data = {
            'user': ProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — email + password → access/refresh + user."""

    serializer_class = CompanyTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — giriş yapmış kullanıcının profili."""

    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'put', 'head', 'options']

    def get_object(self):
        return self.request.user
=======
from django.shortcuts import render

# Create your views here.
main
