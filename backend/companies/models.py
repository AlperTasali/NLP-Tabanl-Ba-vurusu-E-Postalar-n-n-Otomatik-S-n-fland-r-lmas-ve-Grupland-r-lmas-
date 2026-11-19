from django.db import models


class Company(models.Model):
    name = models.CharField(
        "şirket adı",
        max_length=255,
        unique=True,
    )

    tax_number = models.CharField(
        "vergi no",
        max_length=50,
        unique=True,
        null=True,
        blank=True,
    )

    email = models.EmailField(
        "şirket e-postası",
        blank=True,
    )

    phone = models.CharField(
        "telefon",
        max_length=30,
        blank=True,
    )

    address = models.TextField(
        "adres",
        blank=True,
    )

    is_active = models.BooleanField(
        "aktif",
        default=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "companies"
        verbose_name = "Şirket"
        verbose_name_plural = "Şirketler"
        ordering = ["name"]

    def __str__(self):
        return self.name


