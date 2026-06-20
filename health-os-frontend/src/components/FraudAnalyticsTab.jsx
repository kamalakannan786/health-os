import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, CheckCircle, HelpCircle, Activity } from 'lucide-react';

export default function FraudAnalyticsTab() {
  const { fraudReport, loading } = useApp();

  if (loading) {
    return (
      <div className="tab-content loading-state">
        <Activity className="spinning loading-icon" size={32} />
        <p>Analyzing prescription history patterns with local LLM...</p>
      </div>
    );
  }

  if (!fraudReport) {
    return (
      <div className="tab-content">
        <div className="panel card full-width">
          <p className="no-data">No history records available for pattern check.</p>
        </div>
      </div>
    );
  }

  const { fraudScore, anomalies, verdict } = fraudReport;

  return (
    <div className="tab-content">
      <div className="grid-layout">
        <div className="panel card align-center">
          <h2 className="panel-title text-center">
            <Activity size={20} className="panel-title-icon" />
            <span>Fraud & Pattern Risk Analysis</span>
          </h2>
          <div className="gauge-container">
            <div className={`gauge-radial ${verdict === 'Clear' ? 'gauge-safe' : (verdict === 'Suspicious' ? 'gauge-warning' : 'gauge-danger')}`}>
              <div className="gauge-inner">
                <span className="gauge-value">{fraudScore}%</span>
                <span className="gauge-label">Risk Index</span>
              </div>
            </div>
          </div>
          <div className={`safety-status-badge ${verdict === 'Clear' ? 'safe-bg' : (verdict === 'Suspicious' ? 'warning-bg' : 'danger-bg')}`}>
            Status: {verdict.toUpperCase()}
          </div>
        </div>

        <div className="panel card">
          <h2 className="panel-title">
            <ShieldAlert size={20} className="panel-title-icon" />
            <span>Pattern Anomalies Logged</span>
          </h2>
          <div className="alerts-list">
            {(!anomalies || anomalies.length === 0) ? (
              <div className="no-conflicts">
                <CheckCircle size={36} className="clear-icon" />
                <h3>No Anomalies Detected</h3>
                <p>Ollama analyzed the timeline and provider metrics and verified that no suspicious overlapping schedules exist.</p>
              </div>
            ) : (
              anomalies.map((a, idx) => (
                <div className={`alert-card severity-${a.severity.toLowerCase()}`} key={idx}>
                  <div className="alert-card-header">
                    <span className="alert-type">{a.type}</span>
                    <span className={`severity-tag severity-${a.severity.toLowerCase()}`}>
                      {a.severity}
                    </span>
                  </div>
                  <p className="alert-message">{a.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel card full-width">
          <h2 className="panel-title">
            <Activity size={20} className="panel-title-icon" />
            <span>Prescription Timeline Analytics Visualizer</span>
          </h2>
          <div className="analytics-viz">
            <div className="viz-timeline-line"></div>
            <div className="viz-points">
              <div className="viz-point active-point" title="Jan 10 - Lisinopril">
                <span className="point-dot"></span>
                <span className="point-label">Jan 10</span>
                <span className="point-meta">Dr. Chen</span>
              </div>
              <div className="viz-point active-point" title="Mar 15 - Lipitor">
                <span className="point-dot"></span>
                <span className="point-label">Mar 15</span>
                <span className="point-meta">Dr. Jenkins</span>
              </div>
              {anomalies && anomalies.length > 0 && (
                <div className="viz-point active-point anomaly-point" title="Overlapping Dose Request">
                  <span className="point-dot"></span>
                  <span className="point-label">Active</span>
                  <span className="point-meta">Refill Conflict</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
