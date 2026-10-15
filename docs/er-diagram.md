# ER Diyagramı — Hafta 1 (User / Company / Role)

Sorumlu: Abdullah — `PROJECT_PLAN.md` 1. Hafta / PostgreSQL.

## İlişkiler

- `companies 1 — N users` (`users.company_id NOT NULL, ON DELETE RESTRICT` = Django `PROTECT`)
- `roles 1 — N users` (`users.role_id NOT NULL, ON DELETE RESTRICT` = Django `PROTECT`)
- `companies` ↔ `roles` arasında doğrudan FK yok; kesişim `users` üzerinden.
- Multi-tenant kuralı: her sorguda `company_id` filtresi zorunlu (2. hafta backend + DB ile zorlanacak).

```mermaid
erDiagram
  COMPANIES ||--o{ USERS : "company_id"
  ROLES ||--o{ USERS : "role_id"

  COMPANIES {
    bigserial id PK
    varchar name UK
    varchar tax_number UK_NULL
    varchar email
    varchar phone
    text address
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }

  ROLES {
    bigserial id PK
    varchar code UK
    varchar name UK
    text description
    timestamptz created_at
  }

  USERS {
    bigserial id PK
    varchar email UK
    varchar password
    varchar first_name
    varchar last_name
    boolean is_staff
    boolean is_superuser
    boolean is_active
    timestamptz last_login
    timestamptz date_joined
    bigint company_id FK
    bigint role_id FK
  }
```

## İndeks / Constraint listesi

| Nesne | Tip | Amaç |
|---|---|---|
| `companies.name UNIQUE` | constraint | şirket adı tekilliği |
| `companies.tax_number UNIQUE` | constraint | vergi no tekilliği (NULL serbest) |
| `roles.code UNIQUE + CHECK(slug)` | constraint | `admin`, `user` kodları |
| `roles.name UNIQUE` | constraint | rol adı tekilliği |
| `users.email UNIQUE` | constraint | login tekilliği |
| `unique_user_email_ci ON (LOWER(email))` | unique index | case-insensitive login |
| `user_company_role_idx (company_id, role_id)` | index | tenant + rol filtreleri |
| `users_company_idx (company_id)` | index | tenant listeleme |
| `users_role_idx (role_id)` | index | rol listeleme |
| `users.company_id → companies(id) RESTRICT` | FK | şirket silinmeye karşı korumalı (Django: `PROTECT`) |
| `users.role_id → roles(id) RESTRICT` | FK | rol silinmeye karşı korumalı (Django: `PROTECT`) |

## Django eşleşmesi

`backend/accounts/models.py` (`origin/user-company-role-tasarimi-postgresql-umut`):

- `Company.Meta.db_table = "companies"` → `companies`
- `Role.Meta.db_table = "roles"` → `roles`
- `User.Meta.db_table = "users"`, `USERNAME_FIELD = "email"` → `users`
- `UniqueConstraint(Lower("email"))` → `unique_user_email_ci`
- `Index(fields=["company","role"])` → `user_company_role_idx`
