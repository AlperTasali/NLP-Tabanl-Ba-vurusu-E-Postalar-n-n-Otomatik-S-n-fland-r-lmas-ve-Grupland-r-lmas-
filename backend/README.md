# Backend — Hafta 2 (Abdullah): JWT Auth

Register / Login / Refresh / Profil API'leri. Custom User (`email` ile giriş).

## Kurulum

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # gerekirse düzenle
python manage.py migrate
python manage.py runserver
```

PostgreSQL yoksa `../database/docker-compose.yml` ile ayağa kaldırın.

## Endpoint'ler (`/api/auth/`)

| Metod | URL | Auth | Açıklama |
|---|---|---|---|
| POST | `/api/auth/register/` | yok | Kayıt → `201` + `user/access/refresh` |
| POST | `/api/auth/login/` | yok | `email+password` → `access/refresh/user` |
| POST | `/api/auth/refresh/` | yok | `refresh` → yeni `access` (+ rotasyonda yeni `refresh`) |
| GET | `/api/auth/me/` | Bearer | Profil |
| PATCH | `/api/auth/me/` | Bearer | `first_name`/`last_name` güncelleme |

Kayıt gövdesi:

```json
{
  "email": "ik@sirket.com",
  "password": "GucluParola123!",
  "first_name": "Ayşe",
  "last_name": "Yılmaz",
  "company": 1,
  "role": 2
}
```

Access token claim'leri: `email`, `company_id`, `role`. Süreler: access 60 dk, refresh 7 gün, refresh rotasyonlu.

## Test

```bash
python manage.py test
```
