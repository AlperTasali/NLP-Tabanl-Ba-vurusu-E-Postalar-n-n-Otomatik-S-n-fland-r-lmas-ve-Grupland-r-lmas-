-- 002_seed.sql
-- Hafta 1: mínimo rol + test şirketi verisi
-- Çalıştırma: psql -f 002_seed.sql (001_init.sql sonrası)

INSERT INTO roles (code, name, description) VALUES
  ('admin', 'Admin', 'Şirket yöneticisi: kullanıcı ve entegrasyon yönetimi'),
  ('user',  'User',  'Standart İK kullanıcısı: başvuru görüntüleme ve durum güncelleme')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Yerel test için 1 örnek şirket (production'da elle üretilir)
INSERT INTO companies (name, email, is_active) VALUES
  ('Ornek A.S.', 'info@ornek.com', TRUE)
ON CONFLICT (name) DO NOTHING;
