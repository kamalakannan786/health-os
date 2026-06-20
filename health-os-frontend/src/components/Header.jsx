import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity, RefreshCw, Stethoscope, User, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { activeRole, setActiveRole, patientName, publicKey, resetDB, loading } = useApp();

  return (
    <header className="header-container">
      <div className="header-brand">
        <Activity className="brand-icon" size={22} />
        <div className="brand-text">
          <h1>VORTEXA</h1>
          <span className="brand-subtitle">Health-OS · Secure Health Network</span>
        </div>
      </div>

      <div className="role-switcher">
        <button
          id="role-patient"
          className={`role-btn ${activeRole === 'Patient' ? 'active' : ''}`}
          onClick={() => setActiveRole('Patient')}
        >
          <User size={13} />
          <span>Patient</span>
        </button>
        <button
          id="role-provider"
          className={`role-btn ${activeRole === 'Provider' ? 'active' : ''}`}
          onClick={() => setActiveRole('Provider')}
        >
          <Stethoscope size={13} />
          <span>Provider</span>
        </button>
        <button
          id="role-auditor"
          className={`role-btn ${activeRole === 'Auditor' ? 'active' : ''}`}
          onClick={() => setActiveRole('Auditor')}
        >
          <ShieldCheck size={13} />
          <span>Auditor</span>
        </button>
      </div>

      <div className="header-actions">
        <div className="patient-chip">
          <div className="patient-avatar">{patientName.charAt(0)}</div>
          <div className="patient-info">
            <span className="patient-name">{patientName}</span>
            <span className="patient-key">{publicKey.slice(0, 18)}…</span>
          </div>
        </div>

        <button
          id="btn-reset-db"
          className="reset-btn"
          onClick={resetDB}
          disabled={loading}
          title="Reset & Re-seed Database"
        >
          <RefreshCw className={loading ? 'spinning' : ''} size={14} />
        </button>
      </div>
    </header>
  );
}
