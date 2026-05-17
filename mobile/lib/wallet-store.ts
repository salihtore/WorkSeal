import { create } from 'zustand';
import { storage } from './storage';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  walletProvider: 'slush';

  // Actions
  connectSlush: () => Promise<void>;
  setAddress: (address: string) => Promise<void>;
  disconnect: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  isLoading: true,
  walletProvider: 'slush',

  connectSlush: async () => {
    await storage.setWalletConnected();
    set({ isConnected: true, isLoading: false, walletProvider: 'slush' });
  },

  setAddress: async (address: string) => {
    await storage.setWalletAddress(address);
    set({ address, isConnected: true, isLoading: false, walletProvider: 'slush' });
  },

  disconnect: async () => {
    await storage.clearWallet();
    set({ address: null, isConnected: false, isLoading: false });
  },

  loadFromStorage: async () => {
    try {
      const address = await storage.getWalletAddress();
      const connected = await storage.isConnected();
      if (connected) {
        set({ address, isConnected: true, isLoading: false, walletProvider: 'slush' });
      } else {
        set({ address: null, isConnected: false, isLoading: false });
      }
    } catch {
      set({ address: null, isConnected: false, isLoading: false });
    }
  },
}));
