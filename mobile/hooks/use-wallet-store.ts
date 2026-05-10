import { create } from "zustand";
import { storage } from "../lib/storage";

interface WalletState {
  address: string | null;
  sessionTopic: string | null;
  isConnected: boolean;
  network: "mainnet" | "testnet" | "devnet";
  login: (address: string, sessionTopic?: string) => Promise<void>;
  logout: () => Promise<void>;
  initSession: () => Promise<void>;
  setNetwork: (network: "mainnet" | "testnet" | "devnet") => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  sessionTopic: null,
  isConnected: false,
  network: "testnet",

  login: async (address, sessionTopic) => {
    await storage.set("wallet_address", address);
    if (sessionTopic) await storage.set("session_topic", sessionTopic);
    set({ address, sessionTopic, isConnected: true });
  },

  logout: async () => {
    await storage.remove("wallet_address");
    await storage.remove("session_topic");
    set({ address: null, sessionTopic: null, isConnected: false });
  },

  initSession: async () => {
    const address = await storage.get("wallet_address");
    const sessionTopic = await storage.get("session_topic");
    if (address) {
      set({ address, sessionTopic, isConnected: true });
    }
  },

  setNetwork: (network) => set({ network }),
}));
