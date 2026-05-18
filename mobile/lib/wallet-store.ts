import { create } from 'zustand';
import { storage } from './storage';
import { logoutZkLogin, signAndExecuteWithZkLogin } from './zklogin';
import { suiClient } from './sui-client';
import { mistToSui, suiToMist } from '@/types';
import { Alert } from 'react-native';
import { Transaction } from '@mysten/sui/transactions';

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
      const numAmount = Number(amountSui.replace(',', '.'));
      if (isNaN(numAmount) || numAmount <= 0) {
        Alert.alert('Hata', 'Lütfen geçerli bir miktar girin.');
        return false;
      }

      const amountMist = suiToMist(numAmount);
      if (amountMist > balanceMist) {
        Alert.alert('Yetersiz Bakiye', 'Cüzdanınızda transfer ve ağ ücreti (gas) için yeterli SUI bulunmuyor.');
        return false;
      }

      set({ isSyncing: true });

      // Gerçek On-Chain SUI Transfer İşlemi
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [amountMist]);
      tx.transferObjects([coin], recipient);

      console.log('[WalletStore] On-Chain Transfer Başlatıldı, Miktar (MIST):', amountMist);
      const digest = await signAndExecuteWithZkLogin(tx, address);

      Alert.alert(
        '🚀 İşlem Başarıyla İletildi!',
        `${amountSui} SUI, Sui Testnet üzerinde karşı cüzdana transfer edildi.\n\nTxHash: ${digest.slice(0, 14)}...`
      );

      // Gerçek on-chain bakiyeyi senkronize et
      await get().fetchBalance();
      return true;
    } catch (e: any) {
      console.error('[WalletStore] Transfer Hatası:', e);
      Alert.alert('Transfer Başarısız', e?.message || 'İşlem gerçekleştirilemedi.');
      set({ isSyncing: false });
      return false;
    }
  },
}));
