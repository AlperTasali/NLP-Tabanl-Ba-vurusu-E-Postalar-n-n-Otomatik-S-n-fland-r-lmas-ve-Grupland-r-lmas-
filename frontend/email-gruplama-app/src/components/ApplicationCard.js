import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { UNCLASSIFIED, formatDate } from '../utils/classify';

const CATEGORY_STYLES = {
  'Frontend Developer': { bg: colors.categoryFrontend, fg: colors.categoryFrontendText },
  'Backend Developer': { bg: colors.categoryBackend, fg: colors.categoryBackendText },
  'Data Scientist': { bg: colors.categoryData, fg: colors.categoryDataText },
  'Network Engineer': { bg: colors.categoryNetwork, fg: colors.categoryNetworkText },
  [UNCLASSIFIED]: { bg: colors.categoryUnclassified, fg: colors.categoryUnclassifiedText },
};

export const getCategoryStyle = (category) =>
  CATEGORY_STYLES[category] || CATEGORY_STYLES[UNCLASSIFIED];

// Güven skoruna göre renk: yüksek yeşil, orta turuncu, düşük kırmızı
const confidenceColor = (score) => {
  if (score >= 0.8) return colors.success;
  if (score >= 0.5) return '#D97706';
  return colors.error;
};

// props: { item: { id, aday_adi, tarih, predicted_category, confidence_score, category }, style }
export default function ApplicationCard({ item, style }) {
  const catStyle = getCategoryStyle(item.category);
  const hasScore = typeof item.confidence_score === 'number';
  const percent = hasScore ? Math.round(item.confidence_score * 100) : null;
  const initials = item.aday_adi
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>{item.aday_adi}</Text>
          <Text style={styles.date}>{formatDate(item.tarih)}</Text>
        </View>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: catStyle.bg }]}>
          <Text style={[styles.badgeText, { color: catStyle.fg }]} numberOfLines={1}>
            {item.predicted_category || 'Tahmin yok'}
          </Text>
        </View>

        {hasScore && (
          <View style={[styles.badge, { backgroundColor: confidenceColor(item.confidence_score) + '20' }]}>
            <Text style={[styles.badgeText, { color: confidenceColor(item.confidence_score) }]}>
              %{percent}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  headerText: { marginLeft: 10, flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600' },
});