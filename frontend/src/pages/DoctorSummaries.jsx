import { useState, useEffect } from 'react';
import { Search, Clock, Download, Check, ShieldAlert } from 'lucide-react';

export default function DoctorSummaries() {
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummaries = async () => {
    try {
      const response = await fetch('http://localhost:5001/doctor/triage_queue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setSummaries(data);
        if (data.length > 0 && !selectedSummary) {
          setSelectedSummary(data[0]);
        } else if (selectedSummary) {
          // Keep selection updated
          const updated = data.find(s => s.id === selectedSummary.id);
          if (updated) setSelectedSummary(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleReview = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/doctor/review_triage/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchSummaries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSummaries = summaries.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '24px', height: '100%' }}>
      {/* Sidebar List */}
      <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search summaries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
        
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : filteredSummaries.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No summaries found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            {filteredSummaries.map((s) => (
              <div 
                key={s.id} 
                className="card" 
                onClick={() => setSelectedSummary(s)}
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer', 
                  border: selectedSummary?.id === s.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  transition: 'border 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: s.status === 'Reviewed' ? 'var(--success-color)' : 'var(--warning-color)', 
                    fontWeight: 600 
                  }}>
                    {s.status}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Clock size={12} /> {new Date(s.date).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Symptom: {s.symptom}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail View */}
      {selectedSummary ? (
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>AI Triage Summary</h2>
              <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>ID: {selectedSummary.id.substring(0, 8).toUpperCase()}</span>
                <span>Patient: {selectedSummary.name}</span>
                <span>Date: {new Date(selectedSummary.date).toLocaleDateString()}</span>
              </div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary-color)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>
              <Download size={16} /> Export to EHR
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-color)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
              <ShieldAlert size={20} color="var(--primary-color)" />
              <div style={{ fontSize: '14px' }}>
                <strong>Urgency Classification:</strong> Level {selectedSummary.urgency} / 5 • <strong>Routing:</strong> {selectedSummary.dispatchDepartment}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subjective</h4>
              <p style={{ lineHeight: 1.6, backgroundColor: 'var(--bg-color)', padding: '12px', borderRadius: '6px' }}>
                Patient reports the following symptoms: "{selectedSummary.symptom}"
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Objective</h4>
              <p style={{ lineHeight: 1.6 }}>
                AI Medical engine processed patient descriptors with GDPR/HIPAA-compliant regex PII filtering. Urgency scoring logged as Level {selectedSummary.urgency}. Target department identified: {selectedSummary.dispatchDepartment}.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assessment</h4>
              <p style={{ lineHeight: 1.6 }}>
                Symptoms triaged as indicative of {selectedSummary.dispatchDepartment.toLowerCase()} presentation. Standard guidelines require immediate physician review for Level 4-5 triage listings.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan</h4>
              <p style={{ lineHeight: 1.6 }}>
                Recommend directing patient checkup with the {selectedSummary.dispatchDepartment} department. Provider should review details and verify flags.
              </p>
            </div>
          </div>

          <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            {selectedSummary.status !== 'Reviewed' ? (
              <button 
                onClick={() => handleReview(selectedSummary.id)}
                style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600, backgroundColor: 'var(--success-color)', color: 'white', cursor: 'pointer' }}
              >
                Sign & Verify Note
              </button>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)', fontWeight: 600 }}>
                <Check size={18} /> Signed & Verified
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Select a triage summary to view the SOAP analysis.
        </div>
      )}
    </div>
  );
}
