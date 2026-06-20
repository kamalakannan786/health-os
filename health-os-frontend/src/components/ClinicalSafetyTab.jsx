import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertTriangle, Lightbulb, Activity } from 'lucide-react';

export default function ClinicalSafetyTab() {
  const { safetyReport, loading } = useApp();

  if (loading) {
    return (
      <div className="tab-content loading-state">
        <Activity className="spinning loading-icon" size={32} />
        <p>Analyzing health records safety with local LLM...</p>
      </div>
    );
  }

  if (!safetyReport) {
    return (
      <div className="tab-content">
        <div className="panel card full-width">
          <p className="no-data">No clinical data available for analysis.</p>
        </div>
      </div>
    );
  }

  const { isSafe, safetyScore, warnings, recommendations } = safetyReport;

  return (
    <div className="tab-content">
      <div className="grid-layout">
        <div className="panel card align-center">
          <h2 className="panel-title text-center">
            <Activity size={20} className="panel-title-icon" />
            <span>Health Safety Score</span>
          </h2>
          <div className="gauge-container">
            <div className={`gauge-radial ${isSafe ? 'gauge-safe' : 'gauge-danger'}`}>
              <div className="gauge-inner">
                <span className="gauge-value">{safetyScore}</span>
                <span className="gauge-label">Score</span>
              </div>
            </div>
          </div>
          <div className={`safety-status-badge ${isSafe ? 'safe-bg' : 'danger-bg'}`}>
            {isSafe ? 'All Systems Clear' : 'Active Conflicts Flagged'}
          </div>
        </div>

        <div className="panel card">
          <h2 className="panel-title">
            <AlertTriangle size={20} className="panel-title-icon" />
            <span>AI Clinical Safety Alerts</span>
          </h2>
          <div className="alerts-list">
            {(!warnings || warnings.length === 0) ? (
              <div className="no-conflicts">
                <ShieldCheck size={36} className="clear-icon" />
                <h3>No Clinical Conflicts</h3>
                <p>Ollama scanned the prescription history against active patient allergies and found no critical interactions.</p>
              </div>
            ) : (
              warnings.map((w, idx) => (
                <div className={`alert-card severity-${w.severity.toLowerCase()}`} key={idx}>
                  <div className="alert-card-header">
                    <span className="alert-type">{w.type}</span>
                    <span className={`severity-tag severity-${w.severity.toLowerCase()}`}>
                      {w.severity}
                    </span>
                  </div>
                  <p className="alert-message">{w.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel card full-width">
          <h2 className="panel-title">
            <Lightbulb size={20} className="panel-title-icon" />
            <span>Actionable Clinical Guidance</span>
          </h2>
          <ul className="guidance-list">
            {recommendations && recommendations.map((rec, idx) => (
              <li key={idx}>
                <div className="bullet-point"></div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
