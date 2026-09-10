import React, { useState } from 'react';
import { useStellarWallet } from '../../context/StellarWalletContext';
import { PlusCircle, Trash2, Shield } from 'lucide-react';

interface TaskCreateFormProps {
  onTaskCreated: (task: any) => void;
  onClose: () => void;
}

export const TaskCreateForm: React.FC<TaskCreateFormProps> = ({ onTaskCreated, onClose }) => {
  const { isConnected, connectWallet, invokeSorobanContract } = useStellarWallet();
  const [title, setTitle] = useState('');
  const [contractor, setContractor] = useState('');
  const [totalBudget, setTotalBudget] = useState('500');
  const [milestones, setMilestones] = useState([
    { description: 'Initial Architecture & Contract Draft', percent: 30 },
    { description: 'Soroban WASM Implementation & Unit Tests', percent: 40 },
    { description: 'Final Audit & Frontend Integration', percent: 30 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMilestone = () => {
    setMilestones([...milestones, { description: 'New Milestone Stage', percent: 20 }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsSubmitting(true);
    try {
      // Soroban Milestone Contract Invocation (`create_task`)
      await invokeSorobanContract('C_MILESTONE_ESCROW_CONTRACT', 'create_task', {
        title,
        contractor,
        budget: totalBudget,
        milestonesCount: milestones.length,
      });

      const newTask = {
        id: 'TASK-' + Math.floor(1000 + Math.random() * 9000),
        title,
        contractor: contractor || 'G...CONTRACTOR',
        totalXlm: parseFloat(totalBudget),
        fundedXlm: parseFloat(totalBudget),
        currentMilestone: 0,
        milestones: milestones.map((m, idx) => ({
          id: idx + 1,
          description: m.description,
          percent: m.percent,
          amountXlm: (parseFloat(totalBudget) * m.percent) / 100,
          status: idx === 0 ? 'IN_PROGRESS' : 'PENDING',
        })),
        status: 'FUNDED',
        createdAt: new Date().toLocaleDateString(),
      };

      onTaskCreated(newTask);
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
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
      <div className="glass-card" style={{ maxWidth: '640px', width: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#FFF' }}>Create Milestone Escrow</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Programmable task bounties settled in XLM via Soroban</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label">Task / Bounty Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Soroban Smart Contract Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Contractor Public Key (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="G..."
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Total Escrow Budget (XLM)</label>
              <input
                type="number"
                className="input-field"
                placeholder="500"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Milestones Breakdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label className="input-label">Milestone Breakdown</label>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={addMilestone}>
                <PlusCircle size={14} /> Add Stage
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {milestones.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>#{idx + 1}</span>
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
                    value={m.description}
                    onChange={(e) => {
                      const copy = [...milestones];
                      copy[idx].description = e.target.value;
                      setMilestones(copy);
                    }}
                  />
                  <input
                    type="number"
                    className="input-field"
                    style={{ width: '80px', padding: '8px 10px', fontSize: '0.88rem', textAlign: 'center' }}
                    value={m.percent}
                    onChange={(e) => {
                      const copy = [...milestones];
                      copy[idx].percent = parseInt(e.target.value) || 0;
                      setMilestones(copy);
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>%</span>
                  {milestones.length > 1 && (
                    <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }} onClick={() => removeMilestone(idx)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
              <Shield size={18} />
              {isSubmitting ? 'Locking Funds in Soroban...' : 'Lock Funds & Deposit Escrow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
