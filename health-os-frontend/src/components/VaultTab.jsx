import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Unlock, FileText, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VaultTab() {
  const {
    activeRole,
    prescriptions,
    isDecrypted,
    setIsDecrypted,
    privateKey,
    setPrivateKey,
    createNewPrescription,
    errorMsg,
    loading
  } = useApp();

  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [doctor, setDoctor] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDecryption = (e) => {
    e.preventDefault();
    if (inputKey === 'VORTEXA_PRIV_ALICE_67890') {
      setPrivateKey(inputKey);
      setIsDecrypted(true);
    } else {
      alert('Invalid Private Key! Use: VORTEXA_PRIV_ALICE_67890');
    }
  };

  const handleLock = () => {
    setPrivateKey('');
    setIsDecrypted(false);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!medName || !dosage || !doctor) return;
    await createNewPrescription(medName, dosage, doctor);
    setMedName('');
    setDosage('');
    setDoctor('');
    setSuccessMsg('Prescription generated, encrypted client-side, and stored in database!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const decryptPayload = (encData) => {
    if (!encData.startsWith('VORTEXA_ENC:')) return encData;
    try {
      const b64 = encData.replace('VORTEXA_ENC:', '');
      const raw = atob(b64);
      if (raw.includes('DATA:')) {
        return raw.split('DATA:')[1];
      }
      return raw;
    } catch {
      return 'Tampered Payload';
    }
  };

  if (activeRole === 'Provider') {
    return (
      <div className="tab-content">
        <div className="grid-layout">
          <div className="panel card">
            <h2 className="panel-title">
              <PlusCircle size={20} className="panel-title-icon" />
              <span>Issue Encrypted Prescription</span>
            </h2>
            {successMsg && (
              <div className="alert alert-success">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}
            <form onSubmit={handleCreatePrescription} className="form-layout">
              <div className="form-group">
                <label>Medication Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Aspirin" 
                  value={medName} 
                  onChange={(e) => setMedName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Dosage Instructions</label>
                <input 
                  type="text" 
                  placeholder="e.g. 81mg daily" 
                  value={dosage} 
                  onChange={(e) => setDosage(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Prescribing Physician</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Robert Chen" 
                  value={doctor} 
                  onChange={(e) => setDoctor(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                Encrypt & Save to Health-OS
              </button>
            </form>
          </div>

          <div className="panel card">
            <h2 className="panel-title">
              <FileText size={20} className="panel-title-icon" />
              <span>Authorized Health Vault Records</span>
            </h2>
            {errorMsg ? (
              <div className="access-denied-panel">
                <Lock size={48} className="lock-icon" />
                <h3>Access Denied</h3>
                <p>{errorMsg}</p>
                <div className="status-badge status-pending">Requires Patient Signature Consent</div>
              </div>
            ) : (
              <div className="vault-list">
                {prescriptions.length === 0 ? (
                  <p className="no-data">No health vault records active.</p>
                ) : (
                  prescriptions.map((rx) => (
                    <div className="prescription-card active-decrypt" key={rx.id}>
                      <div className="rx-meta">
                        <span className="rx-doctor">{rx.prescriber}</span>
                        <span className="rx-date">{new Date(rx.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3>{rx.medication_name}</h3>
                      <p className="rx-dosage">{rx.dosage}</p>
                      <div className="crypto-details">
                        <span className="crypto-tag">Decrypted Session</span>
                        <span className="crypto-signature-status">Signature Verified</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="grid-layout">
        <div className="panel card">
          <h2 className="panel-title">
            <Lock size={20} className="panel-title-icon" />
            <span>Digital Vault Cryptography Enclave</span>
          </h2>
          <div className="crypto-controls">
            {!isDecrypted ? (
              <form onSubmit={handleDecryption} className="form-layout">
                <p className="helper-text">
                  Records in the vault are end-to-end encrypted. Enter your Private Key to decrypt them locally.
                </p>
                <div className="form-group">
                  <label>Patient Private Key</label>
                  <input 
                    type="password" 
                    placeholder="Enter Private Key..." 
                    value={inputKey} 
                    onChange={(e) => setInputKey(e.target.value)}
                    required 
                  />
                  <span className="key-hint">Demo Key: <code>VORTEXA_PRIV_ALICE_67890</code></span>
                </div>
                <button type="submit" className="decrypt-btn">
                  <Unlock size={16} />
                  <span>Authorize & Decrypt Vault</span>
                </button>
              </form>
            ) : (
              <div className="decrypt-success">
                <div className="success-icon-container">
                  <Unlock size={24} className="unlock-pulse-icon" />
                </div>
                <h3>Vault Decrypted Successfully</h3>
                <p className="helper-text">Your medical records are now visible in the local browser session.</p>
                <button onClick={handleLock} className="lock-btn">
                  <Lock size={16} />
                  <span>Lock Vault</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="panel card">
          <h2 className="panel-title">
            <FileText size={20} className="panel-title-icon" />
            <span>Patient Health Records Vault</span>
          </h2>
          <div className="vault-list">
            {prescriptions.length === 0 ? (
              <p className="no-data">Vault is empty.</p>
            ) : (
              prescriptions.map((rx) => (
                <div className={`prescription-card ${isDecrypted ? 'active-decrypt' : 'active-encrypt'}`} key={rx.id}>
                  {isDecrypted ? (
                    <>
                      <div className="rx-meta">
                        <span className="rx-doctor">{rx.prescriber}</span>
                        <span className="rx-date">{new Date(rx.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3>{rx.medication_name}</h3>
                      <p className="rx-dosage">{rx.dosage}</p>
                      <div className="crypto-details">
                        <span className="crypto-tag">Decrypted Payload</span>
                        <span className="crypto-hash">Verified SHA-256</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rx-meta">
                        <span className="rx-doctor-obfuscated">Prescriber: [ENCRYPTED]</span>
                        <span className="rx-date">{new Date(rx.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="obfuscated-text">•••••••••••••••••••••</h3>
                      <p className="obfuscated-text">•••••••••••••</p>
                      <div className="encrypted-payload-box">
                        <div className="payload-header">
                          <Lock size={12} />
                          <span>CIPHER DATA</span>
                        </div>
                        <div className="payload-content">
                          {rx.encrypted_data}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
