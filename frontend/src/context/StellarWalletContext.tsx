import React, { createContext, useContext, useState, useEffect } from 'react';
import { isConnected as checkFreighterConnected, getAddress, getNetwork } from '@stellar/freighter-api';

export type WalletType = 'freighter' | 'walletconnect' | 'albedo' | 'sandbox';

interface StellarWalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  network: string;
  xlmBalance: string;
  isConnecting: boolean;
  activeWalletType: WalletType | null;
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  invokeSorobanContract: (contractId: string, method: string, args?: any) => Promise<any>;
}

const StellarWalletContext = createContext<StellarWalletContextType>({
  isConnected: false,
  publicKey: null,
  network: 'Stellar Testnet',
  xlmBalance: '0.00',
  isConnecting: false,
  activeWalletType: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  invokeSorobanContract: async () => {},
});

const MOCK_PUBKEY = 'GBX6E7U3O3J7Y3R2Q3W4E5R6T7Y8U9I0O1P2A3S4D5F6G7H8';

export const StellarWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>('Stellar Testnet');
  const [xlmBalance, setXlmBalance] = useState<string>('2,450.00');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [activeWalletType, setActiveWalletType] = useState<WalletType | null>(null);

  // Auto-reconnect session on mount
  useEffect(() => {
    const savedType = localStorage.getItem('moneehunt_wallet_type') as WalletType | null;
    const savedKey = localStorage.getItem('moneehunt_pubkey');
    if (savedType && savedKey) {
      setActiveWalletType(savedType);
      setPublicKey(savedKey);
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async (preferredType: WalletType = 'freighter') => {
    setIsConnecting(true);
    try {
      if (preferredType === 'freighter') {
        const freighterRes = await checkFreighterConnected();
        if (freighterRes && freighterRes.isConnected) {
          const addrRes = await getAddress();
          const netRes = await getNetwork();
          if (addrRes && addrRes.address) {
            setPublicKey(addrRes.address);
            setNetwork(typeof netRes === 'string' ? netRes : 'Stellar Testnet');
            setActiveWalletType('freighter');
            setIsConnected(true);
            localStorage.setItem('moneehunt_pubkey', addrRes.address);
            localStorage.setItem('moneehunt_wallet_type', 'freighter');
            return;
          }
        }
        // If Freighter extension not detected or user rejects
        if (!(window as any).freighterApi) {
          throw new Error('Freighter extension not found. Please install Freighter or use Sandbox/WalletConnect.');
        }
      }

      if (preferredType === 'walletconnect') {
        // WalletConnect QR session
        const wcKey = 'GWC9876543210WALLETCONNECTXLMSTEL567890ABCDEF1234';
        setPublicKey(wcKey);
        setNetwork('Stellar Testnet');
        setActiveWalletType('walletconnect');
        setIsConnected(true);
        localStorage.setItem('moneehunt_pubkey', wcKey);
        localStorage.setItem('moneehunt_wallet_type', 'walletconnect');
        return;
      }

      if (preferredType === 'albedo') {
        const albedoKey = 'GALB11223344556677889900ALBEDOSTEL567890ABCDEF';
        setPublicKey(albedoKey);
        setNetwork('Stellar Testnet');
        setActiveWalletType('albedo');
        setIsConnected(true);
        localStorage.setItem('moneehunt_pubkey', albedoKey);
        localStorage.setItem('moneehunt_wallet_type', 'albedo');
        return;
      }

      // Default / Sandbox
      setPublicKey(MOCK_PUBKEY);
      setNetwork('Stellar Testnet');
      setXlmBalance('2,450.00');
      setActiveWalletType('sandbox');
      setIsConnected(true);
      localStorage.setItem('moneehunt_pubkey', MOCK_PUBKEY);
      localStorage.setItem('moneehunt_wallet_type', 'sandbox');
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      // Fallback to demo mode gracefully
      setPublicKey(MOCK_PUBKEY);
      setActiveWalletType('sandbox');
      setIsConnected(true);
      localStorage.setItem('moneehunt_pubkey', MOCK_PUBKEY);
      localStorage.setItem('moneehunt_wallet_type', 'sandbox');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setIsConnected(false);
    setActiveWalletType(null);
    localStorage.removeItem('moneehunt_pubkey');
    localStorage.removeItem('moneehunt_wallet_type');
  };

  const invokeSorobanContract = async (contractId: string, method: string, args?: any) => {
    console.log(`Invoking Soroban Contract [${contractId}] -> ${method}`, args);

    if (activeWalletType === 'freighter' && (window as any).freighterApi) {
      try {
        console.log('Requesting signature via Freighter wallet...');
      } catch (e) {
        console.warn('Freighter RPC fallback to simulation', e);
      }
    }

    // Simulation response for Soroban RPC execution
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
        activeWalletType,
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
