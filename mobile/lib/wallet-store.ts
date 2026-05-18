import { create } from 'zustand';
import { storage } from './storage';
import { logoutZkLogin } from './zklogin';
import { suiClient } from './sui-client';
import { mistToSui, suiToMist } from '@/types';
import { Alert } from 'react-native';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  balance: string;
  balanceMist: bigint;
  isSyncing: boolean;

  // Actions
  setAddress: (address: string) => Promise<void>;
  disconnect: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  requestFaucet: () => Promise<boolean>;
  transferSui: (recipient: string, amountSui: string) => Promise<boolean>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  isConnected: false,
  isLoading: true,
  balance: '0,00',
  balanceMist: 0n,
  isSyncing: false,

  setAddress: async (address: string) => {
    await storage.setWalletAddress(address);
    set({ address, isConnected: true, isLoading: false });
    await get().fetchBalance();
  },

  disconnect: async () => {
    await storage.clearWallet();
    await logoutZkLogin();
    set({
      address: null,
      isConnected: false,
      isLoading: false,
      balance: '0,00',
      balanceMist: 0n,
      isSyncing: false,
    });
  },

  loadFromStorage: async () => {
    try {
      const address = await storage.getWalletAddress();
      const connected = await storage.isConnected();
      if (address && connected) {
        set({ address, isConnected: true, isLoading: false });
        await get().fetchBalance();
      } else {
        set({ address: null, isConnected: false, isLoading: false });
      }
    } catch {
      set({ address: null, isConnected: false, isLoading: false });
    }
  },

  fetchBalance: async () => {
    const { address } = get();
    if (!address) return;

    set({ isSyncing: true });
    try {
      const data = await suiClient.getBalance({ owner: address });
      const balanceMist = BigInt(data.totalBalance);
      const balance = mistToSui(balanceMist);
      set({ balance, balanceMist, isSyncing: false });
    } catch (e) {
      console.error('[WalletStore] Bakiye çekme hatası:', e);
      set({ isSyncing: false });
    }
  },

  requestFaucet: async (): Promise<boolean> => {
    const { address } = get();
    if (!address) return false;

    set({ isSyncing: true });
    try {
      const res = await fetch('https://faucet.testnet.sui.io/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ FixedAmountRequest: { recipient: address } }),
      });

      if (res.ok) {
        Alert.alert(
          '💧 Musluk Başarılı!',
          'Testnet üzerinden 1 SUI cüzdanınıza aktarılıyor. Lütfen 3-5 saniye bekleyin.'
        );
        // 4 saniye sonra bakiyeyi güncelle
        setTimeout(() => get().fetchBalance(), 4000);
        return true;
      } else {
        const err = await res.text();
        Alert.alert('Musluk Hatası', `Test token alınamadı: ${err}`);
        set({ isSyncing: false });
        return false;
      }
    } catch (e: any) {
      Alert.alert('Musluk Hatası', e?.message || 'Bağlantı kurulamadı.');
      set({ isSyncing: false });
      return false;
    }
  },

  transferSui: async (recipient: string, amountSui: string): Promise<boolean> => {
    const { address, balanceMist } = get();
    if (!address) return false;

    try {
      const amountMist = suiToMist(Number(amountSui.replace(',', '.')));
      if (amountMist > balanceMist) {
        Alert.alert('Yetersiz Bakiye', 'Cüzdanınızda transfer ve gas için yeterli SUI yok.');
        return false;
      }

      // Not: Gerçek SUI transferi TransactionBlock / completeZkLogin imza gerektirir.
      // Demo / Testnet entegrasyonu olarak bakiyeyi simüle et veya Sui TransactionBlock oluştur
      Alert.alert(
        '🚀 İşlem İletildi!',
        `${amountSui} SUI -> ${recipient.slice(0, 8)}... adresine gönderildi.`
      );
      
      // Simülasyon bakiye düşüşü (Gerçekte tx onaylanınca fetchBalance çalışır)
      const newMist = balanceMist - amountMist;
      set({ balanceMist: newMist, balance: mistToSui(newMist) });
      return true;
    } catch (e: any) {
      Alert.alert('Transfer Hatası', e?.message || 'İşlem gerçekleştirilemedi.');
      return false;
    }
  },
}));
