import { useState } from "react";
import * as Linking from "expo-linking";
import { getSignClient, clearSignClient } from "../lib/walletconnect";
import { useWalletStore } from "./use-wallet-store";
import { Alert } from "react-native";

export const useWalletConnect = () => {
  const { address, sessionTopic, login, logout } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const client = await getSignClient();
      
      const { uri, approval } = await client.connect({
        requiredNamespaces: {
          sui: {
            methods: [
              "sui_signAndExecuteTransactionBlock",
              "sui_signTransactionBlock",
              "sui_signMessage",
            ],
            chains: ["sui:testnet"],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });

      if (uri) {
        const slushUri = `slush://wc?uri=${encodeURIComponent(uri)}`;
        const canOpen = await Linking.canOpenURL(slushUri);
        
        if (canOpen) {
          await Linking.openURL(slushUri);
        } else {
          await Linking.openURL(`wc:${uri}`);
        }
      }

      const session = await approval();
      const walletAddress = session.namespaces.sui.accounts[0].split(":").pop();
      
      if (walletAddress) {
        await login(walletAddress, session.topic);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      const client = await getSignClient();
      if (sessionTopic) {
        await client.disconnect({
          topic: sessionTopic,
          reason: { code: 6000, message: "User disconnected" },
        });
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    } finally {
      clearSignClient();
      await logout();
    }
  };

  const signAndExecute = async (txBase64: string): Promise<string> => {
    if (!sessionTopic || !address) {
      throw new Error("Wallet not connected");
    }

    setIsPending(true);
    try {
      const client = await getSignClient();
      const result = await client.request({
        topic: sessionTopic,
        chainId: "sui:testnet",
        request: {
          method: "sui_signAndExecuteTransactionBlock",
          params: {
            transactionBlock: txBase64,
            options: {
              showEffects: true,
              showEvents: true,
            },
          },
        },
      });

      return (result as any).digest;
    } catch (err: any) {
      Alert.alert("Transaction Error", err.message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    connect,
    disconnect,
    signAndExecute,
    isConnecting,
    isPending,
    error,
  };
};
