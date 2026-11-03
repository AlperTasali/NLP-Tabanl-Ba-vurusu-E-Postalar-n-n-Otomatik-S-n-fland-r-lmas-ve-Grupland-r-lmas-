from django.db import models

from accounts.models import Company


class EmailApplication(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Yeni"
        PROCESSED = "processed", "İşlendi"
        FAILED = "failed", "Hatalı"

    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="email_applications",
        null=False,
        blank=False,
    )

    # IMAP kimliği: UID yalnızca (mailbox + uid_validity) içinde benzersizdir
    mailbox = models.CharField("posta kutusu", max_length=255, default="INBOX")
    uid_validity = models.BigIntegerField("UIDVALIDITY")
    uid = models.BigIntegerField("IMAP UID")

    # RFC 5322 Message-ID (yoksa servis katmanı sentetik bir değer üretir)
    message_id = models.CharField("Message-ID", max_length=512)

    sender_name = models.CharField("gönderen adı", max_length=255, blank=True)
    sender_email = models.EmailField("gönderen e-posta", max_length=320, blank=True)
    subject = models.CharField("konu", max_length=998, blank=True)
    sent_at = models.DateTimeField("gönderim tarihi", null=True, blank=True)

    body_text = models.TextField("düz metin gövde", blank=True)
    body_html = models.TextField("HTML gövde", blank=True)
    clean_text = models.TextField("temizlenmiş metin", blank=True)

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.NEW
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "email_applications"
        verbose_name = "E-posta Başvurusu"
        verbose_name_plural = "E-posta Başvuruları"
        ordering = ["-sent_at", "-id"]
        constraints = [
            # Çok kiracılı yapı: aynı e-posta farklı şirketlerde ayrı kayıt olabilir
            models.UniqueConstraint(
                fields=["company", "message_id"],
                name="uniq_email_company_message_id",
            ),
            models.UniqueConstraint(
                fields=["company", "mailbox", "uid_validity", "uid"],
                name="uniq_email_company_mailbox_uid",
            ),
        ]
        indexes = [
            models.Index(fields=["company", "-sent_at"], name="email_company_sent_idx"),
            models.Index(fields=["company", "status"], name="email_company_status_idx"),
        ]

    def __str__(self):
        return f"{self.subject or '(konusuz)'} - {self.sender_email}"