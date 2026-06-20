import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeRole, setActiveRole] = useState('Patient');
  const [activePatientId] = useState(1);
  const [patientName, setPatientName] = useState('Alice Smith');
  const [publicKey] = useState('VORTEXA_PUB_ALICE_12345');
  const [privateKey, setPrivateKey] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [consents, setConsents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [safetyReport, setSafetyReport] = useState(null);
  const [fraudReport, setFraudReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [representingProvider, setRepresentingProvider] = useState('City General Hospital');
  const [accessDenied, setAccessDenied] = useState(false);
  const [allergies, setAllergies] = useState([]);
  const [activePage, setActivePage] = useState('vault');
  const [labReports, setLabReports] = useState([]);

  const refreshData = useCallback(async (role = activeRole, provider = representingProvider) => {
    setErrorMsg('');
    setAccessDenied(false);
    try {
      const [logsData, consentData, safetyData, fraudData, patientData, labData] = await Promise.all([
        api.getLogs(),
        api.getConsents(activePatientId),
        api.getSafetyAnalysis(activePatientId),
        api.getFraudAnalysis(activePatientId),
        api.getPatient(activePatientId),
        api.getLabReports(activePatientId),
      ]);
      setLogs(logsData);
      setConsents(consentData);
      setSafetyReport(safetyData);
      setFraudReport(fraudData);
      setPatientName(patientData.full_name);
      setAllergies(patientData.allergies || []);
      setLabReports(labData || []);
      setLastRefresh(new Date());

      try {
        const requester = role === 'Patient' ? 'Patient' : (role === 'Auditor' ? 'Health-OS Clinical Agent' : provider);
        const rxData = await api.getPrescriptions(activePatientId, requester);
        setPrescriptions(rxData);
      } catch (err) {
        setPrescriptions([]);
        if (err.status === 403) {
          setAccessDenied(true);
        } else {
          setErrorMsg(err.message || 'Failed to load prescription data.');
        }
      }
    } catch (err) {
      setErrorMsg('Backend unreachable. Ensure the FastAPI server is running.');
    }
  }, [activePatientId, activeRole, representingProvider]);

  const updatePatientProfile = async (name, newAllergies) => {
    setLoading(true);
    try {
      await api.updatePatient(activePatientId, { full_name: name, allergies: newAllergies });
      await refreshData();
    } catch {
      setErrorMsg('Failed to update patient profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setSeeding(true);
      try {
        await api.seedDatabase();
      } catch {}
      setSeeding(false);
      await refreshData(activeRole, representingProvider);
    };
    init();
  }, []);

  useEffect(() => {
    if (seeding) return;
    refreshData(activeRole, representingProvider);
  }, [activeRole, representingProvider]);

  useEffect(() => {
    if (seeding) return;
    const interval = setInterval(() => {
      refreshData(activeRole, representingProvider);
    }, 3000);
    return () => clearInterval(interval);
  }, [seeding, activeRole, representingProvider, refreshData]);

  const signConsent = async (consentId, requester) => {
    try {
      const msgBuffer = new TextEncoder().encode(`${publicKey}:${requester}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      await api.updateConsent(consentId, 'approved', hashHex);
      await refreshData();
    } catch {
      setErrorMsg('Signature generation failed');
    }
  };

  const revokeConsent = async (consentId) => {
    try {
      await api.updateConsent(consentId, 'revoked', '');
      await refreshData();
    } catch {
      setErrorMsg('Failed to revoke consent');
    }
  };

  const requestNewConsent = async (requesterName) => {
    try {
      await api.requestConsent(activePatientId, requesterName);
      await refreshData();
    } catch {
      setErrorMsg('Failed to request consent');
    }
  };

  const createNewPrescription = async (medicationName, dosage, prescriber) => {
    try {
      const originalText = `${medicationName} ${dosage} for therapeutic patient recovery`;
      const combined = `KEY:${publicKey}|DATA:${originalText}`;
      const encryptedData = 'VORTEXA_ENC:' + btoa(combined);
      await api.createPrescription({
        patient_id: activePatientId,
        prescriber,
        medication_name: medicationName,
        dosage,
        encrypted_data: encryptedData
      });
      await refreshData();
    } catch {
      setErrorMsg('Failed to write prescription record');
    }
  };

  const resetDB = async () => {
    setLoading(true);
    try {
      await api.seedDatabase();
      setIsDecrypted(false);
      setPrivateKey('');
      await refreshData();
    } catch {
      setErrorMsg('Database reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      activePage, setActivePage,
      activeRole, setActiveRole,
      activePatientId, patientName, publicKey,
      privateKey, setPrivateKey,
      prescriptions, consents, logs, labReports,
      isDecrypted, setIsDecrypted,
      safetyReport, fraudReport,
      loading, seeding, errorMsg, setErrorMsg,
      lastRefresh, representingProvider, setRepresentingProvider,
      accessDenied, setAccessDenied, allergies, updatePatientProfile,
      refreshData, signConsent, revokeConsent,
      requestNewConsent, createNewPrescription, resetDB
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
