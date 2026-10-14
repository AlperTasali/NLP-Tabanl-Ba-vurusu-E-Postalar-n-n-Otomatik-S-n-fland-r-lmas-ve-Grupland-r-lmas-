-- 001_init.sql
-- Hafta 1: User / Company / Role temel şeması (multi-tenant çekirdek)
-- Uyumluluk: backend/accounts/models.py -> companies, roles, users
-- Not: Django auth M2M tabloları (auth_group, users_groups, users_user_permissions)
--      Django migration (0001_initial) ile otomatik gelir, burada çekirdek 3 tablo tanımlanır.
-- Çalıştırma: psql -f 001_init.sql  (önce 002_seed.sql çalıştırılmaz)

-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============ companies ============
CREATE TABLE IF NOT EXISTS companies (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  tax_number  VARCHAR(50) UNIQUE NULL,
  email       VARCHAR(254) NOT NULL DEFAULT '',
  phone       VARCHAR(30)  NOT NULL DEFAULT '',
  address     TEXT         NOT NULL DEFAULT '',
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_companies_updated_at ON companies;
CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ roles ============
CREATE TABLE IF NOT EXISTS roles (
  id          BIGSERIAL PRIMARY KEY,
  code        VARCHAR(50)  NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9-]+$'),
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT         NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============ users ============
-- Django Custom User (AbstractUser, username yok, USERNAME_FIELD=email)
-- Django on_delete=PROTECT -> SQL karşılığı ON DELETE RESTRICT (silme engelle).
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  password        VARCHAR(128) NOT NULL,
  last_login      TIMESTAMPTZ NULL,
  is_superuser    BOOLEAN NOT NULL DEFAULT FALSE,
  first_name      VARCHAR(150) NOT NULL DEFAULT '',
  last_name       VARCHAR(150) NOT NULL DEFAULT '',
  is_staff        BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  date_joined     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email           VARCHAR(254) NOT NULL UNIQUE,
  company_id      BIGINT NOT NULL REFERENCES companies (id) ON DELETE RESTRICT,
  role_id         BIGINT NOT NULL REFERENCES roles (id) ON DELETE RESTRICT
);

-- Case-insensitive e-posta tekilliği (Django: UniqueConstraint(Lower(email)))
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_email_ci ON users (LOWER(email));

-- Tenant + rol filtreleri için bileşik indeks (Django: user_company_role_idx)
CREATE INDEX IF NOT EXISTS user_company_role_idx ON users (company_id, role_id);

-- Tekil sorgular için ek indeksler
CREATE INDEX IF NOT EXISTS users_company_idx ON users (company_id);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role_id);
