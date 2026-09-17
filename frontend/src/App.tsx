import { useState } from 'react';
import { StellarWalletProvider } from './context/StellarWalletContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TaskList } from './components/milestone/TaskList';
import { TaskCreateForm } from './components/milestone/TaskCreateForm';
import { ListingCard } from './components/product/ListingCard';
import { PurchaseModal } from './components/product/PurchaseModal';
import { Plus, Users, ArrowUpRight } from 'lucide-react';
import type { Task, Listing } from './types';

const INITIAL_TASKS: Task[] = [
  {
    id: 'TASK-8492',
    title: 'Soroban Escrow Smart Contract Audit',
    contractor: 'GAYK3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F',
    totalXlm: 1250,
    fundedXlm: 1250,
    currentMilestone: 1,
    status: 'FUNDED',
    createdAt: '2026-09-08',
    milestones: [
      { id: 1, description: 'Static Analysis & Vulnerability Scan', percent: 30, amountXlm: 375, status: 'COMPLETED' },
      { id: 2, description: 'State Archival & TTL Stress Testing', percent: 40, amountXlm: 500, status: 'IN_PROGRESS' },
      { id: 3, description: 'Final Audit Certificate & Report', percent: 30, amountXlm: 375, status: 'PENDING' },
    ]
  },
  {
    id: 'TASK-9104',
    title: 'MoneeHunt React Frontend Integration',
    contractor: 'GBLP9O8N7M6L5K4J3I2H1G0F9E8D7C6B5A4S3D2',
    totalXlm: 800,
    fundedXlm: 800,
    currentMilestone: 0,
    status: 'FUNDED',
    createdAt: '2026-09-09',
    milestones: [
      { id: 1, description: 'Design System & Component Architecture', percent: 50, amountXlm: 400, status: 'IN_PROGRESS' },
      { id: 2, description: 'Freighter Wallet Connection & Soroban RPC', percent: 50, amountXlm: 400, status: 'PENDING' },
    ]
  }
];

const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'PROD-101',
    title: 'Soroban WASM Audit Template',
    category: 'Digital Product',
    priceXlm: 150,
    seller: 'GCS2E3R4T5Y6U7I8O9P0A1S2D3F4G5H6J7K8L9M0',
    description: 'Production-ready Rust Soroban contract templates for milestone escrow and batch payments.',
    deliveryTime: 'Instant Digital Download',
    imageUrl: '',
  },
  {
    id: 'PROD-102',
    title: 'Custom Smart Contract Security Review',
    category: 'Service',
    priceXlm: 600,
    seller: 'GDM1N2B3V4C5X6Z7A8S9D0F1G2H3J4K5L6M7N8',
    description: 'Comprehensive code review and vulnerability audit for Soroban smart contracts.',
    deliveryTime: '48-Hour Delivery',
    imageUrl: '',
  },
  {
    id: 'PROD-103',
    title: 'Stellar Ecosystem Merchant Link',
    category: 'Domain & SaaS',
    priceXlm: 350,
    seller: 'GBX6E7U3O3J7Y3R2Q3W4E5R6T7Y8U9I0O1P2A3S4',
    description: 'Automated escrow checkout widget for web applications and cross-border merchants.',
    deliveryTime: '24-Hour Delivery',
    imageUrl: '',
  }
];

export function AppContent() {
  const [activeTab, setActiveTab] = useState<'milestone' | 'product' | 'payroll'>('milestone');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
  };

  const handleApproveMilestone = (taskId: string, milestoneId: number) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const updatedMilestones = t.milestones.map(m => {
          if (m.id === milestoneId) return { ...m, status: 'COMPLETED' as const };
          if (m.id === milestoneId + 1) return { ...m, status: 'IN_PROGRESS' as const };
          return m;
        });
        return { ...t, milestones: updatedMilestones };
      }
      return t;
    }));
  };

  const handlePurchaseSuccess = (listingId: string) => {
    setListings(listings.map(l => l.id === listingId ? { ...l, isPurchased: true } : l));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ flex: 1 }}>
        <HeroSection onOpenCreateModal={() => setIsCreateModalOpen(true)} />

        <div id="explore" style={{ maxWidth: '1280px', margin: '0 auto 80px', padding: '0 24px' }}>
          {/* Module Tab Headers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#FFF' }}>
                {activeTab === 'milestone' && 'Task Rewards & Milestone Escrows'}
                {activeTab === 'product' && 'Product & Service Escrow Marketplace'}
                {activeTab === 'payroll' && 'Corporate Payroll & Batch Disbursement'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {activeTab === 'milestone' && 'Lock funds in XLM and release payouts per completed milestone.'}
                {activeTab === 'product' && 'Instant buyer deposits with automated seller delivery guarantees.'}
                {activeTab === 'payroll' && 'Disburse XLM salaries to hundreds of employees in a single Soroban batch.'}
              </p>
            </div>

            {activeTab === 'milestone' && (
              <button className="btn btn-gold" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} /> New Milestone Task
              </button>
            )}
          </div>

          {/* Tab 1: Milestone Escrows */}
          {activeTab === 'milestone' && (
            <TaskList tasks={tasks} onApproveMilestone={handleApproveMilestone} />
          )}

          {/* Tab 2: Product Escrows */}
          {activeTab === 'product' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} onSelectListing={(l) => setSelectedListing(l)} />
              ))}
            </div>
          )}

          {/* Tab 3: Corporate Payroll Overview */}
          {activeTab === 'payroll' && (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <Users size={48} color="var(--accent-gold)" style={{ marginBottom: '16px', opacity: 0.9 }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#FFF' }}>Batch Payroll Escrow Engine</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 28px' }}>
                Upload CSV payroll manifests and disburse XLM salaries to hundreds of employees in a single atomic Soroban transaction.
              </p>
              
              <div style={{ display: 'inline-flex', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '20px 32px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contract State</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>Active on Testnet</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contract ID</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>C_BATCH_PAYROLL...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 24px', background: 'rgba(5, 8, 15, 0.95)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>MoneeHunt</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trustless Escrow Infrastructure for Stellar</div>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <a href="https://github.com/nodeblocteam/moneehunt" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              GitHub Repository <ArrowUpRight size={14} />
            </a>
            <a href="https://stellar.org/soroban" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              Soroban Docs <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isCreateModalOpen && (
        <TaskCreateForm onTaskCreated={handleTaskCreated} onClose={() => setIsCreateModalOpen(false)} />
      )}

      {selectedListing && (
        <PurchaseModal listing={selectedListing} onClose={() => setSelectedListing(null)} onPurchaseSuccess={handlePurchaseSuccess} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StellarWalletProvider>
      <AppContent />
    </StellarWalletProvider>
  );
}
