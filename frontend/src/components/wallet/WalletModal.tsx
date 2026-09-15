import React, { useState } from 'react';
import { useStellarWallet } from '../../context/StellarWalletContext';
import type { WalletType } from '../../context/StellarWalletContext';
import { Wallet, ShieldCheck, QrCode, ExternalLink, Sparkles, AlertCircle, Check } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  badge?: string;
  iconBg: string;
  badgeBg?: string;
  badgeColor?: string;
  popular?: boolean;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter Wallet',
    description: 'Official browser extension for Stellar & Soroban smart contracts',
    badge: 'Recommended',
    iconBg: 'linear-gradient(135deg, #E6AA3A 0%, #C78B27 100%)',
    badgeBg: 'rgba(230, 170, 58, 0.15)',
    badgeColor: 'var(--accent-gold)',
    popular: true,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Scan QR code with Lobstr, xBull, or mobile crypto wallets',
    badge: 'Mobile QR',
    iconBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    badgeColor: '#60A5FA',
  },
  {
    id: 'albedo',
    name: 'Albedo Web Link',
    description: 'Secure browser-based key sign-in without browser extensions',
    iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  },
  {
    id: 'sandbox',
    name: 'Demo Sandbox Wallet',
    description: 'Instant test account with 2,450 XLM pre-funded for evaluation',
    badge: 'Dev Mode',
    iconBg: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
    badgeBg: 'rgba(0, 242, 254, 0.15)',
    badgeColor: 'var(--accent-cyan)',
  },
];

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting, activeWalletType, isConnected } = useStellarWallet();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectWallet = async (type: WalletType) => {
    setErrorMsg(null);
    try {
      await connectWallet(type);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect wallet');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '32px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Wallet size={20} color="var(--accent-gold)" />
              <h2 style={{ fontSize: '1.4rem', color: '#FFF' }}>Connect Stellar Wallet</h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Select your wallet provider to interact with Soroban escrow contracts
            </p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        {/* Wallet Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {WALLET_OPTIONS.map((opt) => {
            const isSelected = isConnected && activeWalletType === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectWallet(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: isSelected
                    ? 'rgba(230, 170, 58, 0.08)'
                    : 'rgba(255, 255, 255, 0.025)',
                  border: isSelected
                    ? '1.5px solid var(--accent-gold)'
                    : '1px solid var(--border-color)',
                  cursor: isConnecting ? 'wait' : 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: opt.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0B0F17',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {opt.id === 'freighter' && <ShieldCheck size={22} />}
                    {opt.id === 'walletconnect' && <QrCode size={22} />}
                    {opt.id === 'albedo' && <ExternalLink size={22} />}
                    {opt.id === 'sandbox' && <Sparkles size={22} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>
                        {opt.name}
                      </span>
                      {opt.badge && (
                        <span
                          className="badge"
                          style={{
                            background: opt.badgeBg,
                            color: opt.badgeColor,
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                          }}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {opt.description}
                    </div>
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--accent-gold)',
                        color: '#0B0F17',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={16} strokeWidth={3} />
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--accent-cyan)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(0, 242, 254, 0.08)',
                      }}
                    >
                      Connect
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>Stellar Testnet Consensus</span>
          <a
            href="https://freighter.app/"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Get Freighter <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
