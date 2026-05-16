import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import {
  generateNonce,
  generateRandomness,
  getZkLoginSignature,
  genAddressSeed,
  jwtToAddress,
  getExtendedEphemeralPublicKey,
} from '@mysten/sui/zklogin';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import suiClient from './sui-client';
import { storage } from './storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export const GOOGLE_CLIENT_ID =
  '132972981277-tp8bqqg8umps5ke3v1tg0oeednspk3d1.apps.googleusercontent.com';

const MYSTEN_PROVER_URL = 'https://api.enoki.mystenlabs.com/v1/zklogin/zkp';
const ENOKI_API_KEY = 'enoki_public_0560d77e8763a5315131faefe10d4a1d';

export interface ZkPreparedSession {
  keypair: Ed25519Keypair;
  randomness: string;
  maxEpoch: number;
  nonce: string;        // raw nonce — Prover'a gidecek
  hashedNonce: string;  // SHA-256 hash — Google'a gidecek
}

interface ZkLoginSession {
  keypair: Ed25519Keypair;
  proof: ZkProof;
  maxEpoch: number;
  salt: string;
  sub: string;
  address: string;
  addressSeed: string;
}

interface ZkProof {
  proofPoints: unknown;
  issBase64Details: unknown;
  headerBase64: string;
}

let _session: ZkLoginSession | null = null;

async function getOrCreateSalt(sub: string, jwt?: string): Promise<string> {
  const key = `zk_salt_${sub}`;
  const stored = await SecureStore.getItemAsync(key);
  if (stored) return stored;

  if (jwt) {
    try {
      console.log('[ZkLogin] Enoki Salt servisine istek atılıyor...');
      const saltRes = await fetch('https://api.enoki.mystenlabs.com/v1/zklogin/salt', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ENOKI_API_KEY}`,
          'zklogin-jwt': jwt,
        },
      });
      if (saltRes.ok) {
        const json = await saltRes.json();
        const enokiSalt = json.data?.salt || json.salt;
        if (enokiSalt) {
          console.log('[ZkLogin] Enoki resmi salt alındı:', enokiSalt);
          await SecureStore.setItemAsync(key, enokiSalt);
          return enokiSalt;
        }
      } else {
        const text = await saltRes.text();
        console.warn('[ZkLogin] Enoki Salt servisi hata verdi:', saltRes.status, text);
      }
    } catch (e: any) {
      console.warn('[ZkLogin] Enoki Salt servisine erişilemedi:', e.message);
    }
  }

  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const hex = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const salt = BigInt('0x' + hex).toString();

  console.log('[ZkLogin] Lokalde yeni salt üretildi:', salt);
  await SecureStore.setItemAsync(key, salt);
  return salt;
}

let _cachedPreparedSession: ZkPreparedSession | null = null;

// ─── Aşama 1: Nonce Hazırla ──────────────────────────────────────────────────

export async function prepareZkLoginSession(): Promise<ZkPreparedSession> {
  if (_cachedPreparedSession) {
    console.log('[ZkLogin] Var olan hazırlık oturumu kullanılıyor (Hash):', _cachedPreparedSession.hashedNonce);
    return _cachedPreparedSession;
  }

  let epoch: string;

  try {
    const state = await suiClient.getLatestSuiSystemState();
    epoch = state.epoch;
  } catch (e: any) {
    console.error('[ZkLogin] Sui RPC hatası:', e.message);
    const res = await fetch('https://fullnode.testnet.sui.io:443', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getLatestSuiSystemState',
        params: [],
      }),
    });
    const json = await res.json();
    if (!json.result) throw new Error('Sui RPC yanıt vermedi');
    epoch = json.result.epoch;
  }

  const maxEpoch = Number(epoch) + 10;
  const keypair = new Ed25519Keypair();
  const pubKey = keypair.getPublicKey();
  const pubKeyBase64 = pubKey.toBase64();
  console.log('[ZkLogin] PubKey base64:', pubKeyBase64, 'length:', pubKeyBase64.length);

  if (pubKeyBase64.length !== 44) {
    throw new Error('Ed25519 public key formatı geçersiz: ' + pubKeyBase64.length);
  }

  const randomness = generateRandomness();
  const nonce = generateNonce(keypair.getPublicKey(), maxEpoch, randomness);

  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    nonce
  );

  console.error('[ZkLogin] Nonce hazırlandı, maxEpoch:', maxEpoch);
  _cachedPreparedSession = { keypair, randomness, maxEpoch, nonce, hashedNonce };
  return _cachedPreparedSession;
}

// ─── Aşama 2: JWT → Prover → Adres ───────────────────────────────────────────

export async function completeZkLogin(
  jwt: string,
  prepared: ZkPreparedSession
): Promise<string> {
  console.log('[ZkLogin] JWT alındı, ZK proof isteniyor...');

  const jwtPayload = JSON.parse(
    Buffer.from(jwt.split('.')[1], 'base64').toString('utf-8')
  );

  console.log('[ZkLogin] JWT payload nonce:', jwtPayload.nonce);
  console.log('[ZkLogin] Beklenen raw nonce:', prepared.nonce);

  if (!jwtPayload.nonce) {
    throw new Error('Google JWT içinde nonce claim bulunamadı.');
  }

  if (jwtPayload.nonce !== prepared.nonce) {
    throw new Error(
      `Nonce eşleşmiyor.\nJWT: ${jwtPayload.nonce}\nBeklenen Raw: ${prepared.nonce}`
    );
  }

  const sub: string = jwtPayload.sub;
  const aud: string = typeof jwtPayload.aud === 'string' ? jwtPayload.aud : jwtPayload.aud[0];
  const salt = await getOrCreateSalt(sub, jwt);

  const localSeedBigInt = genAddressSeed(BigInt(salt), 'sub', sub, aud);
  const localSeedStr = localSeedBigInt.toString();

  const keypairPubKey = prepared.keypair.getPublicKey();
  const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(keypairPubKey);
  console.log('[ZkLogin] Extended EPK:', extendedEphemeralPublicKey);

  const proverRes = await fetch(MYSTEN_PROVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ENOKI_API_KEY}`,
      'zklogin-jwt': jwt,
    },
    body: JSON.stringify({
      ephemeralPublicKey: extendedEphemeralPublicKey,
      maxEpoch: prepared.maxEpoch,
      randomness: prepared.randomness,
      salt,
      keyClaimName: 'sub',
      network: 'testnet',
    }),
  });

  if (!proverRes.ok) {
    const errText = await proverRes.text();
    throw new Error(`Enoki Prover hatası (${proverRes.status}): ${errText}`);
  }

  const resJson = await proverRes.json();
  const proof = resJson.data || resJson;
  const addressSeed = proof.addressSeed || localSeedStr;
  const address = jwtToAddress(jwt, BigInt(salt));

  console.log('[ZkLogin] Adres alındı:', address);
  console.log('[ZkLogin] Proof addressSeed:', addressSeed);
  console.log('[ZkLogin] Proof Points:', JSON.stringify(proof.proofPoints));
  console.log('[ZkLogin] issBase64Details:', JSON.stringify(proof.issBase64Details));
  console.log('[ZkLogin] headerBase64:', proof.headerBase64?.slice(0, 30));

  _session = {
    keypair: prepared.keypair,
    proof,
    maxEpoch: prepared.maxEpoch,
    salt,
    sub,
    address,
    addressSeed,
  };

  await storage.saveZkLoginSession({
    secretKey: prepared.keypair.getSecretKey(),
    proof: JSON.stringify(proof),
    maxEpoch: prepared.maxEpoch.toString(),
    salt,
    sub,
    address,
    addressSeed,
  });

  _cachedPreparedSession = null;
  return address;
}

