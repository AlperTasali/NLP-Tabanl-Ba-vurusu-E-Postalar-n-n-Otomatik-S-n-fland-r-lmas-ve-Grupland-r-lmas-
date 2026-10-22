
import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// ==========================================
// 1. DJANGO API AYARLARI
// ==========================================

// Bu IP örnektir.
// Kendi bilgisayarının yerel IP adresiyle değiştir.
// Django API endpoint'leri backend ile aynı olmalı.

const API_URL = 'http://192.168.1.100:8000/api';

const LOGIN_URL = `${API_URL}/auth/login/`;
const REGISTER_URL = `${API_URL}/auth/register/`;
const REFRESH_URL = `${API_URL}/auth/refresh/`;

// ==========================================
// 2. TOKEN STORAGE
// ==========================================

// Web önizlemesinde SecureStore desteklenmez.
// Bu yüzden web'de refresh token sadece bellekte tutulur.

let webRefreshToken = null;

const tokenStorage = {
  save: async (token) => {
    if (Platform.OS === 'web') {
      webRefreshToken = token;
      return;
    }

    await SecureStore.setItemAsync('refresh_token', token);
  },

  get: async () => {
    if (Platform.OS === 'web') {
      return webRefreshToken;
    }

    return await SecureStore.getItemAsync('refresh_token');
  },

  clear: async () => {
    if (Platform.OS === 'web') {
      webRefreshToken = null;
      return;
    }

    await SecureStore.deleteItemAsync('refresh_token');
  },
};

// ==========================================
// 3. API REQUEST
// ==========================================

async function postJSON(url, body) {
  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Sunucuya bağlanılamadı. Django API adresini ve ağ bağlantısını kontrol et.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(data);

    throw new Error(
      errorMessage || `HTTP ${response.status} hatası`
    );
  }

  return data;
}

// ==========================================
// 4. ZUSTAND AUTH STORE
// ==========================================

