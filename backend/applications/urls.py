from django.urls import path
from .views import EmailApplicationListCreateView

urlpatterns = [
    path(
        "",
        EmailApplicationListCreateView.as_view(),
        name="application-list-create",
    ),
]