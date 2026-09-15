import React, { useState } from 'react';
import { useStellarWallet } from '../context/StellarWalletContext';
import { WalletModal } from './wallet/WalletModal';
import { Wallet, Layers, ShoppingBag, Users, ShieldCheck, QrCode, ExternalLink, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'milestone' | 'product' | 'payroll';
  setActiveTab: (tab: 'milestone' | 'product' | 'payroll') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { isConnected, publicKey, xlmBalance, isConnecting, activeWalletType, disconnectWallet } = useStellarWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const formatAddress = (addr: string) => `${addr.slice(0, 5)}...${addr.slice(-4)}`;

  const getWalletBadge = () => {
    switch (activeWalletType) {
      case 'freighter':
        return { name: 'Freighter', icon: <ShieldCheck size={14} color="var(--accent-gold)" /> };
      case 'walletconnect':
        return { name: 'WalletConnect', icon: <QrCode size={14} color="#60A5FA" /> };
      case 'albedo':
        return { name: 'Albedo', icon: <ExternalLink size={14} color="var(--accent-emerald)" /> };
      default:
        return { name: 'Sandbox', icon: <Sparkles size={14} color="var(--accent-cyan)" /> };
    }
  };

  const walletBadge = getWalletBadge();

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(11, 15, 23, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
            onClick={() => setActiveTab('milestone')}
          >
            <img
              src="/assets/logo.svg"
              alt="MoneeHunt"
              style={{ width: '42px', height: '42px' }}
              onError={(e) => {
                (e.target as HTMLElement).setAttribute(
                  'src',
                  'https://raw.githubusercontent.com/nodeblocteam/moneehunt/main/assets/logo.svg'
                );
              }}
            />
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>
                Monee<span style={{ color: 'var(--accent-gold)' }}>Hunt</span>
              </span>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.08em' }}>
                SOROBAN ESCROW
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '6px',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              className={`btn ${activeTab === 'milestone' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              onClick={() => setActiveTab('milestone')}
            >
              <Layers size={16} /> Milestone Escrow
            </button>

            <button
              className={`btn ${activeTab === 'product' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              onClick={() => setActiveTab('product')}
            >
              <ShoppingBag size={16} /> Product Escrow
            </button>

            <button
              className={`btn ${activeTab === 'payroll' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              onClick={() => setActiveTab('payroll')}
            >
              <Users size={16} /> Batch Payroll
            </button>
          </div>

          {/* Wallet & Network Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F2FE' }}></span>
              Stellar Testnet
            </span>

            {isConnected && publicKey ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    {walletBadge.icon}
                    {xlmBalance} XLM
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatAddress(publicKey)}
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  onClick={disconnectWallet}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                className="btn btn-gold"
                onClick={() => setIsWalletModalOpen(true)}
                disabled={isConnecting}
              >
                <Wallet size={18} />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Wallet Selection Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </>
  );
};
