import { useState } from 'react';
import { HeartPulse, User, Stethoscope } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup({ onLogin }) {
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('1990-01-01');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, dob })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) localStorage.setItem('token', data.token);
        onLogin(role, data);
        navigate('/');
      } else {
        // Fallback to local login if backend is not running
        localStorage.setItem('token', 'mock-jwt-token');
        onLogin(role, { name, email, phone, dob });
        navigate('/');
      }
    } catch (error) {
      // Fallback
      localStorage.setItem('token', 'mock-jwt-token');
      onLogin(role, { name, email, phone, dob });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, var(--bg-color), #E5F0FF)',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto',
      padding: '24px'
    }}>
      <div className="card" style={{ width: '450px', padding: '40px', marginTop: 'auto', marginBottom: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div className="sidebar-brand-icon" style={{ width: '64px', height: '64px', fontSize: '32px', marginBottom: '16px' }}>
            <HeartPulse size={36} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Create an Account</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>
            Join Aura Health to manage your care.
          </p>
        </div>

        {/* Role Selection Toggle */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-color)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <div 
            onClick={() => setRole('patient')}
            style={{ 
              flex: 1, textAlign: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer',
              backgroundColor: role === 'patient' ? 'var(--surface-color)' : 'transparent',
              boxShadow: role === 'patient' ? 'var(--shadow-sm)' : 'none',
              fontWeight: role === 'patient' ? 600 : 400,
              color: role === 'patient' ? 'var(--primary-color)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
            <User size={18} /> Patient Portal
          </div>
          <div 
            onClick={() => setRole('doctor')}
            style={{ 
              flex: 1, textAlign: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer',
              backgroundColor: role === 'doctor' ? 'var(--surface-color)' : 'transparent',
              boxShadow: role === 'doctor' ? 'var(--shadow-sm)' : 'none',
              fontWeight: role === 'doctor' ? 600 : 400,
              color: role === 'doctor' ? 'var(--primary-color)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
            <Stethoscope size={18} /> Doctor Portal
          </div>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              {role === 'doctor' ? 'Medical Staff ID or Email' : 'Email'}
            </label>
            <input 
              type={role === 'doctor' ? "text" : "email"}
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role === 'doctor' ? "Enter your ID or email" : "Enter your email"}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>WhatsApp/Phone Number</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1234567890"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Date of Birth</label>
            <input 
              type="date" 
              required
              value={dob}
              onChange={e => setDob(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', outline: 'none' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={!name || !email || !password || !phone || !dob || isLoading}
            style={{
              backgroundColor: 'var(--primary-color)', color: 'white', padding: '14px', borderRadius: '8px',
              fontWeight: 600, fontSize: '16px', marginTop: '12px', opacity: (!name || !email || !password || !phone || !dob || isLoading) ? 0.7 : 1
            }}
          >
            {isLoading ? 'Creating account...' : `Sign Up as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
