/**
 * Slush Wallet Deep-Link Integration
 *
 * WorkSeal uses Slush Wallet (official Sui Wallet by Mysten Labs) for:
 *  1. Wallet connection (get user address)
 *  2. Transaction signing + execution
 *
 * Protocol:
 *  - App opens Slush via deep link with a callback URL
 *  - Slush handles the request and redirects back to workseal://
 *  - App reads the result from the URL parameters
 *
 * Slush Wallet schemes: 'slush://' (Android) or universal link (iOS)
 * App callback scheme: 'workseal://'
 */

import { Linking, Platform, Alert } from 'react-native';
import { SLUSH_SCHEME, APP_SCHEME } from '@/constants/config';
import { Transaction } from '@mysten/sui/transactions';
import suiClient from './sui-client';

// ===== DEEP LINK URLS =====

/** URL user is redirected to after connecting in Slush Wallet */
export const CONNECT_CALLBACK_URL = `${APP_SCHEME}://wallet/connect`;

/** URL user is redirected to after signing a transaction */
export const SIGN_CALLBACK_URL = `${APP_SCHEME}://wallet/sign`;

// ===== CONNECTION =====

/**
 * Opens Slush Wallet for connection.
 * Slush will redirect back to workseal://wallet/connect?address=0x...
 */
export async function connectSlushWallet(): Promise<void> {
  const params = new URLSearchParams({
    app: 'WorkSeal',
    network: 'testnet',
    callback: CONNECT_CALLBACK_URL,
  });

  const url = `${SLUSH_SCHEME}://connect?${params.toString()}`;

  const canOpen = await Linking.canOpenURL(url);

  if (!canOpen) {
    // Try the store link if Slush is not installed
    Alert.alert(
      'Slush Wallet Bulunamadı',
      'Slush Wallet uygulamasını indirin ve tekrar deneyin.',
      [
        {
          text: 'İndir',
          onPress: () => {
            const storeUrl = Platform.select({
              ios: 'https://apps.apple.com/app/slush-sui-wallet/id6462337142',
              android: 'https://play.google.com/store/apps/details?id=com.mystenlabs.suiwallet',
            });
            if (storeUrl) Linking.openURL(storeUrl);
          },
        },
        { text: 'İptal', style: 'cancel' },
      ]
    );
    return;
  }

  await Linking.openURL(url);
}

// ===== TRANSACTION SIGNING =====

/**
 * Serializes a Transaction Block and opens Slush Wallet to sign + execute it.
 * Slush will redirect back to workseal://wallet/sign?digest=<txDigest> on success
 * or workseal://wallet/sign?error=<message> on failure.
 *
 * @param tx - Built Transaction object
 * @param senderAddress - The wallet address to sign with
 */
export async function signAndExecuteViaSlush(
  tx: Transaction,
  senderAddress: string
): Promise<void> {
  // Serialize transaction to base64
  tx.setSender(senderAddress);
  const txBytes = await tx.build({ client: suiClient });
  const txBase64 = Buffer.from(txBytes).toString('base64');

  const params = new URLSearchParams({
    transaction: txBase64,
    address: senderAddress,
    network: 'testnet',
    callback: SIGN_CALLBACK_URL,
  });

  const url = `${SLUSH_SCHEME}://sign-and-execute-transaction?${params.toString()}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error('Slush Wallet uygulaması bulunamadı. Lütfen uygulamayı yükleyin.');
  }

  await Linking.openURL(url);
}

// ===== URL PARSING =====

/**
 * Parses the address from a Slush Wallet connect callback URL.
 * Expected format: workseal://wallet/connect?address=0x...
 */
export function parseConnectCallback(url: string): string | null {
  try {
    // Handle both URL-encoded and raw URLs
    const parsed = new URL(url);
    const address = parsed.searchParams.get('address');
    return address || null;
  } catch {
    // Manual parsing fallback
    const match = url.match(/[?&]address=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

/**
 * Parses the transaction digest from a Slush Wallet sign callback URL.
 * Expected format: workseal://wallet/sign?digest=<txDigest>
 * or workseal://wallet/sign?error=<message>
 */
export function parseSignCallback(url: string): {
  success: boolean;
  digest?: string;
  error?: string;
} {
  try {
    const parsed = new URL(url);
    const digest = parsed.searchParams.get('digest');
    const error = parsed.searchParams.get('error');

    if (error) return { success: false, error: decodeURIComponent(error) };
    if (digest) return { success: true, digest };
    return { success: false, error: 'Bilinmeyen bir hata oluştu.' };
  } catch {
    const digestMatch = url.match(/[?&]digest=([^&]+)/);
    const errorMatch = url.match(/[?&]error=([^&]+)/);

    if (errorMatch) return { success: false, error: decodeURIComponent(errorMatch[1]) };
    if (digestMatch) return { success: true, digest: digestMatch[1] };
    return { success: false, error: 'URL ayrıştırılamadı.' };
  }
}

/**
 * Checks if a URL is a WorkSeal wallet callback
 */
export function isWalletCallback(url: string): boolean {
  return url.startsWith(`${APP_SCHEME}://wallet/`);
}

export function isConnectCallback(url: string): boolean {
  return url.startsWith(`${APP_SCHEME}://wallet/connect`);
}

export function isSignCallback(url: string): boolean {
  return url.startsWith(`${APP_SCHEME}://wallet/sign`);
}
