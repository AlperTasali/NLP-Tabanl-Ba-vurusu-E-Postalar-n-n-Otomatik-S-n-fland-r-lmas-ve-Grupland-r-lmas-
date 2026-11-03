import React, { useMemo } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import ApplicationCard, { getCategoryStyle } from './ApplicationCard';
import { COLUMN_ORDER, groupByCategory } from '../utils/classify';

// props: { applications: normalize edilmiş başvuru dizisi }
export default function KanbanBoard({ applications }) {
  const groups = useMemo(() => groupByCategory(applications), [applications]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.board}
    >
      {COLUMN_ORDER.map((category) => {
        const items = groups[category];
        const catStyle = getCategoryStyle(category);
        return (
          <View key={category} style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle} numberOfLines={1}>{category}</Text>
              <View style={[styles.countBadge, { backgroundColor: catStyle.bg }]}>
                <Text style={[styles.countText, { color: catStyle.fg }]}>{items.length}</Text>
              </View>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ApplicationCard item={item} style={styles.card} />}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.empty}>Bu kategoride başvuru yok</Text>}
              nestedScrollEnabled
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  board: { paddingHorizontal: 16, paddingBottom: 24 },
  column: {
    width: 280,
    marginRight: 14,
    backgroundColor: '#EEF2F7',
    borderRadius: 16,
    padding: 12,
    maxHeight: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  columnTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text, marginRight: 8 },
  countBadge: { minWidth: 28, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignItems: 'center' },
  countText: { fontSize: 13, fontWeight: '700' },
  card: { marginBottom: 10 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: 13, paddingVertical: 20 },
});