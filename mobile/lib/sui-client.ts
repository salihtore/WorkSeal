import { SuiClient } from '@mysten/sui/client';
import { SUI_FULLNODE_URL } from '@/constants/config';

// Singleton SuiClient instance — shared across the entire app
export const suiClient = new SuiClient({
  url: SUI_FULLNODE_URL,
});

export default suiClient;
