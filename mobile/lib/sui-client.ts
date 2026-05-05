/**
 * Lightweight Sui JSON-RPC Client for React Native
 * Uses plain fetch() - no browser-specific APIs, no polyfills needed
 */

const NETWORKS = {
  mainnet: 'https://fullnode.mainnet.sui.io/',
  testnet: 'https://fullnode.testnet.sui.io/',
  devnet: 'https://fullnode.devnet.sui.io/',
} as const;

export type SuiNetwork = keyof typeof NETWORKS;

let requestId = 1;

async function rpcCall(network: SuiNetwork, method: string, params: any[]) {
  const response = await fetch(NETWORKS[network], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: requestId++,
      method,
      params,
    }),
  });

  const json = await response.json();

  if (json.error) {
    throw new Error(`Sui RPC Error: ${json.error.message}`);
  }

  return json.result;
}

// Get SUI balance for an address
export async function getSuiBalance(address: string, network: SuiNetwork = 'testnet') {
  return rpcCall(network, 'suix_getBalance', [address, '0x2::sui::SUI']);
}

// Get owned objects (contracts, NFTs etc.)
export async function getOwnedObjects(
  address: string,
  structType: string,
  network: SuiNetwork = 'testnet'
) {
  return rpcCall(network, 'suix_getOwnedObjects', [
    address,
    { filter: { StructType: structType }, options: { showContent: true, showType: true } },
    null,
    50,
  ]);
}

// Get a specific object by ID
export async function getObject(objectId: string, network: SuiNetwork = 'testnet') {
  return rpcCall(network, 'sui_getObject', [objectId, { showContent: true, showType: true }]);
}

// Get transaction block details
export async function getTransactionBlock(digest: string, network: SuiNetwork = 'testnet') {
  return rpcCall(network, 'sui_getTransactionBlock', [digest, { showEffects: true, showInput: true }]);
}

// Query events
export async function queryEvents(
  query: any,
  cursor: any = null,
  limit: number = 50,
  descendingOrder: boolean = true,
  network: SuiNetwork = 'testnet'
) {
  return rpcCall(network, 'suix_queryEvents', [query, cursor, limit, descendingOrder]);
}

// Multi get objects
export async function multiGetObjects(
  objectIds: string[],
  options: any = { showContent: true },
  network: SuiNetwork = 'testnet'
) {
  return rpcCall(network, 'sui_multiGetObjects', [objectIds, options]);
}
