"use client";

import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  testnet: {
    url: "https://fullnode.testnet.sui.io:443",
    network: "testnet" as const,
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}