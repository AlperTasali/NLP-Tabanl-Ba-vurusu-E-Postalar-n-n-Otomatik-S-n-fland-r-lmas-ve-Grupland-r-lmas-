from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import EmailApplication
from .serializers import (
    EmailApplicationDetailSerializer,
    EmailApplicationListSerializer,
)


class EmailApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    """Giriş yapan kullanıcının şirketine ait e-postaları listeler/gösterir."""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Güvenlik: yalnızca isteği atan kullanıcının şirketi. İstemciden gelen
        # hiçbir parametre şirket filtresini değiştiremez.
        qs = EmailApplication.objects.filter(company=self.request.user.company)

        if self.action == "list":
            qs = qs.defer("body_html", "body_text")  # liste ekranı hafif kalsın
            status = self.request.query_params.get("status")
            search = self.request.query_params.get("search")
            if status:
                qs = qs.filter(status=status)
            if search:
                qs = qs.filter(subject__icontains=search)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return EmailApplicationListSerializer
        return EmailApplicationDetailSerializer