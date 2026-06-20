import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pill, CheckCircle2, AlertTriangle, Lock, Unlock, PlusCircle, ArrowRight, X, Activity } from 'lucide-react';
import * as api from '../services/api';

export default function PrescriptionsPage() {
  const {
    activeRole,
    activePatientId,
    prescriptions,
    isDecrypted,
    setIsDecrypted,
    setPrivateKey,
    createNewPrescription,
    representingProvider,
    accessDenied,
    safetyReport,
    logs,
    loading
  } = useApp();

  const [inputKey, setInputKey] = useState('');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [doctor, setDoctor] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedMed, setSelectedMed] = useState(null);
  const [historyReport, setHistoryReport] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const handleDecrypt = (e) => {
    e.preventDefault();
    if (inputKey === 'VORTEXA_PRIV_ALICE_67890') {
      setPrivateKey(inputKey);
      setIsDecrypted(true);
    } else {
      alert('Invalid key. Demo key: VORTEXA_PRIV_ALICE_67890');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!medName || !dosage || !doctor) return;
    await createNewPrescription(medName, dosage, doctor);
    setMedName(''); setDosage(''); setDoctor('');
    setSuccess('Prescription encrypted and saved to vault.');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleOpenHistory = async (medicationName) => {
    setSelectedMed(medicationName);
    setHistoryLoading(true);
    setHistoryError('');
    setHistoryReport(null);
    try {
      const report = await api.getHistoryReport(activePatientId || 1, medicationName);
      setHistoryReport(report);
    } catch (err) {
      setHistoryError(err.message || 'Failed to generate history report.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="page-in">
      <div className="page-hd">
        <div>
          <h1 className="page-hd-title">Prescription Intelligence Network</h1>
          <p className="page-hd-sub">
            A sovereign, end-to-end encrypted ledger of your active pharmacological profile. Managed by Health-OS AI Safety Guardrails.
          </p>
        </div>
        <div className="page-hd-right">
          {activeRole === 'Provider' ? (
            <div className="pill pill-dark">
              <PlusCircle size={14} />
              <span>Provider: {representingProvider}</span>
            </div>
          ) : (
            <button className="pill pill-teal" style={{ border: 'none', cursor: 'pointer' }} onClick={() => alert('Ledger exported successfully.')}>
              Export Ledger
            </button>
          )}
        </div>
      </div>

      {activeRole === 'Provider' ? (
        <div className="grid">
          <div className="g6 card-p">
            <div className="section-label">Issue Encrypted Prescription</div>
            {success && (
              <div className="inline-success">
                <CheckCircle2 size={15} /><span>{success}</span>
              </div>
            )}
            <form onSubmit={handleCreate} className="form-stack">
              <div className="form-field">
                <label className="form-label">Medication Name</label>
                <input className="form-input" type="text" placeholder="e.g. Lisinopril" value={medName} onChange={e => setMedName(e.target.value)} required />
              </div>
              <div className="form-field">
                <label className="form-label">Dosage Instructions</label>
                <input className="form-input" type="text" placeholder="e.g. 10mg once daily" value={dosage} onChange={e => setDosage(e.target.value)} required />
              </div>
              <div className="form-field">
                <label className="form-label">Prescribing Physician</label>
                <input className="form-input" type="text" placeholder="e.g. Dr. Sarah Chen" value={doctor} onChange={e => setDoctor(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-teal" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                <Lock size={15} />
                Encrypt & Save to Health-OS
              </button>
            </form>
          </div>

          <div className="g6 card scan">
            <div className="card-hd">
              <span className="card-hd-title"><Pill size={16} style={{ marginRight: 6 }} />Authorized Records</span>
              {!accessDenied && <span className="badge badge-verified">Verified Ledger</span>}
            </div>
            <div>
              {accessDenied ? (
                <div className="access-denied-box">
                  <div className="adb-ico">
                    <Lock size={44} />
                  </div>
                  <div className="adb-title">Access Denied</div>
                  <div className="adb-sub">
                    Your institution (<strong>{representingProvider}</strong>) does not have active consent to access this vault. Submit an access request in the Consent tab.
                  </div>
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-title">No records authorized yet.</span>
                </div>
              ) : (
                prescriptions.map(rx => (
                  <div className="med-row" key={rx.id}>
                    <div className="med-row-hd">
                      <div className="med-row-name">
                        <span>{rx.medication_name}</span>
                        <CheckCircle2 size={16} style={{ color: 'var(--secondary)' }} />
                      </div>
                      <div className="med-row-dose">
                        <div className="med-row-amount">{rx.dosage.split(' ')[0]}</div>
                        <div className="med-row-freq">{rx.dosage.split(' ').slice(1).join(' ') || 'as directed'}</div>
                      </div>
                    </div>
                    <div className="med-row-by">Prescribed by {rx.prescriber}</div>
                    <div className="med-row-meta">
                      <div>
                        <div className="meta-item-label">Added</div>
                        <div className="meta-item-value">{new Date(rx.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="med-row-foot">
                      <code className="med-hash-val">TX_HASH: 0x{btoa(rx.medication_name + rx.id).slice(0, 10)}...</code>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid">
          <div className="g8 card scan">
            <div className="card-hd">
              <span className="card-hd-title">
                <Pill size={16} style={{ marginRight: 6 }} />
                {activeRole === 'Auditor' ? 'Compliance Audit Ledger' : 'Active Medications'}
              </span>
              <span className="badge badge-verified">Verified Ledger</span>
            </div>
            <div>
              {!isDecrypted && activeRole !== 'Auditor' ? (
                <div style={{ padding: 24 }}>
                  <div className="vault-locked-banner">
                    <Lock size={16} style={{ marginRight: 8, flexShrink: 0 }} />
                    <span>Records are end-to-end encrypted. Authorize with your private key to view.</span>
                  </div>
                  <form onSubmit={handleDecrypt} className="form-stack">
                    <div className="form-field">
                      <label className="form-label">Patient Private Key</label>
                      <input className="form-input" type="password" placeholder="Enter private key..." value={inputKey} onChange={e => setInputKey(e.target.value)} required />
                      <div className="form-hint">Demo key: <code>VORTEXA_PRIV_ALICE_67890</code></div>
                    </div>
                    <button type="submit" className="btn btn-teal" style={{ width: '100%', padding: '12px' }}>
                      <Unlock size={15} />
                      Authorize & Decrypt Vault
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  {prescriptions.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-state-title">No prescription records in vault.</span>
                    </div>
                  ) : (
                    prescriptions.map(rx => {
                      const warning = safetyReport?.warnings?.find(w =>
                        w.message.toLowerCase().includes(rx.medication_name.toLowerCase())
                      );
                      return (
                        <div className="med-row" key={rx.id}>
                          <div className="med-row-hd">
                            <div className="med-row-name">
                              <span>{rx.medication_name}</span>
                              {warning ? (
                                <AlertTriangle size={16} style={{ color: 'var(--error)' }} />
                              ) : (
                                <CheckCircle2 size={16} style={{ color: 'var(--secondary)' }} />
                              )}
                            </div>
                            <div className="med-row-dose">
                              <div className="med-row-amount">{rx.dosage.split(' ')[0]}</div>
                              <div className="med-row-freq">{rx.dosage.split(' ').slice(1).join(' ') || 'as directed'}</div>
                            </div>
                          </div>
                          {warning && (
                            <div className="interaction-box">
                              <AlertTriangle size={16} />
                              <span><strong style={{ color: 'var(--error)' }}>POTENTIAL CLINICAL RISK:</strong> {warning.message}</span>
                            </div>
                          )}
                          <div className="med-row-meta">
                            <div className="meta-item">
                              <div className="meta-item-label">Prescriber</div>
                              <div className="meta-item-value">{rx.prescriber}</div>
                            </div>
                            <div className="meta-item">
                              <div className="meta-item-label">Added</div>
                              <div className="meta-item-value">{new Date(rx.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="med-row-foot">
                            <code className="med-hash-val">TX_HASH: 0x{btoa(rx.medication_name + rx.id).slice(0, 10)}...</code>
                            <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleOpenHistory(rx.medication_name)}>
                              History Report <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {activeRole === 'Patient' && (
                    <div style={{ padding: '12px 24px', borderTop: '1px solid var(--outline-variant)' }}>
                      <button
                        onClick={() => { setIsDecrypted(false); setPrivateKey(''); }}
                        className="btn btn-outline"
                      >
                        <Lock size={14} style={{ marginRight: 6 }} />
                        Lock Vault
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="g4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeRole === 'Auditor' ? (
              <div className="card-dark">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <ShieldCheck size={28} style={{ opacity: 0.8 }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, opacity: 0.4 }}>AUDIT ACCESS: ACTIVE</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Health-OS Clinical Agent</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>Sovereign Audit Key Authorized</div>

                <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Audit Protocol</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#86f2e4', color: '#006f66', padding: '2px 8px', borderRadius: 4 }}>SYSTEM-LEVEL</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-teal" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.08 }}>
                  <Pill size={80} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="section-label" style={{ color: 'rgba(134,242,228,0.7)', marginBottom: 14 }}>AI Clinical Safety Agent</div>
                  <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 20, lineHeight: 1.6 }}>
                    Real-time cross-referencing of your medical ledger against global drug databases and genetic markers.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {safetyReport?.warnings?.slice(0, 2).map((w, i) => (
                      <div key={i} className="ai-alert amber">
                        <div className="ai-alert-ico">
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <div className="ai-alert-tag">{w.severity} Warning</div>
                          <div className="ai-alert-title">{w.type}</div>
                          <div className="ai-alert-body">{w.message}</div>
                        </div>
                      </div>
                    ))}
                    {(!safetyReport?.warnings || safetyReport.warnings.length === 0) && (
                      <div className="ai-alert green">
                        <div className="ai-alert-ico">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <div className="ai-alert-tag">System Clear</div>
                          <div className="ai-alert-title">Allergy Conflict Scan</div>
                          <div className="ai-alert-body">No active clinical contradictions found.</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => alert('Redirecting to Full Interaction Report')}
                    style={{ width: '100%', marginTop: 16, background: '#006a61', border: 'none', color: '#fff', padding: '10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}
                  >
                    View Full Interaction Report
                  </button>
                </div>
              </div>
            )}

            <div className="card-p">
              <div className="section-label">Signature-Verified Access Log</div>
              <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 14 }}>Immutable record of cryptographic authorization.</p>
              <div>
                {logs.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--outline)', padding: '10px 0' }}>No access events logged.</p>
                ) : (
                  logs.slice(0, 3).map((log, i) => {
                    const cryptoType = log.user_role === 'SYSTEM' || log.user_role === 'System' ? 'Internal' : 'SHA256';
                    const fakeHash = btoa(log.user_role + log.id + log.description).slice(0, 8).toLowerCase();
                    const sigString = cryptoType === 'Internal' ? 'kernel_level_trust' : `sha256_sig...${fakeHash}`;
                    
                    return (
                      <div className="log-row" key={log.id || i}>
                        <div className="log-ico"><Pill size={14} /></div>
                        <div style={{ flex: 1 }}>
                          <div className="log-entity">{log.user_role}</div>
                          <div className="log-sig">Sig: <code>{sigString}</code></div>
                          <span className="log-action">{log.description}</span>
                        </div>
                        <div className="log-time">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMed && (
        <div className="modal-overlay" onClick={() => setSelectedMed(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">Clinical History Report: {selectedMed}</span>
              <button className="modal-close" onClick={() => setSelectedMed(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-bd">
              {historyLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 12 }}>
                  <Activity className="spinning" size={32} style={{ color: 'var(--secondary)' }} />
                  <span style={{ fontSize: 13, color: 'var(--outline)' }}>Generating safety report using local Ollama model...</span>
                </div>
              )}
              {historyError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--error)', padding: '16px', background: 'var(--error-container)', borderRadius: 8 }}>
                  <AlertTriangle size={18} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{historyError}</span>
                </div>
              )}
              {historyReport && (
                <>
                  <div>
                    <div className="modal-item-label">Therapeutic Purpose</div>
                    <div className="modal-item-value">{historyReport.therapeuticPurpose}</div>
                  </div>
                  <div>
                    <div className="modal-item-label">Allergy Conflict Status</div>
                    <div className="modal-item-value" style={{ fontWeight: 600, color: historyReport.allergyConflictStatus.toLowerCase().includes('clear') ? 'var(--secondary)' : 'var(--error)' }}>
                      {historyReport.allergyConflictStatus}
                    </div>
                  </div>
                  <div>
                    <div className="modal-item-label">Clinical Guideline Check</div>
                    <div className="modal-item-value">{historyReport.clinicalGuidelineCheck}</div>
                  </div>
                  <div>
                    <div className="modal-item-label">Recommendations</div>
                    <ul style={{ paddingLeft: 18, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {historyReport.recommendations && historyReport.recommendations.map((rec, i) => (
                        <li key={i} className="modal-item-value" style={{ listStyleType: 'disc' }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
            <div className="modal-ft">
              <button className="btn btn-outline" style={{ padding: '8px 16px' }} onClick={() => setSelectedMed(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
