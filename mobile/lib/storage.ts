import * as SecureStore from 'expo-secure-store';

const WALLET_ADDRESS_KEY = 'workseal_wallet_address';
const WALLET_CONNECTED_KEY = 'workseal_wallet_connected';

export const storage = {
  async getWalletAddress(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(WALLET_ADDRESS_KEY);
    } catch {
      return null;
    }
  },

  async setWalletAddress(address: string): Promise<void> {
    await SecureStore.setItemAsync(WALLET_ADDRESS_KEY, address);
    await SecureStore.setItemAsync(WALLET_CONNECTED_KEY, 'true');
  },

  async clearWallet(): Promise<void> {
    await SecureStore.deleteItemAsync(WALLET_ADDRESS_KEY);
    await SecureStore.deleteItemAsync(WALLET_CONNECTED_KEY);
  },

  async isConnected(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(WALLET_CONNECTED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async getString(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setString(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
