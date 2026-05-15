/**
 * lib/zklogin.ts — Sui ZkLogin with Enoki
 * İki aşamalı: prepareZkLoginSession() → completeZkLogin()
 */

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
import suiClient from './sui-client';
import { storage } from './storage';

// ─── Sabitler ────────────────────────────────────────────────────────────────

export const GOOGLE_CLIENT_ID =
  '132972981277-tp8bqqg8umps5ke3v1tg0oeednspk3d1.apps.googleusercontent.com';

const MYSTEN_PROVER_URL = 'https://prover-dev.mystenlabs.com/v1';

// ─── Session tipi ────────────────────────────────────────────────────────────

export interface ZkPreparedSession {
  keypair: Ed25519Keypair;
  randomness: string;
  maxEpoch: number;
  nonce: string;
}

interface ZkLoginSession {
  keypair: Ed25519Keypair;
  proof: ZkProof;
  maxEpoch: number;
  salt: string;
  sub: string;
  address: string;
}

interface ZkProof {
  proofPoints: unknown;
  issBase64Details: unknown;
  headerBase64: string;
}

// In-memory session
let _session: ZkLoginSession | null = null;

// ─── Aşama 1: Nonce Hazırla ───────────────────────────────────────────────────

/**
 * Login ekranı mount edildiğinde çağrılır.
 * Epoch alır, keypair + nonce üretir.
 * Bu nonce Google OAuth request'ine parametre olarak geçilir.
 */
export async function prepareZkLoginSession(): Promise<ZkPreparedSession> {
  const { epoch } = await suiClient.getLatestSuiSystemState();
  const maxEpoch = Number(epoch) + 10;
  const keypair = new Ed25519Keypair();
  const randomness = generateRandomness();
  const nonce = generateNonce(keypair.getPublicKey(), maxEpoch, randomness);

  console.log('[ZkLogin] Nonce hazırlandı, maxEpoch:', maxEpoch);
  return { keypair, randomness, maxEpoch, nonce };
}

// ─── Aşama 2: JWT → Enoki → Adres ────────────────────────────────────────────

/**
 * Google OAuth başarıyla tamamlandıktan sonra çağrılır.
 * JWT'yi Enoki'ye gönderir, ZK proof ve Sui adresini alır.
 */
export async function completeZkLogin(
  jwt: string,
  prepared: ZkPreparedSession
): Promise<string> {
  console.log('[ZkLogin] Mysten Prover ZK proof istegi gonderiliyor...');

  // JWT payload'dan sub çıkar (Salt üretmek için)
  const jwtPayload = JSON.parse(
    Buffer.from(jwt.split('.')[1], 'base64').toString('utf-8')
  );
  const sub: string = jwtPayload.sub;

  // Deterministik bir salt üret. Prover max 16 bytes (128 bit) kabul ediyor.
  // Google 'sub' değeri 21 haneli sayılardan oluştuğu için doğrudan BigInt'e çevrilebilir (128 bitten küçüktür).
  const salt = BigInt(sub).toString();

  const proverRes = await fetch(MYSTEN_PROVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jwt,
      extendedEphemeralPublicKey: getExtendedEphemeralPublicKey(prepared.keypair.getPublicKey()),
      maxEpoch: prepared.maxEpoch,
      jwtRandomness: prepared.randomness,
      salt: salt,
      keyClaimName: 'sub',
    }),
  });

  if (!proverRes.ok) {
    const errText = await proverRes.text();
    throw new Error(`Mysten Prover hatası (${proverRes.status}): ${errText}`);
  }

  const proof = await proverRes.json();
  
  // jwtToAddress ile adresi hesapla
  const address = jwtToAddress(jwt, BigInt(salt));

  console.log('[ZkLogin] Adres alındı:', address);

  // In-memory session
  _session = {
    keypair: prepared.keypair,
    proof,
    maxEpoch: prepared.maxEpoch,
    salt,
    sub,
    address,
  };

  // SecureStore'a kaydet
  await storage.saveZkLoginSession({
    secretKey: prepared.keypair.getSecretKey(),
    proof: JSON.stringify(proof),
    maxEpoch: prepared.maxEpoch.toString(),
    salt,
    sub,
    address,
  });

  return address;
}

// ─── Session Restore ─────────────────────────────────────────────────────────

export async function restoreZkLoginSession(): Promise<string | null> {
  if (_session) return _session.address;

  const stored = await storage.loadZkLoginSession();
  if (!stored) return null;

  const { epoch } = await suiClient.getLatestSuiSystemState();
  if (Number(epoch) >= stored.maxEpoch) {
    console.log('[ZkLogin] Session süresi dolmuş.');
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

  tx.setSender(sender);
  const txBytes = await tx.build({ client: suiClient });

  const { bytes, signature: ephemeralSig } =
    await _session.keypair.signTransaction(txBytes);

  const addressSeed = genAddressSeed(
    BigInt(_session.salt),
    'sub',
    _session.sub,
    GOOGLE_CLIENT_ID
  ).toString();

  const zkSig = getZkLoginSignature({
    inputs: { ..._session.proof, addressSeed } as any,
    maxEpoch: _session.maxEpoch,
    userSignature: ephemeralSig,
  });

  const result = await suiClient.executeTransactionBlock({
    transactionBlock: bytes,
    signature: zkSig,
    options: { showEffects: true, showEvents: true },
  });

  if (result.effects?.status?.status !== 'success') {
    throw new Error(`TX başarısız: ${result.effects?.status?.error ?? 'Bilinmeyen hata'}`);
  }

  console.log('[ZkLogin] TX onaylandı:', result.digest);
  return result.digest;
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logoutZkLogin(): Promise<void> {
  _session = null;
  await storage.clearZkLoginSession();
}
