import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Building2, Stethoscope, Key, XCircle, Settings, X, CheckCircle2, PlusCircle } from 'lucide-react';

function useCryptoStream() {
  const [stream, setStream] = useState('0x7a...4f2b [AUTH_CHANNEL_OPEN]\nSEC_LEVEL: QUANTUM_RESISTANT\nSIGNATURE: RSA_4096_VALIDATED...');
  useEffect(() => {
    const hex = '0123456789ABCDEF';
    const id = setInterval(() => {
      const lines = Array.from({ length: 3 }, () => {
        let h = '0x';
        for (let i = 0; i < 4; i++) h += hex[Math.floor(Math.random() * 16)];
        h += '...' + hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)];
        return `${h} [PACKET_SIGNED_VERIFIED]`;
      });
      lines.push('SEC_LEVEL: QUANTUM_RESISTANT', 'AUTH: VALIDATED_NODES_3/3');
      setStream(lines.join('\n'));
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return stream;
}

export default function ConsentPage() {
  const { activeRole, consents, signConsent, revokeConsent, requestNewConsent, loading } = useApp();
  const stream = useCryptoStream();
  const [reqName, setReqName] = useState('');

  const pending = consents.filter(c => c.status === 'pending');
  const approved = consents.filter(c => c.status === 'approved');

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!reqName) return;
    await requestNewConsent(reqName);
    setReqName('');
  };

  return (
    <div className="page-in">
      <div className="page-hd">
        <div>
          <h1 className="page-hd-title">Consent Manager</h1>
          <p className="page-hd-sub">
            Manage and authorize how your medical data is accessed. All authorizations are cryptographically secured and immutable.
          </p>
        </div>
        <div className="page-hd-right">
          <div className="pill pill-teal">
            <ShieldCheck size={14} />
            <span>Sovereign Identity Active</span>
          </div>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: 24 }}>
        <div className="g8 card-p" style={{ background: 'rgba(255,255,255,0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>Your Data, Your Control</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: 16 }}>
            Health-OS uses decentralized identifiers (DIDs) to ensure you remain the sole owner of your medical records. When you authorize an entity, you provide a time-bound, limited cryptographic key — not your actual private data.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Revocable at any time', body: 'Instantly kill access from your dashboard.' },
              { title: 'Zero-Knowledge Proofs', body: 'Prove eligibility without sharing raw files.' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--secondary)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="g4 card-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="section-label" style={{ color: 'rgba(134,242,228,0.7)', letterSpacing: '0.1em', marginBottom: 12 }}>Live Encryption Status</div>
            <pre className="crypto-stream" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{stream}</pre>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="sig-divider"></div>
            <div className="sig-row">
              <div>
                <div className="sig-label">Signature Hash</div>
                <div className="sig-val">8f2-99-a1-bb-0e-55</div>
              </div>
              <ShieldCheck size={20} style={{ color: '#89f5e7', animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </div>

      {activeRole === 'Provider' && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label">Request Access</div>
          <div className="card-p" style={{ maxWidth: 480 }}>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 14 }}>
              Submit a consent request to access patient records. The patient will authorize with their cryptographic key.
            </p>
            <form onSubmit={handleRequest} className="form-stack">
              <div className="form-field">
                <label className="form-label">Medical Entity Name</label>
                <input className="form-input" type="text" placeholder="e.g. St. Jude Hospital" value={reqName} onChange={e => setReqName(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-teal" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                <PlusCircle size={15} style={{ marginRight: 6 }} />
                Submit Access Request
              </button>
            </form>
          </div>
        </div>
      )}

      {activeRole === 'Patient' && pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div className="section-label">Pending Authorization Requests ({pending.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {pending.map(c => (
              <div className="consent-req-card" key={c.id}>
                <div className="crc-top">
                  <div className="crc-entity">
                    <div className="crc-ico">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="crc-name">{c.requester_name}</div>
                      <div className="crc-type">Healthcare Access Request</div>
                    </div>
                  </div>
                  <span className="urgency routine">Routine</span>
                </div>
                <div>
                  <div className="scope-row">
                    <span className="scope-k">Scope</span>
                    <span className="scope-v">Prescriptions & Records</span>
                  </div>
                  <div className="scope-row">
                    <span className="scope-k">Duration</span>
                    <span className="scope-v">Until Revoked</span>
                  </div>
                </div>
                <div className="consent-btns">
                  {activeRole === 'Auditor' ? (
                    <span className="badge badge-pending" style={{ gridColumn: 'span 2', textAlign: 'center', display: 'block', padding: '8px 12px' }}>Awaiting Signature</span>
                  ) : (
                    <>
                      <button className="btn-auth" onClick={() => signConsent(c.id, c.requester_name)} disabled={loading}>
                        <ShieldCheck size={14} />
                        Authorize
                      </button>
                      <button className="btn-deny" onClick={() => revokeConsent(c.id)} disabled={loading}>
                        <X size={14} />
                        Deny
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>Active Consents</div>
          {activeRole !== 'Auditor' && approved.length > 0 && (
            <button
              onClick={() => approved.forEach(c => revokeConsent(c.id))}
              style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
            >
              Revoke All <XCircle size={14} />
            </button>
          )}
        </div>
        <div className="card">
          {consents.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-title">No access consents on file.</span>
            </div>
          ) : (
            consents.map(c => (
              <div className="active-consent-row" key={c.id}>
                <div className="acr-who">
                  <div className="acr-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="acr-name">{c.requester_name}</div>
                    <div className="acr-role">Healthcare Entity</div>
                  </div>
                </div>
                <div className="acr-meta">
                  <div>
                    <div className="acr-field-label">Scope</div>
                    <div className="acr-field-val">Records & Prescriptions</div>
                  </div>
                  <div>
                    <div className="acr-field-label">Updated</div>
                    <div className="acr-field-val">{new Date(c.updated_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="acr-field-label">Security Log</div>
                    {c.digital_signature ? (
                      <div className="acr-hash-val">Hash Verified: {c.digital_signature.slice(0, 8)}…</div>
                    ) : (
                      <span className={`badge badge-${c.status}`}>{c.status}</span>
                    )}
                  </div>
                </div>
                <div className="acr-actions">
                  <button className="btn-icon"><Settings size={16} /></button>
                  {activeRole === 'Auditor' ? (
                    <span className={`badge badge-${c.status}`} style={{ padding: '6px 12px' }}>{c.status}</span>
                  ) : (
                    <>
                      {c.status === 'approved' && (
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => revokeConsent(c.id)} disabled={loading}>Revoke</button>
                      )}
                      {(c.status === 'pending' || c.status === 'revoked') && (
                        <button className="btn btn-teal" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => signConsent(c.id, c.requester_name)} disabled={loading}>
                          {c.status === 'revoked' ? 'Re-Auth' : 'Sign & Grant'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
