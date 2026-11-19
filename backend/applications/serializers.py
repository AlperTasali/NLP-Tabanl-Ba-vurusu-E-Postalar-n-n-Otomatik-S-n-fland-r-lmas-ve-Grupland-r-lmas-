from rest_framework import serializers
from .models import EmailApplication


class EmailApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailApplication
        fields = [
            "id",
            "company",
            "sender_email",
            "subject",
            "body",
            "predicted_position",
            "confidence_score",
            "status",
            "received_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "company",
            "predicted_position",
            "confidence_score",
            "created_at",
        ]