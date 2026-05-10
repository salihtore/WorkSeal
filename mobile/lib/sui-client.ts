import { FULLNODE_URL } from "../constants/config";

export const suiClient = {
  async rpcCall(method: string, params: any[]) {
    const response = await fetch(FULLNODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result;
  },

  async getSuiBalance(address: string) {
    const result = await this.rpcCall("suix_getBalance", [address, "0x2::sui::SUI"]);
    return result.totalBalance;
  },

  async getObject(objectId: string) {
    return await this.rpcCall("sui_getObject", [
      objectId,
      { showContent: true, showOwner: true, showDisplay: true },
    ]);
  },

  async multiGetObjects(objectIds: string[]) {
    return await this.rpcCall("sui_multiGetObjects", [
      objectIds,
      { showContent: true, showOwner: true },
    ]);
  },

  async queryEvents(query: any, cursor: any = null, limit: number = 50) {
    return await this.rpcCall("suix_queryEvents", [query, cursor, limit, false]);
  },

  async executeTransactionBlock(txBytes: string, signatures: string[]) {
    return await this.rpcCall("sui_executeTransactionBlock", [
      txBytes,
      signatures,
      { showEffects: true, showEvents: true },
      "WaitForLocalExecution",
    ]);
  },
};
