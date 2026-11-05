# NLP-Tabanl-Ba-vurusu-E-Postalar-n-n-Otomatik-S-n-fland-r-lmas-ve-Grupland-r-lmas-
SaaS platform for analyzing and classifying job application emails
# NLP Tabanlı İş Başvurusu E-Postalarının Otomatik Sınıflandırılması ve Gruplandırılması

Bu proje, kurumlara e-posta yoluyla gelen iş başvurularını
Doğal Dil İşleme (NLP) ve makine öğrenmesi kullanarak analiz eden,
adayları başvurdukları pozisyonlara göre otomatik olarak sınıflandıran
ve gruplandıran bir SaaS platformudur.

## Kullanılan Teknolojiler

### Frontend
- React Native
- TypeScript

### Backend
- Python
- Django
- Django REST Framework

### Machine Learning / NLP
- Python
- NLP
- Hugging Face

### Database
- PostgreSQL
- SQL

## Proje Klasör Yapısı

- `frontend/` → React Native kullanıcı arayüzü
- `backend/` → Python, Django ve REST API
- `ml/` → NLP modeli, veri ön işleme, eğitim ve tahmin
- `database/` → PostgreSQL, SQL şemaları ve sorgular
- `docs/` → Proje mimarisi ve teknik dokümantasyon

## Ekip Görev Dağılımı

### Kişi 1 - Frontend
React Native ile:
- Login ekranı
- Dashboard
- Kanban/Liste görünümü
- Aday kartları
- Aday detay ekranı
- Aday durum güncellemeleri
- API entegrasyonu
- E-posta entegrasyon ayarları

### Kişi 2 - Backend & NLP
Python ve Django ile:
- Django REST API
- Authentication
- IMAP e-posta entegrasyonu
- E-posta işleme
- NLP preprocessing
- NLP sınıflandırma modeli
- Background işlemleri
- Frontend için API endpointleri

### Kişi 3 - Database
PostgreSQL ve SQL ile:
- Veritabanı tasarımı
- Şirketler tablosu
- Kullanıcılar tablosu
- Başvurular tablosu
- Kategoriler tablosu
- Multi-tenant yapı
- İndeksleme
- Veri bütünlüğü
- Sorgu optimizasyonu

## Temel Sistem Akışı

E-posta
→ Django IMAP Servisi
→ NLP Ön İşleme
→ NLP Sınıflandırma Modeli
→ PostgreSQL
→ Django REST API
→ React Native

## Amaç

Sistemin temel amacı, İnsan Kaynakları departmanlarına gelen
iş başvurusu e-postalarını otomatik olarak analiz etmek,
başvurulan pozisyona göre sınıflandırmak ve adayları
yönetilebilir gruplar halinde sunmaktır.
