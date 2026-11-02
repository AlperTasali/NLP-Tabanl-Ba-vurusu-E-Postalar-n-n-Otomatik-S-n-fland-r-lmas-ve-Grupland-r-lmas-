from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EmailApplicationViewSet

router = DefaultRouter()
router.register("emails", EmailApplicationViewSet, basename="email")

urlpatterns = [
    path("", include(router.urls)),
]