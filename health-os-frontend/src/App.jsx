import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import VaultDashboard from './components/VaultDashboard';
import PrescriptionsPage from './components/PrescriptionsPage';
import ConsentPage from './components/ConsentPage';
import InsightsPage from './components/InsightsPage';
import SimulatorConsole from './components/SimulatorConsole';
import ProfilePage from './components/ProfilePage';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activePage, setActivePage, seeding, errorMsg, setErrorMsg } = useApp();

  const closeSidebar = () => setSidebarOpen(false);
  const navigate = (page) => { setActivePage(page); closeSidebar(); };

  if (seeding) {
    return (
      <div className="boot-screen">
        <div className="boot-logo">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M18 4C10.268 4 4 10.268 4 18s6.268 14 14 14 14-6.268 14-14S25.732 4 18 4z" stroke="#006a61" strokeWidth="1.5" fill="none"/>
            <path d="M11 18h4l2.5-6 3 12 2.5-6H25" stroke="#006a61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="boot-title">Health-OS</div>
        <div className="boot-status">Initializing secure enclave...</div>
        <div className="boot-bar"><div className="boot-fill" /></div>
      </div>
    );
  }

  return (
    <div className="app-root">
      {sidebarOpen && <div className="sidebar-overlay show" onClick={closeSidebar} />}

      <Sidebar activePage={activePage} navigate={navigate} isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="main-wrap">
        <Topbar onMenuClick={() => setSidebarOpen(v => !v)} />

        <div className="main-content page-in">
          {errorMsg && (
            <div className="error-banner">
              <span>{errorMsg}</span>
              <button className="error-banner-close" onClick={() => setErrorMsg('')}>✕</button>
            </div>
          )}

           {activePage === 'vault'         && <VaultDashboard />}
          {activePage === 'prescriptions' && <PrescriptionsPage />}
          {activePage === 'consent'       && <ConsentPage />}
          {activePage === 'insights'      && <InsightsPage />}
          {activePage === 'simulator'     && <SimulatorConsole />}
          {activePage === 'profile'       && <ProfilePage />}
        </div>


      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
