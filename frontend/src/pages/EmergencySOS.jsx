import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone, ShieldAlert, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmergencySOS() {
  const [countdown, setCountdown] = useState(10);
  const [status, setStatus] = useState('counting'); // 'counting', 'dispatched', 'cancelled'
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'counting' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'counting' && countdown === 0) {
      setStatus('dispatched');
    }
  }, [countdown, status]);

  const handleCancel = () => {
    setStatus('cancelled');
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: status === 'cancelled' ? 'var(--bg-color)' : 'rgba(250, 77, 86, 0.05)',
      padding: '24px'
    }}>
      <div className="card" style={{ 
        width: '100%', maxWidth: '600px', textAlign: 'center', padding: '48px',
        border: `2px solid ${status === 'cancelled' ? 'var(--border-color)' : 'var(--danger-color)'}`
      }}>
        
        {status === 'counting' && (
          <>
            <ShieldAlert size={80} color="var(--danger-color)" style={{ animation: 'blink 1s infinite', margin: '0 auto 24px' }} />
            <h1 style={{ fontSize: '36px', color: 'var(--danger-color)', marginBottom: '8px' }}>EMERGENCY SOS</h1>
            <p style={{ fontSize: '18px', marginBottom: '32px' }}>
              Dispatching emergency medical services to your location in...
            </p>
            <div style={{ fontSize: '80px', fontWeight: 800, color: 'var(--danger-color)', lineHeight: 1, marginBottom: '32px' }}>
              {countdown}
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={handleCancel}
                style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 600, borderRadius: '12px', border: '2px solid var(--border-color)', backgroundColor: 'white' }}
              >
                Cancel SOS
              </button>
            </div>
          </>
        )}

        {status === 'dispatched' && (
          <>
            <div style={{ 
              width: '100px', height: '100px', backgroundColor: 'var(--danger-color)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              boxShadow: '0 0 0 20px rgba(250, 77, 86, 0.2)'
            }}>
              <AlertTriangle size={48} color="white" />
            </div>
            <h2 style={{ fontSize: '28px', color: 'var(--danger-color)', marginBottom: '16px' }}>AMBULANCE DISPATCHED</h2>
            <div style={{ textAlign: 'left', backgroundColor: 'var(--bg-color)', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontWeight: 500 }}>
                <MapPin color="var(--danger-color)" /> ETA: 4 Minutes
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                <Phone color="var(--primary-color)" /> Emergency contacts have been notified.
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Please stay calm and unlock your front door if you are able to.</p>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <X size={40} color="var(--text-secondary)" />
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>SOS Cancelled</h2>
            <p style={{ color: 'var(--text-secondary)' }}>The emergency dispatch has been aborted. Returning to dashboard...</p>
          </>
        )}

      </div>
    </div>
  );
}
