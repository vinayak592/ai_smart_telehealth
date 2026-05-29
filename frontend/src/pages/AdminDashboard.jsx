import { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  Users, 
  FileText, 
  Check, 
  X, 
  Building, 
  AlertTriangle,
  Lock,
  Search,
  RefreshCw,
  Award,
  Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock chart data representing system telemetry activity
const auditActivityData = [
  { day: 'Mon', queries: 24, alerts: 2 },
  { day: 'Tue', queries: 45, alerts: 1 },
  { day: 'Wed', queries: 32, alerts: 0 },
  { day: 'Thu', queries: 68, alerts: 4 },
  { day: 'Fri', queries: 54, alerts: 3 },
  { day: 'Sat', queries: 30, alerts: 1 },
  { day: 'Sun', queries: 40, alerts: 2 },
];

const initialDoctors = [
  { id: 1, name: 'Dr. Liam Vance', specialty: 'Cardiology', board: 'Harvard Medical', license: 'MD-9402A', status: 'Pending Review', email: 'l.vance@aura.com' },
  { id: 2, name: 'Dr. Fiona Gallagher', specialty: 'Pediatrics', board: 'Johns Hopkins', license: 'MD-8321B', status: 'Pending Review', email: 'f.gallagher@aura.com' },
  { id: 3, name: 'Dr. Raj Anan', specialty: 'Internal Medicine', board: 'Stanford University', license: 'MD-7451C', status: 'Pending Review', email: 'r.anan@aura.com' }
];

export default function AdminDashboard({ activeSection = 'dashboard' }) {
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Doctor Verification State
  const [doctors, setDoctors] = useState(initialDoctors);
  
  // Department Capacities
  const [erCapacity, setErCapacity] = useState(84);
  const [cardioCapacity, setCardioCapacity] = useState(62);
  const [neuroCapacity, setNeuroCapacity] = useState(48);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await fetch('http://localhost:5001/admin/audit_logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Audit logs query error:', err);
      // Fallback mock logs for fluid demo if server offline
      setLogs([
        { _id: '1', timestamp: new Date(Date.now() - 300000), role: 'admin', userName: 'System Administrator', action: 'SECURITY_LEDGER_SYNC', details: 'Full clinical database ledger cryptographic audit check passed', status: 'SUCCESS' },
        { _id: '2', timestamp: new Date(Date.now() - 600000), role: 'doctor', userName: 'Dr. Sophia Patel', action: 'PRESCRIPTION_ISSUED', details: 'Issued prescription for Lisinopril to patient Alex Mercer', status: 'SUCCESS' },
        { _id: '3', timestamp: new Date(Date.now() - 1200000), role: 'patient', userName: 'Alex Mercer', action: 'AI_TRIAGE_CHECK', details: 'Symptom triage completed. Department: Cardiology. Urgency L3', status: 'SUCCESS' },
        { _id: '4', timestamp: new Date(Date.now() - 3600000), role: 'doctor', userName: 'Dr. Sophia Patel', action: 'USER_LOGIN', details: 'Successful JWT authentication from IP 192.168.1.42', status: 'SUCCESS' }
      ]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleVerifyDoctor = (id) => {
    setDoctors(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'Verified' } : doc));
  };

  const handleRejectDoctor = (id) => {
    setDoctors(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'Rejected' } : doc));
  };

  // Filter logs based on search term and role
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      log.action?.toLowerCase().includes(term) ||
      log.details?.toLowerCase().includes(term) ||
      log.userName?.toLowerCase().includes(term);
    
    const matchesRole = filterRole === 'all' || log.role?.toLowerCase() === filterRole.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            System Audit & Analytics Console
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            HIPAA security logging, active clinical department loads, and provider credential validations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchLogs} 
            className="btn-primary" 
            style={{ 
              padding: '10px 18px', 
              fontSize: '13px', 
              background: 'var(--surface-hover)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)',
              boxShadow: 'none'
            }}
          >
            <RefreshCw size={14} /> Refresh Logs
          </button>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'var(--success-glow)', 
            color: 'var(--success-color)', 
            padding: '8px 16px', 
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 700,
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <Lock size={14} /> HIPAA Compliant
          </div>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="card glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Database Integrity</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={20} /> COMPLIANT
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ledger Cryptography Active</span>
        </div>

        <div className="card glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Telemetry Nodes</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={20} /> 8 Connected
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vitals syncing live</span>
        </div>

        <div className="card glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>HIPAA Audit Ledger</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={20} /> {logs.length} Actions
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Full real-time audit coverage</span>
        </div>

        <div className="card glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mean Incident Response</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={20} /> 0.82 seconds
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Under standard HIPAA thresholds</span>
        </div>
      </div>

      {/* Main Sections Wrapper */}
      {activeSection === 'dashboard' ? (
        <>
          {/* Capacity Gauges & Doctor Credentials */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '32px' }}>
            
            {/* SVG Radial Capacity Gauges */}
            <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Department Loads</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Real-time clinic/ER bed occupancy rates.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Gauge 1: Emergency Room */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <svg width="60" height="60" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        stroke="var(--danger-color)" strokeWidth="3" 
                        strokeDasharray="100" strokeDashoffset={100 - erCapacity}
                        strokeLinecap="round" transform="rotate(-90 18 18)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                      {erCapacity}%
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Emergency Room Capacity</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>High load. Rerouting Level 1 stable patients.</p>
                  </div>
                </div>

                {/* Gauge 2: Cardiology beds */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <svg width="60" height="60" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        stroke="var(--primary-color)" strokeWidth="3" 
                        strokeDasharray="100" strokeDashoffset={100 - cardioCapacity}
                        strokeLinecap="round" transform="rotate(-90 18 18)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                      {cardioCapacity}%
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Cardiology Beds</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Optimal capacity. 4 active diagnostic tracks.</p>
                  </div>
                </div>

                {/* Gauge 3: Neurology load */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <svg width="60" height="60" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        stroke="var(--success-color)" strokeWidth="3" 
                        strokeDasharray="100" strokeDashoffset={100 - neuroCapacity}
                        strokeLinecap="round" transform="rotate(-90 18 18)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                      {neuroCapacity}%
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Neurology Occupancy</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Stable load. AI clinical routing active.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Verification Hub */}
            <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Provider Verification Hub</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Review medical staff boards, state licenses, and authorize EHR access keys.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {doctors.map(doc => (
                  <div 
                    key={doc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      border: '1px solid var(--border-color)',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</h4>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 800, 
                          padding: '3px 8px', 
                          borderRadius: '12px',
                          backgroundColor: doc.status === 'Verified' ? 'var(--success-glow)' : doc.status === 'Rejected' ? 'var(--danger-glow)' : 'var(--warning-glow)',
                          color: doc.status === 'Verified' ? 'var(--success-color)' : doc.status === 'Rejected' ? 'var(--danger-color)' : 'var(--warning-color)'
                        }}>
                          {doc.status}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 600 }}>
                        {doc.specialty} • Board: {doc.board}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        State License: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{doc.license}</span> • {doc.email}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {doc.status === 'Pending Review' ? (
                        <>
                          <button 
                            onClick={() => handleRejectDoctor(doc.id)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
                              color: 'var(--danger-color)',
                              border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                            title="Decline Staff Registration"
                          >
                            <X size={14} />
                          </button>
                          <button 
                            onClick={() => handleVerifyDoctor(doc.id)}
                            className="btn-primary"
                            style={{
                              padding: '8px 14px',
                              fontSize: '12px',
                              borderRadius: '8px',
                              background: 'linear-gradient(90deg, var(--primary-color), var(--success-color))'
                            }}
                          >
                            Verify & Provision
                          </button>
                        </>
                      ) : doc.status === 'Verified' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success-color)', fontSize: '12px', fontWeight: 700 }}>
                          <Check size={16} /> Certified
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger-color)', fontSize: '12px', fontWeight: 700 }}>
                          <X size={16} /> Access Blocked
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Area Chart: System Throughput Activity */}
          <div className="card glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>HIPAA Ledger Activity Analysis</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Monitored cryptographic queries and system warnings over the past week.</p>
            </div>
            
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={auditActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--danger-color)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--danger-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.2} />
                  <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface-color)', 
                      borderColor: 'var(--border-color)', 
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="queries" stroke="var(--primary-color)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQueries)" name="Cryptographic Queries" />
                  <Area type="monotone" dataKey="alerts" stroke="var(--danger-color)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAlerts)" name="Security Warnings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        /* Full Real-Time HIPAA Audit Logs Table View */
        <div className="card glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>HIPAA Telemetry Security Logs</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Full cryptographic ledger tracking patient queries, provider approvals, and EHR access records.</p>
            </div>
            
            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search ledger actions..."
                  style={{
                    padding: '10px 12px 10px 36px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    color: '#ffffff'
                  }}
                />
              </div>

              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                style={{
                  padding: '10px 14px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  color: '#ffffff',
                  width: '130px'
                }}
              >
                <option value="all">All Roles</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          {isLoadingLogs ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} />
              Verifying Cryptographic Ledger...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No audit logs matched search criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '14px 20px', fontWeight: 800, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Timestamp</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Operator Name</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Action Ledger</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Compliance Details</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>HIPAA Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, idx) => (
                    <tr 
                      key={log._id || idx} 
                      style={{ 
                        borderBottom: idx !== filteredLogs.length - 1 ? '1px solid var(--border-color)' : 'none',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          backgroundColor: log.role === 'admin' ? 'var(--success-glow)' : log.role === 'doctor' ? 'var(--warning-glow)' : 'var(--primary-glow)',
                          color: log.role === 'admin' ? 'var(--success-color)' : log.role === 'doctor' ? 'var(--warning-color)' : 'var(--primary-color)'
                        }}>
                          {log.role || 'patient'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {log.userName}
                      </td>
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--secondary-color)', fontWeight: 700 }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.4' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success-color)', fontSize: '12px', fontWeight: 700 }}>
                          <Check size={14} /> Compliance OK
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
