import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, TrendingUp, HeartPulse, AlertTriangle, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function InsightsPage() {
  const { safetyReport, fraudReport, prescriptions } = useApp();

  const safetyScore = safetyReport?.safetyScore ?? 100;
  const isSafe = safetyReport?.isSafe ?? true;
  const warnings = safetyReport?.warnings ?? [];
  const recommendations = safetyReport?.recommendations ?? [];
  const fraudScore = fraudReport?.fraudScore ?? 0;
  const verdict = fraudReport?.verdict ?? 'Clear';
  const anomalies = fraudReport?.anomalies ?? [];

  return (
    <div className="page-in">
      <div className="page-hd">
        <div>
          <h1 className="page-hd-title">Health Insights</h1>
          <p className="page-hd-sub">Real-time clinical analysis & secure pattern detection by the Health-OS AI Engine.</p>
        </div>
        <div className="page-hd-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-mid)', padding: '6px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--outline-variant)' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', textAlign: 'right' }}>Neural Engine</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: 'var(--secondary)', borderRadius: '50%', animation: 'pulse 1.8s ease-in-out infinite' }}></span>
                Active & Encrypted
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid">
        {fraudScore > 30 && anomalies.length > 0 ? (
          <div className="g8 fraud-card">
            <div className="fraud-card-bar"></div>
            <div className="fraud-card-body">
              <div className="fraud-card-top">
                <div className="fraud-card-title-row">
                  <div className="fraud-ico">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <div className="fraud-label">Critical Alert</div>
                    <div className="fraud-title">Anomalous Prescription Pattern Detected</div>
                  </div>
                </div>
                <div className="fraud-id">ID: XA-{Math.floor(Math.random() * 9000) + 1000}</div>
              </div>
              <p className="fraud-body">
                Our AI-Based Fraud Detection system has flagged anomalous prescription requests in your ledger. These requests deviate from your historical clinical usage.
              </p>
              <div className="xai-box">
                <div className="xai-label">
                  <Brain size={14} />
                  <span>Explainable AI (XAI)</span>
                </div>
                <div className="xai-text">
                  Anomaly score: <strong>{fraudScore}/100</strong>. Verdict: <strong>{verdict}</strong>.<br/>
                  Detected anomalies:
                  <ul style={{ paddingLeft: 16, marginTop: 4, fontSize: 12 }}>
                    {anomalies.map((a, i) => (
                      <li key={i}><strong>{a.type}</strong> ({a.severity}): {a.description}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="fraud-foot">
                <button className="btn btn-primary" onClick={() => alert('Anomalous activity reported to security')}>Decline & Report</button>
                <button className="btn btn-outline" onClick={() => alert('Verified by patient: records updated')}>This was me</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="g8 card-p">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'rgba(0,106,97,0.08)', color: 'var(--secondary)', padding: 8, borderRadius: 8, display: 'flex' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--secondary)' }}>System Clear</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>No Fraud Detected</div>
              </div>
              <span className="adv-tag teal" style={{ marginLeft: 'auto' }}>Clear Ledger</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 20 }}>
              All prescription activity is consistent with your established usage patterns. Anomaly score: <strong>{fraudScore}/100</strong> — Verdict: <strong>{verdict}</strong>.
            </p>
            <div style={{ height: 72, background: 'var(--surface-low)', borderRadius: 8, border: '1px solid rgba(198,198,205,0.3)', overflow: 'hidden' }}>
              <svg viewBox="0 0 100 30" style={{ width: '100%', height: '100%', display: 'block' }}>
                <path d="M0,25 L10,24 L20,26 L30,22 L40,23 L50,20 L60,18 L70,15 L80,16 L90,12 L100,10" fill="none" stroke="var(--secondary)" strokeWidth="1.5"/>
                <defs>
                  <linearGradient id="g1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#86f2e4" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#86f2e4" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,25 L10,24 L20,26 L30,22 L40,23 L50,20 L60,18 L70,15 L80,16 L90,12 L100,10 L100,30 L0,30Z" fill="url(#g1)"/>
              </svg>
            </div>
          </div>
        )}

        <div className="g4 advisory-card">
          <div className="adv-top">
            <div className="adv-ico teal"><TrendingUp size={18} /></div>
            <span className="adv-tag teal">Advisory</span>
          </div>
          <div className="adv-title">Safety Score Trend</div>
          <p className="adv-body">
            Current safety score: <strong style={{ color: isSafe ? 'var(--secondary)' : 'var(--error)' }}>{safetyScore}/100</strong>.
            {isSafe ? ' No clinical conflicts detected in your active profile.' : ' Clinical warnings active. Review interaction reports.'}
          </p>
          <div className="sparkline">
            <svg viewBox="0 0 100 30" style={{ width: '100%', height: '100%', display: 'block' }}>
              <path d={`M0,${30 - safetyScore * 0.25} L25,${30 - safetyScore * 0.26} L50,${30 - safetyScore * 0.24} L75,${30 - safetyScore * 0.28} L100,${30 - safetyScore * 0.27}`} fill="none" stroke="var(--secondary)" strokeWidth="2"/>
            </svg>
          </div>
          <button className="btn-ghost" style={{ width: '100%', marginTop: 14, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => alert('Vitals analytics verified.')}>
            View Vitals Analysis <ArrowRight size={14} />
          </button>
        </div>

        <div className="g4 advisory-card">
          <div className="adv-top">
            <div className="adv-ico dark"><HeartPulse size={18} /></div>
            <span className="adv-tag safe">Informational</span>
          </div>
          <div className="adv-title">Clinical Guidance</div>
          <p className="adv-body">
            {recommendations.length > 0 
              ? recommendations[0] 
              : 'Maintaining consistent medication dosage intervals will optimize therapeutic outcomes.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--outline)', marginTop: 'auto', paddingTop: 12 }}>
            <CheckCircle2 size={12} />
            Evidence-based Recommendation
          </div>
        </div>

        <div className="g4 advisory-card" style={{ background: 'rgba(184,117,0,0.04)', border: '1px solid rgba(184,117,0,0.2)' }}>
          <div className="adv-top">
            <div className="adv-ico warn"><AlertTriangle size={18} /></div>
            <span className="adv-tag warn">Safety Alert</span>
          </div>
          <div className="adv-title">Drug Interaction Risk</div>
          <p className="adv-body">
            {warnings.length > 0
              ? `${warnings[0].type}: ${warnings[0].message}`
              : 'Continuous clinical audit indicates no active drug-drug or allergy contraindications.'}
          </p>
          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--outline-variant)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)' }}>Verified by Pharm-AI</span>
            <button className="btn-ghost" onClick={() => alert('AI verified safety parameters.')}>Review</button>
          </div>
        </div>

        <div className="g4 card-dark" style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <Brain size={56} style={{ opacity: 0.1, position: 'absolute', top: 16, right: 16 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>AI Health Partner</h3>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16, lineHeight: 1.4 }}>Continuous monitoring for pharmacological changes and health safety.</p>
            <button className="btn btn-outline" style={{ border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }} onClick={() => alert('Agent config opened.')}>
              Configure Agent
            </button>
          </div>
        </div>

        <div className="g12 card">
          <div className="card-hd">
            <span className="card-hd-title" style={{ fontSize: 16 }}>Insight History</span>
          </div>
          {[
            { date: 'Jun 20, 2025', title: 'Safety Scan Complete', sub: 'All active medications cross-referenced against 4.2M drug interaction records. No critical conflicts.' },
            { date: 'Jun 19, 2025', title: 'Dosage Consistency Check', sub: 'Patient adherence to prescribed schedule verified at 94.3% over the past 14 days.' },
            { date: 'Jun 18, 2025', title: 'Consent Authorization', sub: 'New cryptographic consent issued to City General Hospital — Emergency Cardiology Dept.' },
            { date: 'Jun 15, 2025', title: 'Allergy Risk Detection', sub: 'Pharmacological allergy profile updated. No contraindications with active prescriptions found.' },
          ].map((item, i) => (
            <div className="insight-row" key={i}>
              <div className="insight-date">{item.date}</div>
              <div style={{ flex: 1 }}>
                <div className="insight-title">{item.title}</div>
                <div className="insight-sub">{item.sub}</div>
              </div>
              <ArrowRight className="insight-arr" size={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
