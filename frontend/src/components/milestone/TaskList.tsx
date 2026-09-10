import React, { useState } from 'react';
import { useStellarWallet } from '../../context/StellarWalletContext';
import { CheckCircle2, Clock, ShieldAlert, ArrowRight, Layers, FileCode2 } from 'lucide-react';

interface Milestone {
  id: number;
  description: string;
  percent: number;
  amountXlm: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Task {
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

interface TaskListProps {
  tasks: Task[];
  onApproveMilestone: (taskId: string, milestoneId: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onApproveMilestone }) => {
  const { invokeSorobanContract } = useStellarWallet();
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApprove = async (taskId: string, milestoneId: number) => {
    setApprovingId(`${taskId}-${milestoneId}`);
    try {
      await invokeSorobanContract('C_MILESTONE_ESCROW_CONTRACT', 'approve_milestone', {
        taskId,
        milestoneId,
      });
      onApproveMilestone(taskId, milestoneId);
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {tasks.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Layers size={48} color="var(--accent-gold)" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#FFF' }}>No Milestone Escrows Created Yet</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Lock XLM in self-enforcing Soroban smart contracts to hire developers or launch bounties.</p>
        </div>
      ) : (
        tasks.map((task) => {
          const completedCount = task.milestones.filter(m => m.status === 'COMPLETED').length;
          const progressPercent = Math.round((completedCount / task.milestones.length) * 100);

          return (
            <div key={task.id} className="glass-card glass-card-interactive" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="badge badge-gold">{task.id}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created {task.createdAt}</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: '#FFF' }}>{task.title}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode2 size={14} color="var(--accent-cyan)" /> Contractor: <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{task.contractor}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {task.totalXlm} <span style={{ fontSize: '1rem' }}>XLM</span>
                  </div>
                  <span className={`badge ${progressPercent === 100 ? 'badge-emerald' : 'badge-cyan'}`}>
                    {progressPercent === 100 ? 'Settled & Released' : `${completedCount}/${task.milestones.length} Milestones`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>Escrow Milestone Progress</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-cyan) 100%)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              {/* Milestone Stages List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {task.milestones.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '14px',
                      background: m.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.08)' : m.status === 'IN_PROGRESS' ? 'rgba(0, 242, 254, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${m.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : m.status === 'IN_PROGRESS' ? 'rgba(0, 242, 254, 0.2)' : 'var(--border-color)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {m.status === 'COMPLETED' ? (
                        <CheckCircle2 size={20} color="var(--accent-emerald)" />
                      ) : m.status === 'IN_PROGRESS' ? (
                        <Clock size={20} color="var(--accent-cyan)" />
                      ) : (
                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px stroke var(--border-color)', display: 'inline-block' }}></span>
                      )}
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: m.status === 'COMPLETED' ? '#FFF' : 'var(--text-main)' }}>
                          Stage {m.id}: {m.description}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Allocation: {m.percent}% ({m.amountXlm} XLM)
                        </div>
                      </div>
                    </div>

                    <div>
                      {m.status === 'COMPLETED' ? (
                        <span style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Released <CheckCircle2 size={14} />
                        </span>
                      ) : m.status === 'IN_PROGRESS' ? (
                        <button
                          className="btn btn-cyan"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                          disabled={approvingId === `${task.id}-${m.id}`}
                          onClick={() => handleApprove(task.id, m.id)}
                        >
                          {approvingId === `${task.id}-${m.id}` ? 'Releasing Funds...' : 'Approve & Release XLM'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pending Stage</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
