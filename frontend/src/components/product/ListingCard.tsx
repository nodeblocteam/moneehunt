import React from 'react';
import { ShoppingBag, Clock, CheckCircle } from 'lucide-react';

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

interface ListingCardProps {
  listing: Listing;
  onSelectListing: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelectListing }) => {
  return (
    <div className="glass-card glass-card-interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span className="badge badge-cyan">{listing.category}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> {listing.deliveryTime}
          </span>
        </div>

        <h3 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '10px' }}>{listing.title}</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
          {listing.description}
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escrow Price</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {listing.priceXlm} <span style={{ fontSize: '0.9rem' }}>XLM</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seller</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
              {listing.seller.slice(0, 4)}...{listing.seller.slice(-4)}
            </div>
          </div>
        </div>

        {listing.isPurchased ? (
          <button className="btn btn-secondary" style={{ width: '100%', cursor: 'default' }} disabled>
            <CheckCircle size={16} color="var(--accent-emerald)" /> Funds Deposited in Escrow
          </button>
        ) : (
          <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => onSelectListing(listing)}>
            <ShoppingBag size={18} /> Buy via Soroban Escrow
          </button>
        )}
      </div>
    </div>
  );
};
