import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, ShieldCheck, RefreshCw, Menu } from 'lucide-react';

export default function Topbar({ onMenuClick }) {
  const {
    activeRole,
    setActiveRole,
    patientName,
    refreshData,
    loading,
    representingProvider,
    setRepresentingProvider
  } = useApp();

  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="hamburger" onClick={onMenuClick} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div className="tb-search">
          <div className="tb-search-ico">
            <Search size={15} />
          </div>
          <input type="text" placeholder="Search secure records..." />
        </div>
      </div>

      <div className="tb-right">
        {activeRole === 'Provider' && (
          <select
            value={representingProvider}
            onChange={(e) => setRepresentingProvider(e.target.value)}
            className="form-input"
            style={{
              width: 'auto',
              padding: '2px 8px',
              height: '30px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: 'var(--surface-low)',
              borderColor: 'var(--outline-variant)'
            }}
          >
            <option value="City General Hospital">City General (Approved)</option>
            <option value="CVS Pharmacy">CVS Pharmacy (Pending/Re-auth)</option>
            <option value="St. Jude Hospital">St. Jude Hospital (Pending)</option>
          </select>
        )}

        <div className="role-switcher">
          {['Patient', 'Provider', 'Auditor'].map(role => (
            <button
              key={role}
              className={`role-pill ${activeRole === role ? 'active' : ''}`}
              onClick={() => setActiveRole(role)}
            >
              {role}
            </button>
          ))}
        </div>

        <button
          className={`tb-icon ${loading ? 'spinning' : ''}`}
          onClick={() => refreshData()}
          disabled={loading}
          aria-label="Refresh data"
        >
          <RefreshCw size={15} />
        </button>

        <button className="tb-icon" aria-label="Notifications">
          <Bell size={15} />
        </button>

        <div className="tb-verified">
          <ShieldCheck size={14} />
          <span>Verified</span>
        </div>

        <div className="user-chip" title={patientName}>
          {patientName.charAt(0)}
        </div>
      </div>
    </header>
  );
}
