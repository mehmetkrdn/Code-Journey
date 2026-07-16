const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL tanımlı değil.');
}

export async function getApiHealth() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(`API isteği başarısız: ${response.status}`);
  }

  return response.json();
}