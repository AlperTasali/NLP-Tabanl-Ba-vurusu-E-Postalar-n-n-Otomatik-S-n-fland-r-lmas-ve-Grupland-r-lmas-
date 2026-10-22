import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import colors from '../constants/colors';
import { sendTestEmail, handleApiError, showAlert } from '../services/apiService';

const EMPTY_FORM = { name: '', email: '', position: '', body: '' };

export default function TestEmailScreen() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Ad zorunludur.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Geçerli bir e-posta girin.';
    if (!form.position.trim()) e.position = 'Pozisyon zorunludur.';
    if (!form.body.trim()) e.body = 'Başvuru metni zorunludur.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      await sendTestEmail(form);
      showAlert('Başarılı', 'Test e-postası oluşturuldu.');
      setForm(EMPTY_FORM);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Test E-postası</Text>
        <Text style={styles.subtitle}>
          Sistemi denemek için örnek bir aday başvurusu oluşturun.
        </Text>

        <CustomInput
          label="Ad Soyad"
          placeholder="Aday adı"
          value={form.name}
          onChangeText={(v) => updateField('name', v)}
          autoCapitalize="words"
          error={errors.name}
        />
        <CustomInput
          label="E-posta"
          placeholder="aday@ornek.com"
          value={form.email}
          onChangeText={(v) => updateField('email', v)}
          keyboardType="email-address"
          error={errors.email}
        />
        <CustomInput
          label="Başvurulan Pozisyon"
          placeholder="Örn: Yazılım Geliştirici"
          value={form.position}
          onChangeText={(v) => updateField('position', v)}
          autoCapitalize="words"
          error={errors.position}
        />
        <CustomInput
          label="Başvuru Metni"
          placeholder="Örnek başvuru yazısı..."
          value={form.body}
          onChangeText={(v) => updateField('body', v)}
          multiline
          autoCapitalize="sentences"
          error={errors.body}
        />

        <CustomButton title="Gönder" onPress={handleSend} loading={sending} />
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