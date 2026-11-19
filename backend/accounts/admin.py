
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "created_at",
    )

    search_fields = (
        "code",
        "name",
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "email",
        "company",
        "role",
        "is_staff",
        "is_active",
        "date_joined",
    )

    list_filter = (
        "is_staff",
        "is_active",
        "role",
        "company",
    )

    search_fields = (
        "email",
        "first_name",
        "last_name",
    )

    ordering = ("email",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                ),
            },
        ),
        (
            "Kişisel Bilgiler",
            {
                "fields": (
                    "first_name",
                    "last_name",
                ),
            },
        ),
        (
            "Şirket ve Rol",
            {
                "fields": (
                    "company",
                    "role",
                ),
            },
        ),
        (
            "Yetkiler",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Tarihler",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                ),
            },
        ),
    )

    readonly_fields = (
        "last_login",
        "date_joined",
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "company",
                    "role",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
