import { createContext } from 'react';
import type { StellarWalletContextType } from '../types';

export const StellarWalletContext = createContext<StellarWalletContextType>({
  isConnected: false,
  publicKey: null,
  network: 'Stellar Testnet',
  xlmBalance: '0.00',
  isConnecting: false,
  activeWalletType: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  invokeSorobanContract: async () => ({ status: 'SUCCESS', txHash: '', timestamp: 0 }),
});
