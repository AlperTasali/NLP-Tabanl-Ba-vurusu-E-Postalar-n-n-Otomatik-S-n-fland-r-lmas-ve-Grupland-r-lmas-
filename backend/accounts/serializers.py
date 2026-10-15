from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Company, Role

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'company', 'role')
        read_only_fields = ('id',)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('Bu e-posta zaten kayıtlı.')
        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            company=validated_data['company'],
            role=validated_data['role'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )


class ProfileSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    role_code = serializers.CharField(source='role.code', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name',
            'company', 'company_name', 'role', 'role_code', 'role_name',
            'date_joined', 'last_login',
        )
        read_only_fields = ('id', 'email', 'company', 'role', 'date_joined', 'last_login')


class CompanyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login: access/refresh + şirket/rol claim'leri."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['company_id'] = user.company_id
        token['role'] = user.role.code if hasattr(user, 'role') else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = ProfileSerializer(self.user).data
        return data
