import React, { useState, useRef, useCallback } from 'react';
import { useStellarWallet } from '../../context/StellarWalletContext';
import {
  Upload,
  FileSpreadsheet,
  Users,
  Coins,
  Zap,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  Download,
} from 'lucide-react';

interface PayrollRecipient {
  address: string;
  amount: number;
  label: string;
}

interface BatchResult {
  txHash: string;
  totalDisbursed: number;
  recipientCount: number;
  timestamp: number;
}

type DashboardState = 'upload' | 'preview' | 'success';

const SAMPLE_CSV = `address,amount,label
GABC1234567890ABCDEFGHIJ1234567890ABCDEFGHIJ12345678,250,Alice - Engineering
GDEF9876543210FEDCBAHIJK9876543210FEDCBAHIJK98765432,180,Bob - Design
GGHI5555666677778888AAAA5555666677778888AAAA55556666,320,Carol - Product
GJKL1111222233334444BBBB1111222233334444BBBB11112222,150,Dave - Marketing`;

function parseCSV(text: string): { recipients: PayrollRecipient[]; errors: string[] } {
  const lines = text.trim().split('\n');
  const recipients: PayrollRecipient[] = [];
  const errors: string[] = [];

  // Skip header if present
  const startIdx = lines[0]?.toLowerCase().includes('address') ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map((s) => s.trim());
    const [address, amountStr, label] = parts;

    if (!address || !amountStr) {
      errors.push(`Row ${i + 1}: missing address or amount`);
      continue;
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${i + 1}: invalid amount "${amountStr}"`);
      continue;
    }

    if (!address.startsWith('G') || address.length < 10) {
      errors.push(`Row ${i + 1}: invalid Stellar address "${address.slice(0, 12)}..."`);
      continue;
    }

    recipients.push({ address, amount, label: label || '' });
  }

  return { recipients, errors };
}

export const PayrollDashboard: React.FC = () => {
  const { isConnected, connectWallet, invokeSorobanContract } = useStellarWallet();
  const [state, setState] = useState<DashboardState>('upload');
  const [recipients, setRecipients] = useState<PayrollRecipient[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalXlm = recipients.reduce((sum, r) => sum + r.amount, 0);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseErrors(['Please upload a .csv file']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { recipients: parsed, errors } = parseCSV(text);
      setParseErrors(errors);
      if (parsed.length > 0) {
        setRecipients(parsed);
        setState('preview');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moneehunt_payroll_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemoveRecipient = (index: number) => {
    const updated = recipients.filter((_, i) => i !== index);
    if (updated.length === 0) {
      handleReset();
    } else {
      setRecipients(updated);
    }
  };

  const handleExecute = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsExecuting(true);
    try {
      const result = await invokeSorobanContract('C_BATCH_PAYROLL_CONTRACT', 'execute_payroll', {
        recipients: recipients.map((r) => ({ address: r.address, amount: r.amount })),
        totalAmount: totalXlm,
      });

      setBatchResult({
        txHash: result.txHash,
        totalDisbursed: totalXlm,
        recipientCount: recipients.length,
        timestamp: Date.now(),
      });
      setState('success');
    } catch (err) {
      console.error('Payroll execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setState('upload');
    setRecipients([]);
    setParseErrors([]);
    setBatchResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // ─── Upload State ──────────────────────────────────────────
  if (state === 'upload') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Drag & Drop Zone */}
        <div
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />

          <div className="dropzone-icon">
            <Upload size={36} color="var(--accent-gold)" />
          </div>

          <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '8px' }}>
            {isDragActive ? 'Drop CSV File Here' : 'Upload Payroll Manifest'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
            Drag and drop a <code style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>.csv</code> file with columns{' '}
            <code style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>address, amount, label</code> — or click to
            browse.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-gold"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <FileSpreadsheet size={16} /> Choose CSV File
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadSample();
              }}
            >
              <Download size={16} /> Sample CSV
            </button>
          </div>
        </div>

        {/* Parse Errors */}
        {parseErrors.length > 0 && (
          <div
            className="glass-card"
            style={{
              padding: '20px',
              borderColor: 'rgba(244, 63, 94, 0.3)',
              background: 'rgba(244, 63, 94, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertCircle size={18} color="var(--accent-rose)" />
              <span style={{ fontWeight: 600, color: 'var(--accent-rose)', fontSize: '0.95rem' }}>
                CSV Parse Errors
              </span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {parseErrors.map((err, i) => (
                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  • {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Format Guide */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1rem', color: '#FFF', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={16} color="var(--accent-cyan)" />
            CSV Format Specification
          </h4>

          <div className="payroll-table-wrapper">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code style={{ color: 'var(--accent-cyan)' }}>address</code></td>
                  <td>Stellar Public Key</td>
                  <td><span className="badge badge-emerald" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Yes</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>GABC...5678</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-cyan)' }}>amount</code></td>
                  <td>XLM (number)</td>
                  <td><span className="badge badge-emerald" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Yes</span></td>
                  <td>250</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-cyan)' }}>label</code></td>
                  <td>Description</td>
                  <td><span className="badge badge-gold" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Optional</span></td>
                  <td>Alice — Engineering</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ─── Preview State ─────────────────────────────────────────
  if (state === 'preview') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} color="var(--accent-cyan)" /> Recipients
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>{recipients.length}</div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Coins size={14} color="var(--accent-gold)" /> Total Disbursement
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {totalXlm.toLocaleString()} <span style={{ fontSize: '1rem' }}>XLM</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="var(--accent-emerald)" /> Est. Soroban Gas
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              &lt; $0.001
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Single atomic batch
            </div>
          </div>
        </div>

        {/* Recipient Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} color="var(--accent-cyan)" />
              Payroll Recipients
            </h3>
            <span className="badge badge-cyan">{recipients.length} entries</span>
          </div>

          <div className="payroll-table-wrapper">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Stellar Address</th>
                  <th>Label</th>
                  <th style={{ textAlign: 'right' }}>Amount (XLM)</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.85rem' }}>{i + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                      {formatAddress(r.address)}
                    </td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{r.label || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>
                      {r.amount.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-rose)',
                          cursor: 'pointer',
                          padding: '4px',
                          opacity: 0.7,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                        onClick={() => handleRemoveRecipient(i)}
                        title="Remove recipient"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ fontWeight: 700, color: '#FFF', fontSize: '0.95rem' }}>
                    Total
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                    {totalXlm.toLocaleString()} XLM
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Parse Errors (if any non-blocking) */}
        {parseErrors.length > 0 && (
          <div
            className="glass-card"
            style={{
              padding: '16px 20px',
              borderColor: 'rgba(244, 63, 94, 0.3)',
              background: 'rgba(244, 63, 94, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={16} color="var(--accent-rose)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-rose)' }}>
                {parseErrors.length} row(s) skipped
              </span>
            </div>
            {parseErrors.map((err, i) => (
              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                • {err}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} /> Reset
          </button>
          <button
            className={`btn btn-gold ${isExecuting ? 'btn-executing' : ''}`}
            onClick={handleExecute}
            disabled={isExecuting}
          >
            <Send size={18} />
            {isExecuting
              ? 'Executing Soroban Batch...'
              : `Disburse ${totalXlm.toLocaleString()} XLM to ${recipients.length} Recipients`}
          </button>
        </div>
      </div>
    );
  }

  // ─── Success State ─────────────────────────────────────────
  return (
    <div className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: '2px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <CheckCircle2 size={36} color="var(--accent-emerald)" />
      </div>

      <h3 style={{ fontSize: '1.6rem', color: '#FFF', marginBottom: '8px' }}>Batch Payroll Executed</h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
        All funds have been disbursed via a single atomic Soroban transaction.
      </p>

      {batchResult && (
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '24px 32px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            textAlign: 'left',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transaction Hash</span>
            <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
              {batchResult.txHash.slice(0, 10)}...{batchResult.txHash.slice(-6)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Disbursed</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
              {batchResult.totalDisbursed.toLocaleString()} XLM
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Recipients Paid</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {batchResult.recipientCount}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Settled At</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {new Date(batchResult.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div>
        <button className="btn btn-gold" onClick={handleReset}>
          <RotateCcw size={16} /> Create New Payroll
        </button>
      </div>
    </div>
  );
};
