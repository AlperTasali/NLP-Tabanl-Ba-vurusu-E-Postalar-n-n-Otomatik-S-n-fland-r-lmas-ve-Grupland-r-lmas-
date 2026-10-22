 user-company-role-tasarimi-postgresql-umut
from django.contrib import admin

# Register your models here.
=======
from django.contrib import admin
hafta2-jwt-auth-abdullah

from .models import Company, Role, User


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'email', 'tax_number')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'created_at')
    search_fields = ('code', 'name')


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'company', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'role', 'company')
    search_fields = ('email', 'first_name', 'last_name')
    readonly_fields = ('last_login', 'date_joined')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Kişisel', {'fields': ('first_name', 'last_name')}),
        ('Şirket / Rol', {'fields': ('company', 'role')}),
        ('İzinler', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Tarihler', {'fields': ('last_login', 'date_joined')}),
    )
=======
from django.contrib.auth.admin import UserAdmin

from .models import User


admin.site.register(User, UserAdmin)
main
 main
