// API yanıt şekli:
// { id, aday_adi, tarih (YYYY-MM-DD), predicted_category, confidence_score (0-1) }

export const MOCK_APPLICATIONS = [
  { id: 1, aday_adi: 'Ayşe Yılmaz', tarih: '2026-10-28', predicted_category: 'Frontend Developer', confidence_score: 0.92 },
  { id: 2, aday_adi: 'Mehmet Demir', tarih: '2026-10-29', predicted_category: 'Backend Developer', confidence_score: 0.87 },
  { id: 3, aday_adi: 'Zeynep Kaya', tarih: '2026-10-30', predicted_category: 'Data Scientist', confidence_score: 0.95 },
  { id: 4, aday_adi: 'Can Öztürk', tarih: '2026-10-30', predicted_category: 'Network Engineer', confidence_score: 0.78 },
  { id: 5, aday_adi: 'Elif Şahin', tarih: '2026-10-31', predicted_category: 'Frontend Developer', confidence_score: 0.64 },
  { id: 6, aday_adi: 'Burak Arslan', tarih: '2026-11-01', predicted_category: 'Backend Developer', confidence_score: 0.41 },
  { id: 7, aday_adi: 'Selin Çelik', tarih: '2026-11-01', predicted_category: null, confidence_score: null },
  { id: 8, aday_adi: 'Emre Aydın', tarih: '2026-11-02', predicted_category: 'Data Scientist', confidence_score: 0.55 },
  { id: 9, aday_adi: 'Deniz Koç', tarih: '2026-11-02', predicted_category: 'Network Engineer', confidence_score: 0.9 },
  { id: 10, aday_adi: 'Gizem Polat', tarih: '2026-11-03', predicted_category: 'Frontend Developer', confidence_score: 0.49 },
  { id: 11, aday_adi: 'Oğuz Tekin', tarih: '2026-11-03', predicted_category: 'Backend Developer', confidence_score: 0.83 },
  { id: 12, aday_adi: 'Merve Bulut', tarih: '2026-11-03', predicted_category: '', confidence_score: 0.9 },
];

// Gerçek API bağlanınca burası axios çağrısına dönüşecek.
export const fetchApplications = () =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_APPLICATIONS), 600));