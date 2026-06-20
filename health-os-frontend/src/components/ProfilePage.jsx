import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Key, Check, Plus, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ProfilePage() {
  const {
    patientName,
    publicKey,
    allergies,
    updatePatientProfile,
    loading
  } = useApp();

  const [nameInput, setNameInput] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [allergiesList, setAllergiesList] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setNameInput(patientName || '');
  }, [patientName]);

  useEffect(() => {
    setAllergiesList(allergies || []);
  }, [allergies]);

  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;
    const cleanAllergy = newAllergy.trim().toLowerCase();
    if (!allergiesList.includes(cleanAllergy)) {
      setAllergiesList([...allergiesList, cleanAllergy]);
    }
    setNewAllergy('');
  };

  const handleRemoveAllergy = (allergyToRemove) => {
    setAllergiesList(allergiesList.filter(a => a !== allergyToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    await updatePatientProfile(nameInput.trim(), allergiesList);
    setSuccess('Sovereign profile updated successfully in Postgres ledger.');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="page-in">
      <div className="page-hd">
        <div>
          <h1 className="page-hd-title">Sovereign Identity & Enclave</h1>
          <p className="page-hd-sub">
            Manage your decentralized identifier (DID), hardware signing keys, and encrypted ledger replication nodes.
          </p>
        </div>
      </div>

      <div className="grid">
        <div className="g6 card-p">
          <div className="section-label">Profile Configuration</div>
          {success && (
            <div className="inline-success" style={{ marginBottom: 16 }}>
              <Check size={14} /> <span>{success}</span>
            </div>
          )}
          <form onSubmit={handleSave} className="form-stack">
            <div className="form-field">
              <label className="form-label">Sovereign Name</label>
              <input
                className="form-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Clinical Allergies</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. penicillin"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="btn btn-outline"
                  style={{ padding: '8px 12px' }}
                  disabled={loading}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {allergiesList.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--outline)', fontStyle: 'italic' }}>No active allergy conflicts registered.</span>
                ) : (
                  allergiesList.map(allergy => (
                    <div
                      key={allergy}
                      className="allergy-chip danger"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span className="a-name danger">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        disabled={loading}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-teal"
              style={{ width: '100%', padding: '12px', marginTop: 10 }}
              disabled={loading}
            >
              Save Sovereign Credentials
            </button>
          </form>
        </div>

        <div className="g6" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card-dark" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <Key size={28} style={{ opacity: 0.8 }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, opacity: 0.4 }}>H-OS ID: 881-22-LX</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{patientName}</div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>Sovereign Identity Key Active</div>

            <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Vault Encryption</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#86f2e4', color: '#006f66', padding: '2px 8px', borderRadius: 4 }}>AES-256</span>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: -24, right: -24, width: 120, height: 120, background: 'rgba(134,242,228,0.12)', borderRadius: '50%', filter: 'blur(32px)' }}></div>
          </div>

          <div className="card-p">
            <div className="section-label">Enclave Cryptography Settings</div>
            <div className="form-stack" style={{ gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Public Hardware Key</div>
                <pre style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  background: 'var(--surface-low)',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--outline-variant)',
                  marginTop: 4,
                  overflowX: 'auto'
                }}>{publicKey}</pre>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Signing Scheme</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>RSA-4096-PSS</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Ledger Replication Shard</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>SHARD-AP-SOUTH-1</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => alert('Simulating local RSA keypair regeneration logs...')}
                >
                  <RefreshCw size={14} style={{ marginRight: 6 }} /> Rotate Keys
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => alert('Replication node rotated to backup shard.')}
                >
                  Rotate Node
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
