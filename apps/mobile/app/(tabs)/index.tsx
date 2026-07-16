import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getApiHealth,
  type HealthResponse,
} from '@/services/api';

export default function HomeScreen() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkApi() {
    try {
      setLoading(true);
      setError(null);

      const result = await getApiHealth();

      setData(result);
    } catch (err) {
      setData(null);

      setError(
        err instanceof Error
          ? err.message
          : 'Bilinmeyen bir hata oluştu.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void checkApi();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />

        <Text style={styles.message}>
          API kontrol ediliyor...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>
          Bağlantı hatası
        </Text>

        <Text style={styles.errorMessage}>
          {error}
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => void checkApi()}
        >
          <Text style={styles.buttonText}>
            Tekrar dene
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Code Journey
      </Text>

      <Text style={styles.success}>
        Backend bağlantısı başarılı
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Servis
        </Text>
        <Text style={styles.value}>
          {data?.service}
        </Text>

        <Text style={styles.label}>
          API durumu
        </Text>
        <Text style={styles.value}>
          {data?.status}
        </Text>

        <Text style={styles.label}>
          Veritabanı
        </Text>
        <Text style={styles.value}>
          {data?.database}
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => void checkApi()}
      >
        <Text style={styles.buttonText}>
          Bağlantıyı yenile
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 24,
    fontSize: 32,
    fontWeight: '700',
  },
  success: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    marginTop: 4,
    fontSize: 17,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
  },
  errorTitle: {
    marginBottom: 8,
    fontSize: 22,
    fontWeight: '700',
  },
  errorMessage: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});