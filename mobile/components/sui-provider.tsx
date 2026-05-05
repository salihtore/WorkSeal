import React, { createContext, useContext } from 'react';
import { SuiNetwork } from '@/lib/sui-client';

interface SuiContextValue {
  network: SuiNetwork;
}

const SuiContext = createContext<SuiContextValue>({ network: 'testnet' });

export function useSuiNetwork(): SuiNetwork {
  return useContext(SuiContext).network;
}

export function SuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <SuiContext.Provider value={{ network: 'testnet' }}>
      {children}
    </SuiContext.Provider>
  );
}
