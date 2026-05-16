import { create } from 'zustand';
import { storage } from './storage';
import { logoutZkLogin } from './zklogin';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;

  // Actions
  setAddress: (address: string) => Promise<void>;
  disconnect: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  isLoading: true,

  setAddress: async (address: string) => {
    await storage.setWalletAddress(address);
    set({ address, isConnected: true, isLoading: false });
  },

  disconnect: async () => {
    await storage.clearWallet();
    await logoutZkLogin();
    set({ address: null, isConnected: false, isLoading: false });
  },

  loadFromStorage: async () => {
    try {
      const address = await storage.getWalletAddress();
      const connected = await storage.isConnected();
      if (address && connected) {
        set({ address, isConnected: true, isLoading: false });
      } else {
        set({ address: null, isConnected: false, isLoading: false });
      }
    } catch {
      set({ address: null, isConnected: false, isLoading: false });
    }
  },
}));
