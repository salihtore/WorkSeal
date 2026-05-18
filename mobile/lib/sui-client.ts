import { SuiClient } from '@mysten/sui/client';
import { SUI_FULLNODE_URL } from '@/constants/config';

// Testnet RPC alternatifleri (Emülatör ve ağ engellerine karşı yedekler)
const FALLBACK_RPCS = [
  SUI_FULLNODE_URL,
  'https://sui-testnet-endpoint.fc.io',
  'https://sui-testnet.public.blastapi.io',
  'https://testnet.suiet.app',
];

let currentRpcIndex = 0;
export let suiClient = new SuiClient({ url: FALLBACK_RPCS[currentRpcIndex] });

export async function testSuiConnection(): Promise<boolean> {
  for (let i = 0; i < FALLBACK_RPCS.length; i++) {
    try {
      if (i !== currentRpcIndex) {
        currentRpcIndex = i;
        suiClient = new SuiClient({ url: FALLBACK_RPCS[currentRpcIndex] });
      }
      const state = await suiClient.getLatestSuiSystemState();
      console.log(`[SuiClient] Bağlantı OK (${FALLBACK_RPCS[currentRpcIndex]}), epoch:`, state.epoch);
      return true;
    } catch (e: any) {
      console.warn(`[SuiClient] RPC başarısız (${FALLBACK_RPCS[i]}):`, e?.message || e);
    }
  }
  console.error('[SuiClient] Tüm RPC uç noktaları başarısız oldu!');
  return false;
}

export default suiClient;
