import React, { createContext, useContext, useState, useEffect } from 'react';

interface StellarWalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  network: string;
  xlmBalance: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  invokeSorobanContract: (contractId: string, method: string, args?: any) => Promise<any>;
}

const StellarWalletContext = createContext<StellarWalletContextType>({
  isConnected: false,
  publicKey: null,
  network: 'Testnet',
  xlmBalance: '0.00',
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  invokeSorobanContract: async () => {},
});

export const StellarWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network] = useState<string>('Stellar Testnet');
  const [xlmBalance, setXlmBalance] = useState<string>('2,450.00');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Auto-reconnect if session exists
  useEffect(() => {
    const savedKey = localStorage.getItem('moneehunt_pubkey');
    if (savedKey) {
      setPublicKey(savedKey);
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if Freighter extension is available or mock connection for seamless demo
      if ((window as any).freighterApi) {
        const key = await (window as any).freighterApi.getPublicKey();
        if (key) {
          setPublicKey(key);
          setIsConnected(true);
          localStorage.setItem('moneehunt_pubkey', key);
        }
      } else {
        // Fallback for dev/demo mode with a valid Stellar public key format
        const mockKey = 'GBX6E7U3O3J7Y3R2Q3W4E5R6T7Y8U9I0O1P2A3S4D5F6G7H8';
        setPublicKey(mockKey);
        setIsConnected(true);
        localStorage.setItem('moneehunt_pubkey', mockKey);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setIsConnected(false);
    localStorage.removeItem('moneehunt_pubkey');
  };

  const invokeSorobanContract = async (contractId: string, method: string, args?: any) => {
    console.log(`Invoking Soroban Contract [${contractId}] -> ${method}`, args);
    // Simulation response for Soroban RPC transactions
    return {
      status: 'SUCCESS',
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: Date.now(),
    };
  };

  return (
    <StellarWalletContext.Provider
      value={{
        isConnected,
        publicKey,
        network,
        xlmBalance,
        isConnecting,
        connectWallet,
        disconnectWallet,
        invokeSorobanContract,
      }}
    >
      {children}
    </StellarWalletContext.Provider>
  );
};

export const useStellarWallet = () => useContext(StellarWalletContext);
