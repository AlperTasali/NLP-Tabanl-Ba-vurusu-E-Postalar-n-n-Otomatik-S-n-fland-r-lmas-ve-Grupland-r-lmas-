from django.db import models


class EmailApplication(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Yeni"
        REVIEWED = "reviewed", "İncelendi"
        INTERVIEW = "interview", "Mülakata Çağrıldı"
        REJECTED = "rejected", "Reddedildi"
        ACCEPTED = "accepted", "Kabul Edildi"

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="email_applications",
    )

    sender_email = models.EmailField()
    subject = models.CharField(max_length=255)
    body = models.TextField()

    predicted_position = models.CharField(
        max_length=100,
        blank=True,
    )

    confidence_score = models.FloatField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )

    received_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sender_email} - {self.subject}"
