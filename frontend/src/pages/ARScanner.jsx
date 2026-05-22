import { useState, useEffect } from 'react';
import { Scan, Maximize, Activity, Thermometer, ShieldAlert, Sparkles, Calendar, Heart } from 'lucide-react';

export default function ARScanner() {
  const [isActive, setIsActive] = useState(false);
  const [scanType, setScanType] = useState('skin'); // 'skin', 'eye', 'throat'
  const [isCapturing, setIsCapturing] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  
  // Simulated telemetry state
  const [telemetry, setTelemetry] = useState({ size: '1.2 cm', color: 'Normal', confidence: '98%', status: 'Stable' });

  // Update telemetry values when scanType changes
  useEffect(() => {
    if (scanType === 'skin') {
      setTelemetry({ size: '1.4 cm', color: 'Erythema', confidence: '92%', status: 'Evaluate border asymmetry' });
    } else if (scanType === 'eye') {
      setTelemetry({ size: 'N/A', color: 'Hyperemia (12% redness)', confidence: '95%', status: 'Slight sclera injection' });
    } else if (scanType === 'throat') {
      setTelemetry({ size: 'N/A', color: 'Inflamed Palate', confidence: '89%', status: 'Mild tonsil swelling (Grade 1)' });
    }
  }, [scanType]);

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('http://localhost:5001/ar_scans', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        // Sort newest first
        setScanHistory(data.reverse());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const handleCapture = async () => {
    setIsCapturing(true);
    
    // Simulate telemetry processing delay
    setTimeout(async () => {
      let metrics = {};
      let clinicalAssessment = '';
      
      if (scanType === 'skin') {
        metrics = { size: '1.4 cm', color: 'Erythema', borderSymmetry: '94%', colorUniform: '88%' };
        clinicalAssessment = 'Mild skin lesion. Margins are regular. Suggest checking for changes using A-B-C-D-E rule monthly.';
      } else if (scanType === 'eye') {
        metrics = { scleraRedness: '12%', pupilReact: 'Normal', conjunctiva: 'Healthy' };
        clinicalAssessment = 'Mild eye congestion detected. Sclera is clear overall. Ensure adequate rest and reduce screen time.';
      } else if (scanType === 'throat') {
        metrics = { tonsilEnlargement: '15%', exudate: 'None', palateColor: 'Hyperemic' };
        clinicalAssessment = 'Pharyngeal throat lining shows mild erythema. Tonsils are clear of exudate. Rest and hydrate.';
      }

      try {
        const response = await fetch('http://localhost:5001/ar_scans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            scanType,
            metrics,
            clinicalAssessment
          })
        });

        if (response.ok) {
          fetchScanHistory();
        }
      } catch (err) {
        console.error("Failed to save AR scan:", err);
      } finally {
        setIsCapturing(false);
      }
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Page Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>AR Symptom Scanner</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Analyze skin lesions, eye scleras, and throats using simulated optical AR telemetries.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Column: Live AR Scanner Viewport */}
        <div className="card" style={{ 
          padding: 0, 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#0c0e14',
          border: '1px solid #1f2937',
          minHeight: '440px',
          position: 'relative'
        }}>
          {!isActive ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '24px' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' 
              }}>
                <Scan size={40} color="var(--primary-color)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Optical Sensor Offline</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', maxWidth: '300px', marginBottom: '24px' }}>
                Enable the AR sensor frame to begin tracking symptom progress.
              </p>
              <button 
                onClick={() => setIsActive(true)}
                style={{ 
                  backgroundColor: 'var(--primary-color)', color: 'white', padding: '12px 28px', 
                  borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                Enable Camera Sensor
              </button>
            </div>
          ) : (
            <>
              {/* Scan Mode Toggle Bar */}
              <div style={{ display: 'flex', backgroundColor: '#111827', padding: '6px', borderBottom: '1px solid #1f2937' }}>
                {['skin', 'eye', 'throat'].map(type => (
                  <button
                    key={type}
                    onClick={() => setScanType(type)}
                    disabled={isCapturing}
                    style={{
                      flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      backgroundColor: scanType === type ? '#1f2937' : 'transparent',
                      color: scanType === type ? 'var(--primary-color)' : '#9ca3af',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type === 'skin' ? 'Skin Lesion' : type === 'eye' ? 'Eye Sclera' : 'Throat Infection'}
                  </button>
                ))}
              </div>

              {/* Fake Live Video Feeds with Custom SVGs/Overlays */}
              <div style={{ 
                flex: 1, 
                background: 'radial-gradient(circle at center, #1e293b, #0f172a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                
                {/* Visual grid pattern */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }} />

                {/* Laser Overlay Line */}
                <div style={{
                  position: 'absolute', top: '50%', left: 0, right: 0, height: '1px',
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)',
                  animation: 'scanningAR 3s infinite linear'
                }} />

                {/* AR Frame Alignment Graphics */}
                {scanType === 'skin' && (
                  <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                    {/* Circle border */}
                    <div style={{ width: '100%', height: '100%', border: '2px dashed var(--success-color)', borderRadius: '50%', animation: 'spinAR 10s infinite linear' }} />
                    <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '50%' }} />
                    {/* Core target */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', backgroundColor: 'var(--success-color)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
                    <div style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', color: 'var(--success-color)', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      ALIGN SKIN LESION HERE
                    </div>
                  </div>
                )}

                {scanType === 'eye' && (
                  <div style={{ position: 'relative', width: '220px', height: '120px' }}>
                    {/* Eye shape mockup */}
                    <div style={{ width: '100%', height: '100%', border: '2px solid var(--primary-color)', borderRadius: '50% 50%', transform: 'rotate(0deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Pupil concentric rings */}
                      <div style={{ width: '60px', height: '60px', border: '1px dashed var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }} />
                      </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', color: 'var(--primary-color)', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      ALIGN SCLERA / IRIS CENTER
                    </div>
                  </div>
                )}

                {scanType === 'throat' && (
                  <div style={{ position: 'relative', width: '150px', height: '220px' }}>
                    {/* Oval throat opening layout */}
                    <div style={{ width: '100%', height: '100%', border: '2px solid var(--danger-color)', borderRadius: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '80%', height: '1px', borderBottom: '1px dashed var(--danger-color)', marginBottom: '30px' }} />
                      <div style={{ color: 'var(--danger-color)', fontSize: '10px', fontWeight: 600 }}>TONSILS TARGET</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', color: 'var(--danger-color)', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      ALIGN OPEN MOUTH WIDE
                    </div>
                  </div>
                )}

                {/* Telemetry Corner Indicators */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', color: '#10B981', fontFamily: 'monospace', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>FPS: 60.0</div>
                  <div>LUX: 420.2</div>
                  <div>DEV_SZ: {telemetry.size}</div>
                </div>

                <div style={{ position: 'absolute', top: '16px', right: '16px', color: '#10B981', fontFamily: 'monospace', fontSize: '11px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>THERMAL: STABLE</div>
                  <div>ISO: 200</div>
                  <div>CONF: {telemetry.confidence}</div>
                </div>

                {isCapturing && (
                  <div style={{ 
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    <div className="spinner" style={{ border: '3px solid #374151', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                    <div style={{ fontWeight: 600 }}>Capturing Frame...</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Extracting spatial maps</div>
                  </div>
                )}
              </div>

              {/* Bottom controls */}
              <div style={{ padding: '16px', backgroundColor: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1f2937' }}>
                <button
                  onClick={() => setIsActive(false)}
                  disabled={isCapturing}
                  style={{
                    backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #374151', 
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
                  }}
                >
                  Turn Off
                </button>
                <button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  style={{
                    backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', 
                    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px'
                  }}
                >
                  Capture & Save Assessment
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Telemetry & Interactive Details panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--primary-color)" /> Sensor Analysis Readings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Telemetry Target:</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{scanType} scan</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Estimated Size / Dev:</span>
                <span style={{ fontWeight: 600 }}>{telemetry.size}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Chromatic Assessment:</span>
                <span style={{ fontWeight: 600 }}>{telemetry.color}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>AI Match Confidence:</span>
                <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>{telemetry.confidence}</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
                <Sparkles size={16} /> Diagnostic Alignment Tip
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Ensure your symptom falls squarely inside the designated crosshairs. Avoid bright shadows or dim rooms to achieve the highest diagnostic fidelity.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <ShieldAlert size={16} color="var(--warning-color)" /> This is a diagnostic aid tool. Please consult a clinician for official medical assessments.
          </div>
        </div>
      </div>

      {/* Timeline logs of completed scans */}
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={20} color="var(--primary-color)" /> Symptom Assessment Timeline Logs
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {scanHistory.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No past scans logged. Complete your first optical capture above!
          </div>
        ) : (
          scanHistory.map((scan, idx) => (
            <div className="card animate-log-item" key={scan._id || idx} style={{ transition: 'transform 0.2s', borderLeft: `4px solid ${scan.scanType === 'skin' ? 'var(--success-color)' : scan.scanType === 'eye' ? 'var(--primary-color)' : 'var(--danger-color)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    backgroundColor: scan.scanType === 'skin' ? 'rgba(16,185,129,0.1)' : scan.scanType === 'eye' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                    color: scan.scanType === 'skin' ? 'var(--success-color)' : scan.scanType === 'eye' ? 'var(--primary-color)' : 'var(--danger-color)',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase'
                  }}>
                    {scan.scanType} scanner
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {new Date(scan.date).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success-color)' }}>
                  Optical Check Complete
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px', backgroundColor: 'var(--bg-color)', padding: '12px', borderRadius: '8px' }}>
                {Object.entries(scan.metrics || {}).map(([key, val]) => (
                  <div key={key} style={{ fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <strong>Assessment notes:</strong> {scan.clinicalAssessment}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Animations styling */}
      <style>{`
        @keyframes scanningAR {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes spinAR {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-log-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
