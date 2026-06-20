import React from 'react';
import { useApp } from '../context/AppContext';
import { Fingerprint, CheckCircle2, Key, Eye, RefreshCw, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

export default function VaultDashboard() {
  const { activeRole, patientName, publicKey, prescriptions, consents, logs, isDecrypted, refreshData, allergies, labReports, setActivePage } = useApp();

  const approvedConsents = consents.filter(c => c.status === 'approved').length;
  const integrity = prescriptions.length > 0 ? '99.9%' : '—';
  const recentLogs = logs.slice(0, 3);

  React.useEffect(() => {
    refreshData();
  }, [activeRole, refreshData]);

  return (
    <div className="page-in">
      <div className="page-hd">
        <div>
          <h1 className="page-hd-title">Patient Health Vault</h1>
          <p className="page-hd-sub">
            {activeRole === 'Auditor'
              ? `Compliance audit session active. Verifying ledger integrity and cryptographic signature validation logs.`
              : `Welcome back, {patientName}. Your sovereign health data is end-to-end encrypted and active across ${approvedConsents} verified institutions.`}
          </p>
        </div>
        <div className="page-hd-right">
          <div className="pill pill-teal">
            <ShieldCheck size={14} />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="pill pill-dark">
            <CheckCircle2 size={14} />
            <span>Signature-Verified</span>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="g8 card scan">
          <div className="vault-stats">
            <div>
              <div className="vs-val">{prescriptions.length || 0}</div>
              <div className="vs-label">Secure Records</div>
              <div className="vs-bar">
                <div className="vs-bar-fill" style={{ width: `${Math.min(prescriptions.length * 20, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="vs-val teal">{String(approvedConsents).padStart(2, '0')}</div>
              <div className="vs-label">Active Consents</div>
              <div className="vs-bar">
                <div className="vs-bar-fill teal" style={{ width: `${Math.min(approvedConsents * 15, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="vs-val">{integrity}</div>
              <div className="vs-label">Data Integrity</div>
              <div className="vs-bar">
                <div className="vs-bar-fill" style={{ width: '99%' }}></div>
              </div>
            </div>
          </div>

          <div className="hash-strip">
            <div className="hash-strip-left">
              <Fingerprint size={18} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Hardware signature:</span>
              <span className="hash-val">0x{publicKey.slice(-6).toLowerCase()}...8f2</span>
            </div>
            <button className="hash-strip-btn">Re-Verify All</button>
          </div>
        </div>

        <div className="g4 card-dark">
          {activeRole === 'Auditor' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <ShieldCheck size={28} style={{ opacity: 0.8 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, opacity: 0.4 }}>AUDITOR KEY: ACTIVE</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Health-OS Audit Agent</div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>Sovereign Audit Access Level</div>

              <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Audit Channel</span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#86f2e4', color: '#006f66', padding: '2px 8px', borderRadius: 4 }}>VERIFIED</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <Key size={28} style={{ opacity: 0.8 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, opacity: 0.4 }}>H-OS ID: 881-22-LX</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{patientName}</div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>Sovereign Identity Key Active</div>

              <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Vault Encryption</span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#86f2e4', color: '#006f66', padding: '2px 8px', borderRadius: 4 }}>AES-256</span>
                </div>
              </div>
            </>
          )}

          <div style={{ position: 'absolute', bottom: -24, right: -24, width: 120, height: 120, background: 'rgba(134,242,228,0.12)', borderRadius: '50%', filter: 'blur(32px)' }}></div>
        </div>

        <div className="g4 card">
          <div className="card-hd">
            <span className="card-hd-title"><PillIcon size={16} />Medications</span>
            <AlertTriangle size={16} style={{ color: 'var(--outline)' }} />
          </div>
          <div>
            {prescriptions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-title">No prescriptions on file.</span>
              </div>
            ) : (
              prescriptions.slice(0, 3).map(rx => {
                const isLocked = !isDecrypted && activeRole === 'Patient';
                return (
                  <div className="rx-row" key={rx.id}>
                    <div className="rx-row-top">
                      <span className="rx-name">
                        {isLocked
                          ? `VORTEXA_ENC:${btoa(rx.medication_name).slice(0, 8)}...`
                          : `${rx.medication_name} — ${rx.dosage}`}
                      </span>
                      <div className="rx-check">
                        {isLocked ? <Lock size={12} style={{ color: 'var(--outline)' }} /> : <CheckCircle2 size={14} />}
                      </div>
                    </div>
                    <div className="rx-who">
                      {isLocked ? 'Hardware Sealed' : rx.prescriber}
                    </div>
                    <code className="rx-hash-val">Hash: {btoa(rx.medication_name).slice(0, 8)}...</code>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="g4 card">
          <div className="card-hd">
            <span className="card-hd-title"><ShieldCheck size={16} />Lab Reports</span>
          </div>
          {labReports.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-title">No lab reports on file.</span>
            </div>
          ) : (
            labReports.map((lab, i) => (
              <div key={lab.id || i} style={{ padding: '14px 16px', borderBottom: i < labReports.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{lab.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--secondary)' }}>{lab.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 700 }}>{lab.value}</span>
                  <span style={{ fontSize: 13, color: 'var(--outline)' }}>{lab.unit}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--outline-variant)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lab.date}</div>
              </div>
            ))
          )}
        </div>

        <div className="g4 card">
          <div className="card-hd">
            <span className="card-hd-title"><Eye size={16} />Vault Activity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--secondary)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>
              <span style={{ width: 6, height: 6, background: 'var(--secondary)', borderRadius: '50%', animation: 'bootRing 2s ease-in-out infinite' }}></span>
              <span>Real-time</span>
            </div>
          </div>
          <div className="timeline">
            {recentLogs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-title">No recent activity.</span>
              </div>
            ) : (
              recentLogs.map((log, i) => (
                <div className="tl-item" key={log.id || i}>
                  <div className={`tl-dot ${log.user_role === 'SYSTEM' ? 'green' : 'gray'}`}>
                    {log.user_role === 'SYSTEM' ? <RefreshCw size={12} /> : <Key size={12} />}
                  </div>
                  <div>
                    <div className="tl-title">{log.description?.slice(0, 45)}{log.description?.length > 45 ? '…' : ''}</div>
                    <div className="tl-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="g12 card">
          <div className="allergy-bar">
            <div className="allergy-icon-wrap">
              <AlertTriangle size={18} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginRight: 12 }}>Clinical Alerts</h4>
            {allergies.length === 0 ? (
              <span style={{ fontSize: 13, color: 'var(--outline)', fontStyle: 'italic' }}>No active allergy conflicts registered.</span>
            ) : (
              allergies.map(allergy => {
                const nameLower = allergy.toLowerCase();
                const isPenicillin = nameLower.includes('penicillin');
                const severity = isPenicillin ? 'Severe' : 'Moderate';
                const danger = isPenicillin || nameLower.includes('sulfa');
                return (
                  <div key={allergy} className={`allergy-chip ${danger ? 'danger' : 'normal'}`}>
                    <span className={`a-name ${danger ? 'danger' : 'normal'}`}>{allergy}</span>
                    <span className="a-sev">{severity}</span>
                  </div>
                );
              })
            )}
            <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setActivePage('profile')}>
              Add Allergy +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Pill icon inside VaultDashboard
function PillIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle' }}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}
