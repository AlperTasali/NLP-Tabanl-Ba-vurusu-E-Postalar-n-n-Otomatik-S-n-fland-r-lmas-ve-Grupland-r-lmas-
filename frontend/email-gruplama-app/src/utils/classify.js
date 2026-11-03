export const CATEGORIES = [
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'Network Engineer',
];
export const UNCLASSIFIED = 'Sınıflandırılmamış';
export const COLUMN_ORDER = [...CATEGORIES, UNCLASSIFIED];

export const CONFIDENCE_THRESHOLD = 0.5;

// Boş, geçersiz kategori ya da düşük güven -> "Sınıflandırılmamış"
export const resolveCategory = (item) => {
  const { predicted_category: cat, confidence_score: score } = item;
  if (!cat || !CATEGORIES.includes(cat)) return UNCLASSIFIED;
  if (typeof score !== 'number' || score < CONFIDENCE_THRESHOLD) return UNCLASSIFIED;
  return cat;
};

// Her kayda çözülmüş kategoriyi ekler (orijinal tahmin korunur)
export const normalizeApplications = (items) =>
  items.map((item) => ({ ...item, category: resolveCategory(item) }));

export const groupByCategory = (items) => {
  const groups = Object.fromEntries(COLUMN_ORDER.map((c) => [c, []]));
  items.forEach((item) => groups[item.category].push(item));
  return groups;
};

export const formatDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '-'
    : d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
};