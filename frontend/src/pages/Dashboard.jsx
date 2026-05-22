import { Link } from 'react-router-dom';
import { CloudSun, MessageSquare, Pill, Scan, Mic } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <div className="hero-widget">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'rgba(255,255,255,0.8)' }}>
            <CloudSun color="#F1C21B" />
            <span style={{ fontWeight: 600 }}>Predictive Health Weather</span>
          </div>
          <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>High Pollen Alert Today</h2>
          <p style={{ fontSize: '16px', maxWidth: '600px', lineHeight: '1.6' }}>
            Based on your history of allergic rhinitis, consider taking your antihistamine today. 
            Air quality is moderate (AQI 65).
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Flare Risk</div>
          <div style={{ fontSize: '36px', fontWeight: 800 }}>75%</div>
        </div>
      </div>

      <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Quick Access</h3>
      
      <div className="grid-dashboard">
        <Link to="/chat" className="card action-card">
          <div className="action-card-icon" style={{ backgroundColor: 'var(--primary-color)' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="action-card-title">AI Chat & Triage</div>
            <div className="action-card-desc">Emotional Biofeedback enabled</div>
          </div>
        </Link>
        
        <Link to="/medications" className="card action-card">
          <div className="action-card-icon" style={{ backgroundColor: 'var(--secondary-color)' }}>
            <Pill size={24} />
          </div>
          <div>
            <div className="action-card-title">Smart Med Vault</div>
            <div className="action-card-desc">OCR & Interaction Checks</div>
          </div>
        </Link>

        <Link to="/scanner" className="card action-card">
          <div className="action-card-icon" style={{ backgroundColor: 'var(--success-color)' }}>
            <Scan size={24} />
          </div>
          <div>
            <div className="action-card-title">AR Symptom Scanner</div>
            <div className="action-card-desc">Visual progression tracking</div>
          </div>
        </Link>

        <Link to="/scribe" className="card action-card">
          <div className="action-card-icon" style={{ backgroundColor: 'var(--danger-color)' }}>
            <Mic size={24} />
          </div>
          <div>
            <div className="action-card-title">Clinical Scribe</div>
            <div className="action-card-desc">Patient-friendly summaries</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
