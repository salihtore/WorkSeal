import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';

// Sui SDK web tarafında crash'e sebep olduğu için şimdilik devre dışı bırakıldı.
// Gerekli hesaplamaları (nonce vb.) manuel veya hafif polyfill'ler ile yapacağız.

export const GOOGLE_CLIENT_ID = "132972981277-st7ns6h16dl4isasrq52l12qmcvrej7n.apps.googleusercontent.com"; 
export const PROVER_URL = "https://prover-dev.mystenlabs.com/v1";
export const SALT_SERVICE_URL = "https://salt.mystenlabs.com/v1"; 

export interface ZkLoginSession {
  ephemeralPrivateKey: string;
  ephemeralPublicKey: string;
  randomness: string;
  maxEpoch: number;
  nonce: string;
}

export async function prepareZkLoginSession(maxEpoch: number = 1000): Promise<ZkLoginSession> {
  // Mock değerler - Uygulamanın 500 hatasından kurtulması için
  const ephemeralPrivateKey = "0x123...";
  const ephemeralPublicKey = "0xabc...";
  const randomness = "12345";
  const nonce = "mock_nonce_" + Math.random().toString(36).substring(7);

  const session: ZkLoginSession = {
    ephemeralPrivateKey,
    ephemeralPublicKey,
    randomness,
    maxEpoch,
    nonce,
  };

  // Store ephemeral private key (with web fallback)
  if (Platform.OS === 'web') {
    localStorage.setItem('zklogin_ephemeral_pri', ephemeralPrivateKey);
    localStorage.setItem('zklogin_randomness', randomness);
    localStorage.setItem('zklogin_max_epoch', maxEpoch.toString());
  } else {
    await SecureStore.setItemAsync('zklogin_ephemeral_pri', ephemeralPrivateKey);
    await SecureStore.setItemAsync('zklogin_randomness', randomness);
    await SecureStore.setItemAsync('zklogin_max_epoch', maxEpoch.toString());
  }

  return session;
}

export function deriveAddress(jwt: string, salt: string): string {
  // Gerçek adresi hesaplamak için SDK'ya ihtiyacımız var, 
  // ancak şimdilik uygulamanın açılması için sabit bir adres dönüyoruz.
  return "0x76543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98";
}

export function getGoogleAuthUrl(nonce: string, redirectUri: string) {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: nonce,
  };
  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}

export async function fetchSalt(jwt: string): Promise<string> {
  return "1234567890"; // Mock salt
}

export async function getZkProof(jwt: string, maxEpoch: number, randomness: string, ephemeralPublicKey: string, salt: string) {
  return { proof: "mock_proof" };
}
