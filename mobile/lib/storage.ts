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

  async setWalletConnected(): Promise<void> {
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

  // ─── ZkLogin Session ───────────────────────────────────────────────────────

  async saveZkLoginSession(session: {
    secretKey: string;
    proof: string;
    maxEpoch: string;
    salt: string;
    sub: string;
    address: string;
    addressSeed: string;
  }): Promise<void> {
    await SecureStore.setItemAsync('zkl_secret_key', session.secretKey);
    await SecureStore.setItemAsync('zkl_proof', session.proof);
    await SecureStore.setItemAsync('zkl_max_epoch', session.maxEpoch);
    await SecureStore.setItemAsync('zkl_salt', session.salt);
    await SecureStore.setItemAsync('zkl_sub', session.sub);
    await SecureStore.setItemAsync('zkl_address', session.address);
    await SecureStore.setItemAsync('zkl_address_seed', session.addressSeed);
  },

  async loadZkLoginSession(): Promise<{
    secretKey: string;
    proof: string;
    maxEpoch: number;
    salt: string;
    sub: string;
    address: string;
    addressSeed: string;
  } | null> {
    try {
      const secretKey = await SecureStore.getItemAsync('zkl_secret_key');
      const proof = await SecureStore.getItemAsync('zkl_proof');
      const maxEpochStr = await SecureStore.getItemAsync('zkl_max_epoch');
      const salt = await SecureStore.getItemAsync('zkl_salt');
      const sub = await SecureStore.getItemAsync('zkl_sub');
      const address = await SecureStore.getItemAsync('zkl_address');
      const addressSeed = await SecureStore.getItemAsync('zkl_address_seed');

      if (!secretKey || !proof || !maxEpochStr || !salt || !sub || !address || !addressSeed) {
        return null;
      }

      return { secretKey, proof, maxEpoch: Number(maxEpochStr), salt, sub, address, addressSeed };
    } catch {
      return null;
    }
  },

  async clearZkLoginSession(): Promise<void> {
    await SecureStore.deleteItemAsync('zkl_secret_key');
    await SecureStore.deleteItemAsync('zkl_proof');
    await SecureStore.deleteItemAsync('zkl_max_epoch');
    await SecureStore.deleteItemAsync('zkl_salt');
    await SecureStore.deleteItemAsync('zkl_sub');
    await SecureStore.deleteItemAsync('zkl_address');
    await SecureStore.deleteItemAsync('zkl_address_seed');
  },
};
