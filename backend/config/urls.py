from django.contrib import admin
from django.urls import include, path

from .views import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/health/", health_check),
    path("api/applications/", include("applications.urls")),
]
