import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import colors from '../constants/colors';
import { showAlert } from '../services/apiService';

export default function IMAPSettingsScreen() {
  const [form, setForm] = useState({ email: '', server: '', port: '993' });
  const [errors, setErrors] = useState({});

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const newErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Geçerli bir e-posta girin.';
    if (!form.server.trim()) newErrors.server = 'Sunucu adresi zorunludur.';
    const port = Number(form.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      newErrors.port = 'Port 1-65535 arasında olmalıdır.';
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: Gerçek IMAP bağlantısı / backend kaydı sonraki sprintte eklenecek.
      showAlert('Bilgi', 'Ayarlar şimdilik sadece arayüz olarak hazırlandı.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>IMAP Ayarları</Text>
        <Text style={styles.subtitle}>
          Başvuruların alınacağı e-posta hesabının bağlantı bilgilerini girin.
        </Text>

        <CustomInput
          label="IMAP E-posta Adresi"
          placeholder="basvuru@sirket.com"
          value={form.email}
          onChangeText={(v) => updateField('email', v)}
          keyboardType="email-address"
          error={errors.email}
        />
        <CustomInput
          label="Sunucu Adresi"
          placeholder="imap.sirket.com"
          value={form.server}
          onChangeText={(v) => updateField('server', v)}
          error={errors.server}
        />
        <CustomInput
          label="Port"
          placeholder="993"
          value={form.port}
          onChangeText={(v) => updateField('port', v)}
          keyboardType="numeric"
          error={errors.port}
        />

        <CustomButton title="Kaydet" onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 8, marginBottom: 24 },
});