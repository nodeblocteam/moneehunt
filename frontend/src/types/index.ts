export type WalletType = 'freighter' | 'walletconnect' | 'albedo' | 'sandbox';

export interface Milestone {
  id: number;
  description: string;
  percent: number;
  amountXlm: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Task {
  id: string;
  title: string;
  contractor: string;
  totalXlm: number;
  fundedXlm: number;
  currentMilestone: number;
  milestones: Milestone[];
  status: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  priceXlm: number;
  seller: string;
  description: string;
  deliveryTime: string;
  imageUrl: string;
  isPurchased?: boolean;
}

export interface StellarWalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  network: string;
  xlmBalance: string;
  isConnecting: boolean;
  activeWalletType: WalletType | null;
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  invokeSorobanContract: (contractId: string, method: string, args?: Record<string, unknown>) => Promise<{
    status: string;
    txHash: string;
    timestamp: number;
  }>;
}
