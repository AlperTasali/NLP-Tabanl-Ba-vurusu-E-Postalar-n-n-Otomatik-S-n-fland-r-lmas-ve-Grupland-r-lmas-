from rest_framework import serializers

from .models import EmailApplication


class EmailApplicationListSerializer(serializers.ModelSerializer):
    preview = serializers.SerializerMethodField()

    class Meta:
        model = EmailApplication
        fields = [
            "id", "sender_name", "sender_email", "subject",
            "sent_at", "status", "preview",
        ]
        read_only_fields = fields

    def get_preview(self, obj):
        return (obj.clean_text or "")[:200]


class EmailApplicationDetailSerializer(serializers.ModelSerializer):
    # company bilerek dışarı verilmiyor; istemci şirket kimliği gönderemez/değiştiremez
    class Meta:
        model = EmailApplication
        fields = [
            "id", "message_id", "sender_name", "sender_email", "subject",
            "sent_at", "status", "clean_text", "body_text", "body_html",
            "created_at",
        ]
        read_only_fields = fields