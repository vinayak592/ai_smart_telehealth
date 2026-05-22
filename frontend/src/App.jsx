import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  LayoutDashboard, 
  MessageSquare, 
  Pill, 
  Scan, 
  Mic, 
  Activity, 
  Receipt, 
  AlertTriangle,
  Users,
  ClipboardList,
  User as UserIcon,
  LogOut,
  Calendar as CalendarIcon,
  Video,
  TrendingUp,
  Code,
  Shield,
  FileText,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Building,
  UserCheck
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Architecture from './pages/Architecture';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserProfile from './pages/UserProfile';
import DoctorDashboard from './pages/DoctorDashboard';
import MedicationVault from './pages/MedicationVault';
import ARScanner from './pages/ARScanner';
import ClinicalScribe from './pages/ClinicalScribe';
import VitalsCDS from './pages/VitalsCDS';
import BillingCopilot from './pages/BillingCopilot';
import DoctorSummaries from './pages/DoctorSummaries';
import PatientSearch from './pages/PatientSearch';
import EmergencySOS from './pages/EmergencySOS';
import VideoConsultation from './pages/VideoConsultation';
import Appointments from './pages/Appointments';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function PatientSidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'My Profile', icon: <UserIcon size={20} />, path: '/profile' },
    { name: 'Appointments', icon: <CalendarIcon size={20} />, path: '/appointments' },
    { name: 'Video Consult', icon: <Video size={20} />, path: '/video' },
    { name: 'AI Triage & Chat', icon: <MessageSquare size={20} />, path: '/chat' },
    { name: 'Medication Vault', icon: <Pill size={20} />, path: '/medications' },
    { name: 'AR Scanner', icon: <Scan size={20} />, path: '/scanner' },
    { name: 'Clinical Scribe', icon: <Mic size={20} />, path: '/scribe' },
    { name: 'Vitals & CDS', icon: <Activity size={20} />, path: '/vitals' },
    { name: 'Billing & Copilot', icon: <Receipt size={20} />, path: '/billing' },
    { name: 'Analytics', icon: <TrendingUp size={20} />, path: '/analytics' },
    { name: 'Architecture', icon: <Code size={20} />, path: '/architecture' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <HeartPulse size={24} />
        </div>
        <div className="sidebar-brand-text">Aura Health</div>
      </div>
      
      <div className="nav-menu">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: '0 24px', marginBottom: '24px' }}>
        <hr style={{ borderColor: 'var(--border-color)', marginBottom: '16px' }} />
        <Link to="/emergency" className="nav-item" style={{ color: 'var(--danger-color)' }}>
          <AlertTriangle size={20} />
          Emergency SOS
        </Link>
      </div>
    </div>
  );
}

function DoctorSidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Triage Queue', icon: <Users size={20} />, path: '/' },
    { name: 'AI Summaries', icon: <ClipboardList size={20} />, path: '/summaries' },
    { name: 'Patient Search', icon: <Scan size={20} />, path: '/search' },
    { name: 'Analytics', icon: <TrendingUp size={20} />, path: '/analytics' },
    { name: 'Architecture', icon: <Code size={20} />, path: '/architecture' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, var(--danger-color), var(--warning-color))' }}>
          <HeartPulse size={24} />
        </div>
        <div className="sidebar-brand-text" style={{ fontSize: '20px' }}>Aura Provider</div>
      </div>
      
      <div className="nav-menu">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminSidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'System Console', icon: <Shield size={20} />, path: '/' },
    { name: 'HIPAA Audit Logs', icon: <FileText size={20} />, path: '/logs' },
    { name: 'Performance Analytics', icon: <TrendingUp size={20} />, path: '/analytics' },
    { name: 'Core Architecture', icon: <Code size={20} />, path: '/architecture' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--success-color))' }}>
          <Shield size={24} />
        </div>
        <div className="sidebar-brand-text" style={{ fontSize: '19px' }}>Aura Admin</div>
      </div>
      
      <div className="nav-menu">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Layout({ role, user, setAuthInfo }) {
  const navigate = useNavigate();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileCardRef = useRef(null);
  
  // Theme Switching state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'; // Sleek dark mode by default!
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside profile quick-card listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileCardRef.current && !profileCardRef.current.contains(event.target)) {
        setShowProfileCard(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const getSidebar = () => {
    if (role === 'admin') return <AdminSidebar />;
    if (role === 'doctor') return <DoctorSidebar />;
    return <PatientSidebar />;
  };

  const getPageTitle = () => {
    if (role === 'admin') return 'System Administration';
    if (role === 'doctor') return 'Provider Dashboard';
    return 'Patient Portal';
  };

  const handleRoleSwap = (newRole) => {
    localStorage.setItem('role', newRole);
    setAuthInfo(prev => ({ ...prev, role: newRole }));
    setShowProfileCard(false);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthInfo({ authenticated: false, role: null, user: null });
    navigate('/login');
  };

  return (
    <div className="app-container">
      {getSidebar()}
      
      <div className="main-content">
        <div className="topbar">
          <div className="page-title">{getPageTitle()}</div>
          
          <div className="topbar-actions">
            {/* Elegant Theme Switcher Button */}
            <button 
              onClick={toggleTheme} 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease',
                border: '1px solid var(--border-color)'
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={20} style={{ color: 'var(--warning-color)' }} /> : <Moon size={20} style={{ color: 'var(--primary-color)' }} />}
            </button>

            {/* Profile Dropdown Trigger */}
            <div 
              style={{ position: 'relative' }} 
              ref={profileCardRef}
            >
              <div 
                onClick={() => setShowProfileCard(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: showProfileCard ? 'var(--surface-hover)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                  border: '1px solid ' + (showProfileCard ? 'var(--border-color)' : 'transparent')
                }}
              >
                <div className="avatar" style={{ margin: 0 }}>
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : (role === 'admin' ? 'AD' : (role === 'doctor' ? 'DR' : 'PT'))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user?.name || 'Aura User'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {role} {role === 'admin' && <Shield size={10} style={{ color: 'var(--success-color)' }} />}
                  </span>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s ease', transform: showProfileCard ? 'rotate(180deg)' : 'none' }} />
              </div>

              {/* High-Fidelity Quick Card Swapper Dropdown */}
              {showProfileCard && (
                <div 
                  className="card glass-panel" 
                  style={{
                    position: 'absolute',
                    top: '54px',
                    right: 0,
                    width: '280px',
                    zIndex: 1000,
                    padding: '20px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-md)',
                    animation: 'slideUp 0.15s ease-out'
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name || 'Demo User'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.email || 'user@aurahealth.com'}</div>
                  </div>

                  <hr style={{ borderColor: 'var(--border-color)', margin: '0 -20px 12px' }} />

                  {/* Role Swap Quick Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '4px', letterSpacing: '0.5px' }}>
                      Change Portal Persona
                    </div>
                    {[
                      { id: 'patient', label: 'Patient Portal', icon: <UserIcon size={14} /> },
                      { id: 'doctor', label: 'Provider Portal', icon: <Users size={14} /> },
                      { id: 'admin', label: 'System Admin', icon: <Shield size={14} /> }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleRoleSwap(item.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: role === item.id ? 700 : 500,
                          backgroundColor: role === item.id ? 'var(--primary-glow)' : 'transparent',
                          color: role === item.id ? 'var(--primary-color)' : 'var(--text-primary)',
                          transition: 'all 0.15s ease',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.icon}
                          {item.label}
                        </div>
                        {role === item.id && <Check size={14} style={{ color: 'var(--primary-color)' }} />}
                      </button>
                    ))}
                  </div>

                  <hr style={{ borderColor: 'var(--border-color)', margin: '0 -20px 12px' }} />

                  {/* Logout Action */}
                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--danger-color)',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--danger-glow)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} /> Log Out Securely
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="content-scroll">
          <Routes>
            {role === 'admin' ? (
              // Admin Routes
              <>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/logs" element={<AdminDashboard activeSection="logs" />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/architecture" element={<Architecture />} />
                <Route path="*" element={<AdminDashboard />} />
              </>
            ) : role === 'doctor' ? (
              // Doctor Routes
              <>
                <Route path="/" element={<DoctorDashboard />} />
                <Route path="/summaries" element={<DoctorSummaries />} />
                <Route path="/search" element={<PatientSearch />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/architecture" element={<Architecture />} />
                <Route path="*" element={<div><h2>Provider Feature</h2><p>Coming Soon.</p></div>} />
              </>
            ) : (
              // Patient Routes
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chat" element={<Chatbot />} />
                <Route path="/profile" element={<UserProfile user={user} onUpdateUser={(updated) => setAuthInfo(prev => ({ ...prev, user: updated }))} />} />
                <Route path="/medications" element={<MedicationVault />} />
                <Route path="/scanner" element={<ARScanner />} />
                <Route path="/scribe" element={<ClinicalScribe user={user} />} />
                <Route path="/vitals" element={<VitalsCDS user={user} />} />
                <Route path="/billing" element={<BillingCopilot />} />
                <Route path="/emergency" element={<EmergencySOS />} />
                <Route path="/video" element={<VideoConsultation />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/architecture" element={<Architecture />} />
                <Route path="*" element={<div><h2>Coming Soon</h2><p>This feature is being ported.</p></div>} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [authInfo, setAuthInfo] = useState({ authenticated: false, role: null, user: null });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'patient';
    if (token) {
      fetch('http://localhost:5001/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Invalid token');
      })
      .then(user => {
        setAuthInfo({ authenticated: true, role, user });
      })
      .catch((err) => {
        console.error('Session hydration failed:', err);
        // Fallback for mock demo session preservation
        setAuthInfo({ 
          authenticated: true, 
          role, 
          user: { 
            name: role === 'admin' ? 'System Administrator' : (role === 'doctor' ? 'Dr. Sophia Patel' : 'Alex Mercer'), 
            email: role === 'admin' ? 'admin@aura.com' : (role === 'doctor' ? 'doctor@aura.com' : 'patient@aura.com'),
            phone: '555-0000' 
          } 
        });
      })
      .finally(() => {
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, []);

  const handleLoginSuccess = (role, user) => {
    localStorage.setItem('role', role);
    setAuthInfo({ authenticated: true, role, user });
  };

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0b0f19', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <HeartPulse size={48} style={{ animation: 'blink 1.5s ease infinite', color: 'var(--primary-color)' }} />
          <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: '#ffffff' }}>Securing Aura Health Connection...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!authInfo.authenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
          <Route path="/signup" element={<Signup onLogin={handleLoginSuccess} />} />
          <Route path="*" element={<Login onLogin={handleLoginSuccess} />} />
        </Routes>
      ) : (
        <Layout role={authInfo.role} user={authInfo.user} setAuthInfo={setAuthInfo} />
      )}
    </Router>
  );
}

export default App;
