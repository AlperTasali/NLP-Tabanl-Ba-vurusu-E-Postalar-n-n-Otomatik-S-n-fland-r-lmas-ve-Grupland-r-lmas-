import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import ApplicationCard from './ApplicationCard';
import { COLUMN_ORDER } from '../utils/classify';

// props: { applications: normalize edilmiş başvuru dizisi }
const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Tarih ↓' },
  { key: 'date_asc', label: 'Tarih ↑' },
  { key: 'position', label: 'Pozisyon' },
];

export default function ListView({ applications }) {
  const [sortKey, setSortKey] = useState('date_desc');

  const sorted = useMemo(() => {
    const data = [...applications];
    switch (sortKey) {
      case 'date_asc':
        return data.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
      case 'position':
        return data.sort(
          (a, b) => COLUMN_ORDER.indexOf(a.category) - COLUMN_ORDER.indexOf(b.category)
        );
      default:
        return data.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    }
  }, [applications, sortKey]);

  return (
    <View style={styles.container}>
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sırala:</Text>
        {SORT_OPTIONS.map((opt) => {
          const active = sortKey === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSortKey(opt.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ApplicationCard item={item} style={styles.card} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  sortLabel: { color: colors.textMuted, fontSize: 13 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { marginBottom: 10 },
});