// ─── Session Restore ──────────────────────────────────────────────────────────

export async function restoreZkLoginSession(): Promise<string | null> {
  if (_session) return _session.address;

  const stored = await storage.loadZkLoginSession();
  if (!stored) return null;

  let epoch: string;
  try {
    const state = await suiClient.getLatestSuiSystemState();
    epoch = state.epoch;
  } catch (e: any) {
    console.error('[ZkLogin] Restore RPC hatası:', e.message);
    const res = await fetch('https://fullnode.testnet.sui.io:443', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getLatestSuiSystemState',
        params: [],
      }),
    });
    const json = await res.json();
    if (!json.result) return null;
    epoch = json.result.epoch;
  }

  if (Number(epoch) >= stored.maxEpoch) {
    console.error('[ZkLogin] Session süresi dolmuş.');
    await storage.clearZkLoginSession();
    return null;
  }

  const keypair = Ed25519Keypair.fromSecretKey(stored.secretKey);
  _session = {
    keypair,
    proof: JSON.parse(stored.proof),
    maxEpoch: stored.maxEpoch,
    salt: stored.salt,
    sub: stored.sub,
    address: stored.address,
    addressSeed: stored.addressSeed,
  };

  console.log('[ZkLogin] Session restore edildi:', stored.address);
  return stored.address;
}

// ─── TX İmzalama ─────────────────────────────────────────────────────────────

export async function signAndExecuteWithZkLogin(
  tx: Transaction,
  sender: string
): Promise<string> {
  if (!_session) throw new Error('Oturum açık değil. Lütfen tekrar giriş yapın.');

  try {
    tx.setSender(sender);
    const txBytes = await tx.build({ client: suiClient });

    const { bytes, signature: ephemeralSig } =
      await _session.keypair.signTransaction(txBytes);

    console.log('[ZkLogin] İmza Hazırlığı - Sender:', sender);
    console.log('[ZkLogin] maxEpoch:', _session.maxEpoch);
    console.log('[ZkLogin] addressSeed:', _session.addressSeed);

    const zkSig = getZkLoginSignature({
      inputs: { ..._session.proof, addressSeed: _session.addressSeed } as any,
      maxEpoch: _session.maxEpoch,
      userSignature: ephemeralSig,
    });

    const result = await suiClient.executeTransactionBlock({
      transactionBlock: bytes,
      signature: zkSig,
      options: { showEffects: true, showEvents: true },
    });

    if (result.effects?.status?.status !== 'success') {
      throw new Error(
        `TX başarısız: ${result.effects?.status?.error ?? 'Bilinmeyen hata'}`
      );
    }

    console.log('[ZkLogin] TX onaylandı:', result.digest);
    return result.digest;
  } catch (err: any) {
    const debugInfo = `\n\n[ZK DEVRE BİLGİSİ]\nSender: ${sender.slice(0, 10)}...\nEpoch: ${_session.maxEpoch}\nSeed: ${_session.addressSeed.slice(0, 15)}...\nProofKeys: ${Object.keys(_session.proof || {}).join(', ')}`;
    throw new Error(err.message + debugInfo);
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logoutZkLogin(): Promise<void> {
  if (_session?.sub) {
    await SecureStore.deleteItemAsync(`zk_salt_${_session.sub}`);
  }
  _session = null;
  _cachedPreparedSession = null;
  await storage.clearZkLoginSession();
}