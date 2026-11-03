 

from django.contrib import admin
 
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]

from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),path("api/", include("mailbox.urls")),
]


from django.contrib import admin
from django.urls import path
from .views import health_check


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check),
]

