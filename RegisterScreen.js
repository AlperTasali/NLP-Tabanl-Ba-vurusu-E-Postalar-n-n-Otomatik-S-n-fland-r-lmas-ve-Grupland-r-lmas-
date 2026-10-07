import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import colors from '../constants/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [errors, setErrors] = useState({});

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = () => {
    const newErrors = {};
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: api.registerUser(form) burada çağrılacak
      console.log('Kayıt denemesi:', form.email, form.companyName);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>
              Şirketin için ATS hesabını birkaç adımda kur.
            </Text>
          </View>

          <View style={styles.row}>
            <CustomInput
              style={styles.half}
              label="Ad"
              placeholder="Adın"
              value={form.firstName}
              onChangeText={(v) => updateField('firstName', v)}
              autoCapitalize="words"
            />
            <CustomInput
              style={styles.half}
              label="Soyad"
              placeholder="Soyadın"
              value={form.lastName}
              onChangeText={(v) => updateField('lastName', v)}
              autoCapitalize="words"
            />
          </View>

          <CustomInput
            label="E-mail"
            placeholder="ornek@sirket.com"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            keyboardType="email-address"
          />

          <CustomInput
            label="Şirket Adı"
            placeholder="Şirketinin adı"
            value={form.companyName}
            onChangeText={(v) => updateField('companyName', v)}
            autoCapitalize="words"
          />

          <CustomInput
            label="Şifre"
            placeholder="••••••••"
            value={form.password}
            onChangeText={(v) => updateField('password', v)}
            secureTextEntry
          />

          <CustomInput
            label="Şifre Tekrar"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <CustomButton title="Kayıt Ol" onPress={handleRegister} style={styles.button} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 8 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  button: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});