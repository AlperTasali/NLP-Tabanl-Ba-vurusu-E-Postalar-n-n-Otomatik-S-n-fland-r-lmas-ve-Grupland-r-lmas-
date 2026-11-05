import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Android emülatör 10.0.2.2, web/iOS simülatör localhost kullanır.
export const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  default: 'http://localhost:8000/api',
});

const TOKEN_KEY = 'access_token';
const COMPANY_KEY = 'company_id';

// ---- Oturum bilgisi (login bağlanınca setSession çağrılacak) ----
export const setSession = async ({ token, companyId }) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [COMPANY_KEY, String(companyId)],
  ]);
};
export const clearSession = () => AsyncStorage.multiRemove([TOKEN_KEY, COMPANY_KEY]);
export const getCompanyId = () => AsyncStorage.getItem(COMPANY_KEY);

// ---- Axios örneği + JWT header ----
const client = axios.create({ baseURL: BASE_URL, timeout: 10000 });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Uyarı yardımcıları (web'de Alert.alert çalışmaz) ----
export const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Hata koduna göre kullanıcıya gösterilecek mesaj
export const getErrorMessage = (error) => {
  if (!error.response) return 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.';
  switch (error.response.status) {
    case 400:
      return 'Gönderilen bilgilerde hata var. Alanları kontrol edin.';
    case 401:
      return 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.';
    case 403:
      return 'Bu şirketin verilerini görme veya değiştirme yetkiniz yok.';
    case 404:
      return 'İstenen kayıt bulunamadı.';
    default:
      return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
  }
};

export const handleApiError = (error) => {
  showAlert('Hata', getErrorMessage(error));
};

// ---- API fonksiyonları ----
export const getCompany = async (companyId) => {
  const { data } = await client.get(`/companies/${companyId}/`);
  return data;
};

export const updateCompany = async (companyId, payload) => {
  const { data } = await client.patch(`/companies/${companyId}/`, payload);
  return data;
};

export const sendTestEmail = async (payload) => {
  // payload: { name, email, position, body }
  const { data } = await client.post('/test-emails/', payload);
  return data;
};