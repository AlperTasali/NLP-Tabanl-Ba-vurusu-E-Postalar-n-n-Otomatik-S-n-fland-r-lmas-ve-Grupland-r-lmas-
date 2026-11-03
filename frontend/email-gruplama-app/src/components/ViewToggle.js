import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';

// props: { value: 'kanban' | 'list', onChange: (value) => void }
const OPTIONS = [
  { key: 'kanban', label: 'Kanban Görünümü' },
  { key: 'list', label: 'Liste Görünümü' },
];

export default function ViewToggle({ value, onChange }) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 4,
  },
  option: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  optionActive: { backgroundColor: colors.surface },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  labelActive: { color: colors.primary },
});