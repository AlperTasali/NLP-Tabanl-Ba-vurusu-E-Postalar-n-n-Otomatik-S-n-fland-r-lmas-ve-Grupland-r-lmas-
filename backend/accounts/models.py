
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models.functions import Lower

from companies.models import Company


class Role(models.Model):
    ADMIN = "admin"
    USER = "user"

    code = models.SlugField(
        "rol kodu",
        max_length=50,
        unique=True,
    )

    name = models.CharField(
        "rol adı",
        max_length=100,
        unique=True,
    )

    description = models.TextField(
        "açıklama",
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "roles"
        verbose_name = "Rol"
        verbose_name_plural = "Roller"
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(
        self,
        email,
        password,
        company,
        role,
        **extra_fields,
    ):
        if not email:
            raise ValueError(
                "E-posta adresi zorunludur."
            )

        if company is None or role is None:
            raise ValueError(
                "Kullanıcı bir şirkete ve bir role bağlı olmalıdır."
            )

        email = email.strip().lower()

        user = self.model(
            email=email,
            company=company,
            role=role,
            **extra_fields,
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_user(
        self,
        email,
        password=None,
        company=None,
        role=None,
        **extra_fields,
    ):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        return self._create_user(
            email,
            password,
            company,
            role,
            **extra_fields,
        )

    def create_superuser(
        self,
        email,
        password=None,
        company=None,
        role=None,
        **extra_fields,
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get("is_staff"):
            raise ValueError(
                "Superuser için is_staff=True olmalıdır."
            )

        if not extra_fields.get("is_superuser"):
            raise ValueError(
                "Superuser için is_superuser=True olmalıdır."
            )

        if company is None:
            company, _ = Company.objects.get_or_create(
                name="Sistem Yönetimi"
            )

        if role is None:
            role, _ = Role.objects.get_or_create(
                code=Role.ADMIN,
                defaults={"name": "Admin"},
            )

        return self._create_user(
            email,
            password,
            company,
            role,
            **extra_fields,
        )


class User(AbstractUser):
    username = None

    email = models.EmailField(
        "e-posta",
        max_length=254,
        unique=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="users",
        null=False,
        blank=False,
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="users",
        null=False,
        blank=False,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        verbose_name = "Kullanıcı"
        verbose_name_plural = "Kullanıcılar"

        constraints = [
            models.UniqueConstraint(
                Lower("email"),
                name="unique_user_email_ci",
            ),
        ]

        indexes = [
            models.Index(
                fields=["company", "role"],
                name="user_company_role_idx",
            ),
        ]

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
