import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import ViewToggle from '../components/ViewToggle';
import KanbanBoard from '../components/KanbanBoard';
import ListView from '../components/ListView';
import { fetchApplications } from '../data/mockApplications';
import { normalizeApplications } from '../utils/classify';

export default function ApplicationsScreen() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');

  useEffect(() => {
    let active = true;
    fetchApplications().then((data) => {
      if (active) {
        setRaw(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Sınıflandırma kuralı burada uygulanır (boş / güven < 0.5 -> Sınıflandırılmamış)
  const applications = useMemo(() => normalizeApplications(raw), [raw]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Başvurular</Text>
        <Text style={styles.subtitle}>{applications.length} başvuru</Text>
        <ViewToggle value={view} onChange={setView} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : view === 'kanban' ? (
        <KanbanBoard applications={applications} />
      ) : (
        <ListView applications={applications} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  loader: { marginTop: 40 },
});