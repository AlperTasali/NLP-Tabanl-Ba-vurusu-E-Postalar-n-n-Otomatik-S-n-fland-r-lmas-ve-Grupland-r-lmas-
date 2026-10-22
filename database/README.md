# Database — Hafta 1 (Abdullah)

Multi-tenant çekirdek: `companies` → `users` ← `roles`.

## Dosyalar

- `docker-compose.yml` — PostgreSQL 16 (yerel kurulum yerine önerilen yol)
- `.env.example` — `.env` için şablon (asla commit etme)
- `schema/001_init.sql` — `companies`, `roles`, `users` + indeks/constraint
- `schema/002_seed.sql` — `admin`/`user` rolleri + örnek şirket

## Hızlı kurulum (Podman/Docker)

```bash
cd database
cp .env.example .env
podman compose up -d        # veya: docker compose up -d
podman logs -f nlp-postgres # "ready to accept connections" beklenir
```

`schema/` klasörü ilk açılışta otomatik yüklenir (`/docker-entrypoint-initdb.d`).
Sonradan manuel yüklemek için:

```bash
podman exec -i nlp-postgres psql -U postgres -d ats_db < schema/001_init.sql
podman exec -i nlp-postgres psql -U postgres -d ats_db < schema/002_seed.sql
```

## Native PostgreSQL

```bash
createdb ats_db
psql -d ats_db -f schema/001_init.sql
psql -d ats_db -f schema/002_seed.sql
```

## Tasarım kararları

- `users.company_id` ve `users.role_id`: `NOT NULL` + `ON DELETE PROTECT` (tenant silinmeye karşı korumalı).
- `users.email`: `UNIQUE` + `LOWER(email)` unique indeks (case-insensitive login).
- `user_company_role_idx (company_id, role_id)`: tenant bazlı listeleme için.
- `roles.code`: slug format CHECK (`^[a-z0-9-]+$`), seed: `admin`, `user`.
- Django `accounts/models.py` ile birebir uyumlu tablo/alan adları (`companies`, `roles`, `users`).

Detaylı ER: `../docs/er-diagram.md`
