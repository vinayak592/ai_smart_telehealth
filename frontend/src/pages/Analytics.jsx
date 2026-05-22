import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Activity, Users, AlertTriangle, TrendingUp } from 'lucide-react';

const patientTrends = [
  { month: 'Jan', patients: 120, emergency: 20 },
  { month: 'Feb', patients: 150, emergency: 25 },
  { month: 'Mar', patients: 180, emergency: 30 },
  { month: 'Apr', patients: 220, emergency: 45 },
  { month: 'May', patients: 300, emergency: 40 },
  { month: 'Jun', patients: 350, emergency: 55 },
];

const specialtyLoad = [
  { name: 'Cardiology', patients: 140 },
  { name: 'Neurology', patients: 85 },
  { name: 'Orthopedics', patients: 110 },
  { name: 'General', patients: 210 },
  { name: 'Dermatology', patients: 65 },
];

const cdsAlerts = [
  { name: 'Normal', value: 60 },
  { name: 'Monitor', value: 25 },
  { name: 'Critical', value: 15 },
];

const COLORS = ['#24a148', '#f1c21b', '#fa4d56'];

export default function Analytics() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp color="var(--primary-color)" /> Hospital Analytics Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Real-time overview of patient trends, departmental load, and AI CDS alerts.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="avatar" style={{ backgroundColor: 'rgba(15, 98, 254, 0.1)', color: 'var(--primary-color)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>Total Active Patients</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>1,248</div>
            <div style={{ color: 'var(--success-color)', fontSize: '12px', fontWeight: 600 }}>+12% from last month</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="avatar" style={{ backgroundColor: 'rgba(250, 77, 86, 0.1)', color: 'var(--danger-color)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>Critical CDS Alerts</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>24</div>
            <div style={{ color: 'var(--danger-color)', fontSize: '12px', fontWeight: 600 }}>Action Required</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="avatar" style={{ backgroundColor: 'rgba(36, 161, 72, 0.1)', color: 'var(--success-color)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>System Uptime</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>99.9%</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>All services operational</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main Area Chart */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Patient Intake & Emergencies (6 Months)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--danger-color)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--danger-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Legend />
                <Area type="monotone" dataKey="patients" name="Standard Intake" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorPatients)" />
                <Area type="monotone" dataKey="emergency" name="Emergency Intake" stroke="var(--danger-color)" fillOpacity={1} fill="url(#colorEmergency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>AI CDS Alert Distribution</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cdsAlerts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cdsAlerts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Departmental Patient Load</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyLoad} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'var(--surface-hover)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="patients" fill="var(--secondary-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
