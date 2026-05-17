import { SuiClient } from '@mysten/sui/client';
import { SUI_FULLNODE_URL } from '@/constants/config';

export const suiClient = new SuiClient({
  url: SUI_FULLNODE_URL,
});

export async function testSuiConnection(): Promise<boolean> {
  try {
    const state = await suiClient.getLatestSuiSystemState();
    console.log('[SuiClient] Connection OK, epoch:', state.epoch);
    return true;
  } catch (e) {
    console.error('[SuiClient] Bağlantı HATASI:', e);
    return false;
  }
}

export default suiClient;
