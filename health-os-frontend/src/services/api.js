const BASE = 'http://localhost:8080/api';

async function req(url, opts = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const errText = await res.text();
    let errDetail = errText;
    try {
      const json = JSON.parse(errText);
      errDetail = json.detail || errText;
    } catch {}
    const error = new Error(errDetail || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export const seedDatabase        = ()               => req('/seed', { method: 'POST' });
export const getLogs             = ()               => req('/logs');
export const getPrescriptions    = (id, role)       => req(`/prescriptions?patient_id=${id}&requester=${encodeURIComponent(role)}`);
export const createPrescription  = (data)           => req('/prescriptions', { method: 'POST', body: JSON.stringify(data) });
export const getConsents         = (id)             => req(`/consents?patient_id=${id}`);
export const requestConsent      = (id, name)       => req('/consents', { method: 'POST', body: JSON.stringify({ patient_id: id, requester_name: name }) });
export const updateConsent       = (id, status, sig) => req(`/consents/${id}`, { method: 'PUT', body: JSON.stringify({ status, digital_signature: sig || null }) });
export const getSafetyAnalysis   = (id)             => req(`/ai/safety/${id}`);
export const getFraudAnalysis    = (id)             => req(`/ai/fraud/${id}`);
