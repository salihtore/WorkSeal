/**
 * index.js — Özel entry point
 *
 * Bu dosya expo-router/entry'den ÖNCE çalışır.
 * Polyfill sırası kritik:
 *
 * 1. react-native-get-random-values  → global.crypto.getRandomValues
 *    @noble/hashes, globalThis.crypto'yu modül yüklenirken yakalar.
 *    Bu import HER ŞEYDEN önce gelmeli, aksi hâlde WalletConnect
 *    "crypto.getRandomValues must be defined" hatası verir.
 *
 * 2. Buffer → base64 işlemleri
 *
 * 3. globalThis.crypto sync → Hermes New Arch'ta global ≠ globalThis olabilir
 *
 * 4. expo-router/entry → uygulamanın geri kalanı
 */

// ① En kritik — @noble/hashes bunu modül init sırasında arar
import 'react-native-get-random-values';

// ② Buffer
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// ③ Hermes New Architecture: globalThis.crypto'yu global.crypto ile senkronize et
//    @noble/hashes: const crypto = globalThis.crypto || ...
//    react-native-get-random-values sadece global.crypto'yu patch'ler
if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto = global.crypto;
}

// ④ URL polyfill — WalletConnect URL parsing için
import 'react-native-url-polyfill/auto';

// ⑤ Uygulamayı başlat
import 'expo-router/entry';
