import React from 'react';
import { ShieldCheck, Zap, Lock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onOpenCreateModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenCreateModal }) => {
  return (
    <section style={{ padding: '60px 24px 40px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
      {/* Top Banner Tag */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(230, 170, 58, 0.1)', border: '1px solid rgba(230, 170, 58, 0.3)', marginBottom: '24px' }}>
        <ShieldCheck size={16} color="var(--accent-gold)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
          Powered by Soroban Smart Contracts on Stellar
        </span>
      </div>

      {/* Main Headline */}
      <h1 style={{ fontSize: '3.6rem', lineHeight: 1.1, marginBottom: '20px', maxWidth: '900px', margin: '0 auto 20px' }}>
        Trustless Escrow Infrastructure for the <span className="gradient-text-gold">Stellar Economy</span>
      </h1>

      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto 36px', lineHeight: 1.6 }}>
        Replace trust-based agreements with self-enforcing Soroban smart contracts. Funds are locked in XLM, milestones are verified, and settlements execute in sub-seconds.
      </p>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '50px' }}>
        <button className="btn btn-gold" style={{ padding: '14px 28px', fontSize: '1.05rem' }} onClick={onOpenCreateModal}>
          Create Escrow Agreement <ArrowUpRight size={20} />
        </button>
        <a href="#explore" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
          Explore Escrow Contracts
        </a>
      </div>

      {/* Investor Metric Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="var(--accent-gold)" /> Total Value Locked
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFF' }}>
            $14.2M <span style={{ fontSize: '1rem', color: 'var(--accent-gold)', fontWeight: 600 }}>XLM</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> +34% MoM Escrow Growth
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="var(--accent-cyan)" /> Settlement Finality
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFF' }}>
            3.8<span style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>s</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Stellar SCP Consensus Speed
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" /> Gas Efficiency
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFF' }}>
            &lt; $0.0001
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            Sub-cent micro-escrows viable
          </div>
        </div>
      </div>
    </section>
  );
};