const useAuthStore = create((set) => ({
  username: null,
  accessToken: null,
  isAuthenticated: false,
  restoring: true,

  // LOGIN
  login: async (username, password) => {
    const tokens = await postJSON(LOGIN_URL, {
      username,
      password,
    });

    if (!tokens.access || !tokens.refresh) {
      throw new Error('JWT token yanıtı eksik.');
    }

    await tokenStorage.save(tokens.refresh);

    set({
      username,
      accessToken: tokens.access,
      isAuthenticated: true,
    });
  },

  // REGISTER
  register: async (username, email, password) => {
    return await postJSON(REGISTER_URL, {
      username,
      email,
      password,
    });
  },

  // RESTORE SESSION
  restoreSession: async () => {
    try {
      const refresh = await tokenStorage.get();

      if (!refresh) {
        set({
          username: null,
          accessToken: null,
          isAuthenticated: false,
        });
        return;
      }

      const tokens = await postJSON(REFRESH_URL, {
        refresh,
      });

      if (!tokens.access) {
        throw new Error('Access token alınamadı.');
      }

      if (tokens.refresh) {
        await tokenStorage.save(tokens.refresh);
      }

      set({
        accessToken: tokens.access,
        isAuthenticated: true,
      });
    } catch {
      await tokenStorage.clear();

      set({
        username: null,
        accessToken: null,
        isAuthenticated: false,
      });
    } finally {
      set({
        restoring: false,
      });
    }
  },

  // REFRESH TOKEN
  refreshToken: async () => {
    const refresh = await tokenStorage.get();

    if (!refresh) {
      throw new Error('Refresh token bulunamadı.');
    }

    const tokens = await postJSON(REFRESH_URL, {
      refresh,
    });

    if (!tokens.access) {
      throw new Error('Access token alınamadı.');
    }

    if (tokens.refresh) {
      await tokenStorage.save(tokens.refresh);
    }

    set({
      accessToken: tokens.access,
      isAuthenticated: true,
    });
  },

  // LOGOUT
  logout: async () => {
    await tokenStorage.clear();

    set({
      username: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));

// ==========================================
// 5. ANA UYGULAMA
// ==========================================

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Zustand state
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const currentUser = useAuthStore(
    (state) => state.username
  );

  const restoring = useAuthStore(
    (state) => state.restoring
  );

  const login = useAuthStore(
    (state) => state.login
  );

  const register = useAuthStore(
    (state) => state.register
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  const restoreSession = useAuthStore(
    (state) => state.restoreSession
  );

  const refreshToken = useAuthStore(
    (state) => state.refreshToken
  );

  // ========================================
  // 6. USE EFFECT - DÜZELTİLDİ
  // ========================================

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ========================================
  // 7. HATA MESAJLARI
  // ========================================

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(`${title}\n${message}`);
      }
    } else {
      Alert.alert(title, message);
    }
  };

  const showError = (title, error) => {
    showMessage(
      title,
      error?.message || 'Bir hata oluştu.'
    );
  };

  // ========================================
  // 8. LOGIN FUNCTION
  // ========================================

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      showMessage(
        'Uyarı',
        'Kullanıcı adı ve şifre gerekli.'
      );
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);
      setPassword('');
    } catch (error) {
      showError('Giriş başarısız', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 9. REGISTER FUNCTION
  // ========================================

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password) {
      showMessage(
        'Uyarı',
        'Bütün alanları doldur.'
      );
      return;
    }

    if (password.length < 8) {
      showMessage(
        'Uyarı',
        'Şifre en az 8 karakter olmalı.'
      );
      return;
    }

    setLoading(true);

    try {
      await register(
        username.trim(),
        email.trim(),
        password
      );

      setPassword('');
      setScreen('login');

      showMessage(
        'Başarılı',
        'Kayıt tamamlandı. Giriş yapabilirsin.'
      );
    } catch (error) {
      showError('Kayıt başarısız', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 10. REFRESH FUNCTION
  // ========================================

  const handleRefresh = async () => {
    setLoading(true);

    try {
      await refreshToken();

      showMessage(
        'Başarılı',
        'JWT token yenilendi.'
      );
    } catch (error) {
      showError('Token yenilenemedi', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 11. LOADING SCREEN
  // ========================================

  if (restoring) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#FF5722"
        />
      </View>
    );
  }

  // ========================================
  // 12. DASHBOARD
  // ========================================

  if (isAuthenticated) {
    return (
      <View style={styles.center}>
        <View style={styles.formCard}>
          <Text style={styles.brand}>
            RecruitFlow AI
          </Text>

          <Text style={styles.formTitle}>
            Dashboard
          </Text>

          <Text style={styles.subtitle}>
            Hoş geldin
            {currentUser ? `, ${currentUser}` : ''}!
          </Text>

          <Text style={styles.success}>
            JWT oturumu aktif.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryText}>
                Token Yenile
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={logout}
          >
            <Text style={styles.outlineText}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ========================================
  // 13. WELCOME SCREEN
  // ========================================

  if (screen === 'welcome') {
    return (
      <View style={styles.welcomeBackground}>
        <View style={styles.welcomeCard}>

          <View style={styles.heroArea}>
            <Image
              source={require('./assets/welcome.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Discover Your{'\n'}Dream Job here
            </Text>

            <Text style={styles.welcomeDescription}>
              Explore all the existing job roles
              based on your interest and study major
            </Text>

            <View style={styles.welcomeButtons}>
              <TouchableOpacity
                style={styles.welcomeLogin}
                onPress={() => setScreen('login')}
              >
                <Text style={styles.welcomeLoginText}>
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.welcomeRegister}
                onPress={() => setScreen('register')}
              >
                <Text style={styles.welcomeRegisterText}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    );
  }

  // ========================================
  // 14. LOGIN / REGISTER SCREEN
  // ========================================

  return (
    <KeyboardAvoidingView
      style={styles.center}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <TouchableOpacity
            onPress={() => setScreen('welcome')}
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.brand}>
            RecruitFlow AI
          </Text>

          <Text style={styles.formTitle}>
            {screen === 'login'
              ? 'Giriş Yap'
              : 'Kayıt Ol'}
          </Text>

          <Text style={styles.subtitle}>
            Akıllı İşe Alım Yönetim Platformu
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          {screen === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="E-posta adresi"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Şifre"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={
              screen === 'login'
                ? handleLogin
                : handleRegister
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryText}>
                {screen === 'login'
                  ? 'Giriş Yap'
                  : 'Hesap Oluştur'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setPassword('');

              setScreen(
                screen === 'login'
                  ? 'register'
                  : 'login'
              );
            }}
          >
            <Text style={styles.switchText}>
              {screen === 'login'
                ? 'Hesabın yok mu? Kayıt ol'
                : 'Zaten hesabın var mı? Giriş yap'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            RecruitFlow AI • Authentication & JWT
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// 15. STYLES
// ==========================================

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 440,
  },

  welcomeBackground: {
    flex: 1,
    backgroundColor: '#FFDFC8',
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  welcomeCard: {
    width: '100%',
    maxWidth: 390,
    height: '94%',
    backgroundColor: '#FFFFFF',
    borderRadius: 38,
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  heroArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  welcomeContent: {
    paddingBottom: 48,
    alignItems: 'center',
  },

  welcomeTitle: {
    color: '#FF5722',
    fontSize: 29,
    lineHeight: 39,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  welcomeDescription: {
    color: '#555555',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 16,
    paddingHorizontal: 10,
  },

  welcomeButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 46,
  },

  welcomeLogin: {
    backgroundColor: '#FF5722',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 10,
    elevation: 5,
  },

  welcomeLoginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  welcomeRegister: {
    paddingVertical: 15,
    paddingHorizontal: 22,
  },

  welcomeRegisterText: {
    color: '#222222',
    fontSize: 15,
    fontWeight: 'bold',
  },

  formCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    elevation: 3,
  },

  backText: {
    color: '#EA580C',
    fontSize: 14,
    marginBottom: 18,
  },

  brand: {
    color: '#EA580C',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 28,
  },

  formTitle: {
    color: '#1F2937',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
  },

  primaryButton: {
    backgroundColor: '#EA580C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: '#EA580C',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },

  outlineText: {
    color: '#EA580C',
    fontWeight: 'bold',
  },

  switchText: {
    color: '#EA580C',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },

  success: {
    color: '#15803D',
    textAlign: 'center',
    marginBottom: 20,
  },

  footer: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 35,
  },
});
