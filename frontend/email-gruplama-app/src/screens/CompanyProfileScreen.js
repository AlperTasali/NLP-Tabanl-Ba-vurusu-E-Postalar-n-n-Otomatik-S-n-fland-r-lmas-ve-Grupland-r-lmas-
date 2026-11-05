import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import colors from '../constants/colors';
import {
  getCompany,
  updateCompany,
  getCompanyId,
  handleApiError,
  showAlert,
} from '../services/apiService';

const EDITABLE_ROLES = ['admin'];

export default function CompanyProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({
    name: '',
    tax_number: '',
    email: '',
    phone: '',
    address: '',
  });

  // Yetki sadece arayüzü sadeleştirir; asıl kontrolü backend yapar (403).
  const canEdit = role ? EDITABLE_ROLES.includes(role.code) : false;

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadCompany = useCallback(async () => {
    setLoading(true);
    try {
      const companyId = await getCompanyId();
      if (!companyId) {
        showAlert('Uyarı', 'Şirket bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }
      const data = await getCompany(companyId);
      setRole(data.current_user_role);
      setForm({
        name: data.name ?? '',
        tax_number: data.tax_number ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCompany();
    }, [loadCompany])
  );

  const handleSave = async () => {
    if (!form.name.trim()) {
      showAlert('Uyarı', 'Şirket adı boş bırakılamaz.');
      return;
    }
    setSaving(true);
    try {
      const companyId = await getCompanyId();
      await updateCompany(companyId, form);
      showAlert('Başarılı', 'Şirket bilgileri güncellendi.');
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Şirket Profili</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleLabel}>Rolün: </Text>
          <Text style={styles.roleValue}>{role?.name ?? '-'}</Text>
        </View>

        {!canEdit && (
          <Text style={styles.info}>
            Şirket bilgilerini sadece yetkili kullanıcılar düzenleyebilir.
          </Text>
        )}

        <CustomInput
          label="Şirket Adı"
          value={form.name}
          onChangeText={(v) => updateField('name', v)}
          autoCapitalize="words"
          editable={canEdit}
        />
        <CustomInput
          label="Vergi No"
          value={form.tax_number}
          onChangeText={(v) => updateField('tax_number', v)}
          keyboardType="numeric"
          editable={canEdit}
        />
        <CustomInput
          label="Şirket E-postası"
          value={form.email}
          onChangeText={(v) => updateField('email', v)}
          keyboardType="email-address"
          editable={canEdit}
        />
        <CustomInput
          label="Telefon"
          value={form.phone}
          onChangeText={(v) => updateField('phone', v)}
          keyboardType="phone-pad"
          editable={canEdit}
        />
        <CustomInput
          label="Adres"
          value={form.address}
          onChangeText={(v) => updateField('address', v)}
          multiline
          autoCapitalize="sentences"
          editable={canEdit}
        />

        {canEdit && (
          <CustomButton title="Kaydet" onPress={handleSave} loading={saving} />
        )}

        <View style={styles.links}>
          <CustomButton
            title="IMAP Ayarları"
            variant="outline"
            onPress={() => navigation.navigate('IMAPSettings')}
          />
          <CustomButton
            title="Test E-postası Oluştur"
            variant="outline"
            style={styles.linkSpacing}
            onPress={() => navigation.navigate('TestEmail')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 12 },
  roleBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  roleLabel: { color: colors.textMuted, fontSize: 14 },
  roleValue: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  info: { color: colors.textMuted, fontSize: 13, marginBottom: 16 },
  links: { marginTop: 24 },
  linkSpacing: { marginTop: 12 },
});