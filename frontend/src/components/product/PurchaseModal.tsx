import React, { useState } from 'react';
import { useStellarWallet } from '../../context/StellarWalletContext';
import { ShieldCheck, ShoppingCart, Lock, ArrowRight } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  category: string;
  priceXlm: number;
  seller: string;
  description: string;
  deliveryTime: string;
  imageUrl: string;
}

interface PurchaseModalProps {
  listing: Listing | null;
  onClose: () => void;
  onPurchaseSuccess: (listingId: string) => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ listing, onClose, onPurchaseSuccess }) => {
  const { isConnected, connectWallet, invokeSorobanContract } = useStellarWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!listing) return null;

  const handlePurchase = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsProcessing(true);
    try {
      // Soroban Product Escrow Contract (`purchase`)
      await invokeSorobanContract('C_PRODUCT_ESCROW_CONTRACT', 'purchase', {
        listingId: listing.id,
        priceXlm: listing.priceXlm,
      });

      onPurchaseSuccess(listing.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span className="badge badge-gold">{listing.category}</span>
            <h2 style={{ fontSize: '1.4rem', color: '#FFF', marginTop: '6px' }}>{listing.title}</h2>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          {listing.description}
        </p>

        {/* Escrow Fee & Settlement Breakdown */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Product Price:</span>
            <span style={{ fontWeight: 700, color: '#FFF' }}>{listing.priceXlm} XLM</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Est. Soroban Gas:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>&lt; 0.0001 XLM</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Delivery Guarantee:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{listing.deliveryTime}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', pt: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>Total XLM Deposit:</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {listing.priceXlm} XLM
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <ShieldCheck size={18} color="var(--accent-gold)" />
          <span>Funds remain locked in Soroban smart contract until delivery is confirmed.</span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" style={{ flex: 2 }} onClick={handlePurchase} disabled={isProcessing}>
            <ShoppingCart size={18} />
            {isProcessing ? 'Processing Soroban Deposit...' : `Deposit ${listing.priceXlm} XLM to Escrow`}
          </button>
        </div>
      </div>
    </div>
  );
};
