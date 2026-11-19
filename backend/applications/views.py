from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import EmailApplication
from .serializers import EmailApplicationSerializer


class EmailApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = EmailApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        company_id = self.request.user.company_id

        if company_id is None:
            return EmailApplication.objects.none()

        return EmailApplication.objects.filter(
            company_id=company_id
        )

    def perform_create(self, serializer):
        company_id = self.request.user.company_id

        if company_id is None:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Kullanıcıya şirket atanmamış.")

        serializer.save(company_id=company_id)