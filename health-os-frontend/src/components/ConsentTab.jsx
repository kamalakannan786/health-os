import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserCheck, Key, Clock, XCircle, PlusCircle } from 'lucide-react';

export default function ConsentTab() {
  const {
    activeRole,
    consents,
    signConsent,
    revokeConsent,
    requestNewConsent,
    loading
  } = useApp();

  const [reqName, setReqName] = useState('');

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!reqName) return;
    await requestNewConsent(reqName);
    setReqName('');
  };

  if (activeRole === 'Provider') {
    return (
      <div className="tab-content">
        <div className="grid-layout">
          <div className="panel card">
            <h2 className="panel-title">
              <PlusCircle size={20} className="panel-title-icon" />
              <span>Submit Records Access Request</span>
            </h2>
            <form onSubmit={handleSubmitRequest} className="form-layout">
              <p className="helper-text">
                To retrieve patient history, you must request consent. The patient will review the request and sign it with their cryptographic key.
              </p>
              <div className="form-group">
                <label>Medical Entity Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. St. Jude Hospital" 
                  value={reqName} 
                  onChange={(e) => setReqName(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                Request Access Consent
              </button>
            </form>
          </div>

          <div className="panel card">
            <h2 className="panel-title">
              <Clock size={20} className="panel-title-icon" />
              <span>Access Request Pipeline</span>
            </h2>
            <div className="consent-list">
              {consents.length === 0 ? (
                <p className="no-data">No requests in pipeline.</p>
              ) : (
                consents.map((c) => (
                  <div className="consent-card" key={c.id}>
                    <div className="consent-info">
                      <h3>{c.requester_name}</h3>
                      <span className="consent-date">Updated: {new Date(c.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="consent-actions-status">
                      {c.status === 'pending' && (
                        <span className="status-badge status-pending">Pending Signature</span>
                      )}
                      {c.status === 'approved' && (
                        <div className="approved-badge-group">
                          <span className="status-badge status-approved">Access Granted</span>
                          <span className="signature-snippet" title={c.digital_signature}>
                            SIG: {c.digital_signature.slice(0, 10)}...
                          </span>
                        </div>
                      )}
                      {c.status === 'revoked' && (
                        <span className="status-badge status-revoked">Access Revoked</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="panel card full-width">
        <h2 className="panel-title">
          <UserCheck size={20} className="panel-title-icon" />
          <span>Patient Consent & Cryptographic Signature Registry</span>
        </h2>
        <p className="helper-text">
          Control access requests from healthcare entities. Approving a request signs the consent transaction with your public key using your private key, allowing the entity to decrypt and view your records.
        </p>

        <div className="consent-table-container">
          {consents.length === 0 ? (
            <p className="no-data">No access requests found.</p>
          ) : (
            <table className="consent-table">
              <thead>
                <tr>
                  <th>Requesting Entity</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Cryptographic Signature</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="entity-name">{c.requester_name}</span>
                    </td>
                    <td>{new Date(c.updated_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${c.status}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {c.digital_signature ? (
                        <code className="signature-code" title={c.digital_signature}>
                          {c.digital_signature.slice(0, 20)}...
                        </code>
                      ) : (
                        <span className="signature-none">None</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {c.status === 'pending' && (
                          <>
                            <button 
                              className="approve-action-btn"
                              onClick={() => signConsent(c.id, c.requester_name)}
                              disabled={loading}
                            >
                              <Key size={14} />
                              <span>Sign & Grant</span>
                            </button>
                            <button 
                              className="deny-action-btn"
                              onClick={() => revokeConsent(c.id)}
                              disabled={loading}
                            >
                              <XCircle size={14} />
                              <span>Deny</span>
                            </button>
                          </>
                        )}
                        {c.status === 'approved' && (
                          <button 
                            className="revoke-action-btn"
                            onClick={() => revokeConsent(c.id)}
                            disabled={loading}
                          >
                            <XCircle size={14} />
                            <span>Revoke Access</span>
                          </button>
                        )}
                        {c.status === 'revoked' && (
                          <button 
                            className="approve-action-btn"
                            onClick={() => signConsent(c.id, c.requester_name)}
                            disabled={loading}
                          >
                            <Key size={14} />
                            <span>Re-Authorize</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
