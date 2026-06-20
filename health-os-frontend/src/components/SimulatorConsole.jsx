import React from 'react';
import { useApp } from '../context/AppContext';
import { Terminal, AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';

export default function SimulatorConsole() {
  const { logs, loading, createNewPrescription, resetDB } = useApp();

  const simulateAllergy = async () => {
    await createNewPrescription('Penicillin VK', '500mg 4x daily', 'Dr. Sim Allergy Agent');
  };

  const simulateFraud = async () => {
    await createNewPrescription('Oxycodone HCl', '10mg every 4h PRN', 'Unknown Provider #9912');
  };

  return (
    <div className="page-in">
      <div className="page-hd">
        <div>
          <h1 className="page-hd-title">Simulation Console</h1>
          <p className="page-hd-sub">Trigger real-time clinical and fraud events to demonstrate Health-OS AI guardrails.</p>
        </div>
      </div>

      <div className="grid">
        <div className="g4 card-p">
          <div className="section-label">Simulation Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="sim-btn amber" onClick={simulateAllergy} disabled={loading}>
              <AlertTriangle size={18} />
              <span className="sb-text">
                <span className="sb-main">Simulate Allergy Conflict</span>
                <span className="sb-sub">Add Penicillin to trigger allergy warning</span>
              </span>
            </button>

            <button className="sim-btn red" onClick={simulateFraud} disabled={loading}>
              <ShieldAlert size={18} />
              <span className="sb-text">
                <span className="sb-main">Simulate Fraud Pattern</span>
                <span className="sb-sub">Add opioid prescription from unknown entity</span>
              </span>
            </button>

            <button className="sim-btn gray" onClick={resetDB} disabled={loading}>
              <RefreshCw size={18} className={loading ? 'spinning' : ''} />
              <span className="sb-text">
                <span className="sb-main">Reset All Demo Data</span>
                <span className="sb-sub">Re-seed database with clean state</span>
              </span>
            </button>
          </div>
        </div>

        <div className="g8 card-p">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="section-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Terminal size={14} />
              Cryptographic Audit Log
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--secondary)' }}>
              <span style={{ width: 6, height: 6, background: 'var(--secondary)', borderRadius: '50%', animation: 'pulse 1.8s ease-in-out infinite' }}></span>
              Real-time
            </div>
          </div>
          <div className="terminal">
            {logs.length === 0 ? (
              <div className="t-line">
                <span className="t-role t-system">[SYSTEM]</span>
                <span className="t-msg">Awaiting events...</span>
              </div>
            ) : (
              logs.map((log, i) => (
                <div className="t-line" key={log.id || i}>
                  <span className="t-ts">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`t-role t-${(log.user_role || 'system').toLowerCase()}`}>[{log.user_role.toUpperCase()}]</span>
                  <span className="t-msg">{log.description}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
