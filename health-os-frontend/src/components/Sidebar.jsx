import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Pill, FileCheck, BarChart2, Terminal, Plus, Lock, HelpCircle, X } from 'lucide-react';

const navItems = [
  { id: 'vault',         label: 'Vault',         icon: Shield    },
  { id: 'prescriptions', label: 'Prescriptions',  icon: Pill      },
  { id: 'consent',       label: 'Consent',        icon: FileCheck },
  { id: 'insights',      label: 'Insights',       icon: BarChart2 },
  { id: 'simulator',     label: 'Sim Console',    icon: Terminal  },
];

export default function Sidebar({ activePage, navigate, isOpen, onClose }) {
  const { resetDB, loading } = useApp();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="sb-close" onClick={onClose} aria-label="Close sidebar">
        <X size={18} />
      </button>

      <div className="sb-brand">
        <div className="sb-brand-name">Health-OS</div>
        <div className="sb-brand-sub">Sovereign Identity Verified</div>
      </div>

      <div className="sb-vault">
        <div className="sb-vault-ico">
          <Shield size={18} />
        </div>
        <div>
          <div className="sb-vault-label">Health-OS Vault</div>
          <div className="sb-vault-status">Identity Verified</div>
        </div>
      </div>

      <nav className="sb-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sb-nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => navigate(id)}
          >
            <Icon size={16} />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="sb-cta">
        <button className="sb-cta-btn" onClick={resetDB} disabled={loading}>
          <Plus size={15} />
          {loading ? 'Working...' : 'Reset & Re-seed'}
        </button>
      </div>

      <div className="sb-footer">
        <button className="sb-nav-item">
          <Lock size={15} />
          <span className="nav-label">Security Settings</span>
        </button>
        <button className="sb-nav-item">
          <HelpCircle size={15} />
          <span className="nav-label">Support</span>
        </button>
      </div>
    </aside>
  );
}
