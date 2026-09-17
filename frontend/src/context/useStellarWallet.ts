import { useContext } from 'react';
import { StellarWalletContext } from './StellarWalletContextDef';

export const useStellarWallet = () => useContext(StellarWalletContext);
