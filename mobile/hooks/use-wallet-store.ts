import { create } from 'zustand';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  network: 'mainnet' | 'testnet' | 'devnet';
  setAddress: (address: string | null) => void;
  setNetwork: (network: 'mainnet' | 'testnet' | 'devnet') => void;
  logout: () => void;
  executeTransaction: (tx: any) => Promise<any>;
  zkLoginData: {
    address: string | null;
    jwt: string | null;
    salt: string | null;
    proof: any | null;
  } | null;
  setZkLoginData: (data: any) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  isConnected: false,
  network: 'testnet',
  zkLoginData: null,
  setAddress: (address) => set({ address, isConnected: !!address }),
  setNetwork: (network) => set({ network }),
  setZkLoginData: (data) => set({ zkLoginData: data }),
  logout: () => set({ address: null, isConnected: false, zkLoginData: null }),
  executeTransaction: async (tx) => {
    console.log('Transaction built:', tx);
    // Simulate wallet interaction delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ digest: '0x' + Math.random().toString(16).slice(2, 10) });
      }, 2000);
    });
  },
}));
