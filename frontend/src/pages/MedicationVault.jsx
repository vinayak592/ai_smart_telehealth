import { useState, useEffect } from 'react';
import { Pill, Camera, AlertTriangle, CheckCircle, Search, Upload, Plus, Trash2, X } from 'lucide-react';

export default function MedicationVault() {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Manual Entry Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualDosage, setManualDosage] = useState('');
  const [manualSchedule, setManualSchedule] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchMedications = async () => {
    try {
      const response = await fetch('http://localhost:5001/medications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setMedications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const triggerOcrScan = async () => {
    if (!previewUrl) return;
    setIsScanning(true);
    
    // Simulate scan timer
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:5001/parse_medication_label', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ labelImage: 'mock_base64_data' })
        });
        
        if (response.ok) {
          const data = await response.json();
          setScanResult(data);
        }
      } catch (err) {
        console.error("Scan parsing failed:", err);
      } finally {
        setIsScanning(false);
      }
    }, 2500);
  };

  const saveParsedMedication = async () => {
    if (!scanResult || !scanResult.parsed) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: scanResult.parsed.name,
          dosage: scanResult.parsed.dosage,
          schedule: scanResult.parsed.schedule,
          status: 'Active'
        })
      });
      if (response.ok) {
        // Clear scan states
        setSelectedFile(null);
        setPreviewUrl(null);
        setScanResult(null);
        fetchMedications();
      }
    } catch (err) {
      console.error("Failed to save scanned medication:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualName || !manualDosage || !manualSchedule) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: manualName,
          dosage: manualDosage,
          schedule: manualSchedule,
          status: 'Active'
        })
      });
      if (response.ok) {
        setManualName('');
        setManualDosage('');
        setManualSchedule('');
        setShowAddForm(false);
        fetchMedications();
      }
    } catch (err) {
      console.error("Failed to add manual medication:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedications = medications.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Heading Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Medication Vault</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Upload clinical prescription labels to extract records or add them manually.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            backgroundColor: 'var(--primary-color)', color: 'white', 
            padding: '10px 18px', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer' 
          }}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Close Manual Form' : 'Add Manually'}
        </button>
      </div>

      {/* Manual Add Form Drawer/Card */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px', animation: 'slideIn 0.3s ease' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Add Prescription Record</h3>
          <form onSubmit={handleManualSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>Medication Name</label>
              <input 
                type="text" 
                value={manualName} 
                onChange={e => setManualName(e.target.value)} 
                placeholder="e.g. Aspirin, Warfarin" 
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>Dosage / Strength</label>
              <input 
                type="text" 
                value={manualDosage} 
                onChange={e => setManualDosage(e.target.value)} 
                placeholder="e.g. 81mg, 5mg" 
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>Schedule / Frequency</label>
              <input 
                type="text" 
                value={manualSchedule} 
                onChange={e => setManualSchedule(e.target.value)} 
                placeholder="e.g. Daily at morning, As needed" 
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                backgroundColor: 'var(--primary-color)', color: 'white', padding: '12px', 
                borderRadius: '8px', fontWeight: 600, cursor: 'pointer', border: 'none' 
              }}
            >
              {isLoading ? 'Saving...' : 'Add Medication'}
            </button>
          </form>
        </div>
      )}

      {/* Main Upload / OCR Checker Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Side: Upload Target */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px', justifyContent: 'center', alignItems: 'center', border: '2px dashed var(--border-color)', padding: '24px', position: 'relative' }}>
          {!previewUrl ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E5F0FF', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 16px auto', color: 'var(--primary-color)', justifyContent: 'center' }}>
                <Upload size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Select Medication Label</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Upload any image or screenshot of your pill bottle label.</p>
              
              <label style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>
                Browse Files
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <img 
                src={previewUrl} 
                alt="Label Preview" 
                style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', objectFit: 'contain', border: '1px solid var(--border-color)' }} 
              />
              
              {isScanning && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '220px', 
                  background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.3))',
                  borderBottom: '3px solid var(--primary-color)',
                  animation: 'scannerLine 2s infinite ease-in-out',
                  pointerEvents: 'none',
                  borderRadius: '8px'
                }} />
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  onClick={triggerOcrScan} 
                  disabled={isScanning}
                  style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isScanning ? 'Extracting via AI...' : 'Scan Label OCR'}
                </button>
                <button 
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); setScanResult(null); }} 
                  disabled={isScanning}
                  style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Clear File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Scan Status / Assessment Reading */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!isScanning && !scanResult && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
              <Camera size={44} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <h3>OCR Telemetry Idle</h3>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Upload a label and click "Scan Label OCR" to run the interaction checklist analysis.</p>
            </div>
          )}

          {isScanning && (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontWeight: 600 }}>Analyzing Label Data...</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Extracting compound metrics, dosing rules, and evaluating safety checkpoints.</p>
            </div>
          )}

          {scanResult && scanResult.parsed && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="var(--success-color)" /> Extracted Prescription Details
              </h3>
              
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Drug Name:</span>
                  <span style={{ fontWeight: 600 }}>{scanResult.parsed.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Strength:</span>
                  <span style={{ fontWeight: 600 }}>{scanResult.parsed.dosage}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Instructions:</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{scanResult.parsed.schedule}</span>
                </div>
              </div>

              {/* Interactions Output Warning */}
              {scanResult.interaction ? (
                <div style={{ 
                  backgroundColor: scanResult.interaction.risk === 'Critical Risk' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  borderLeft: `4px solid ${scanResult.interaction.risk === 'Critical Risk' ? 'var(--danger-color)' : 'var(--warning-color)'}`,
                  padding: '16px', borderRadius: '8px', marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: scanResult.interaction.risk === 'Critical Risk' ? 'var(--danger-color)' : 'var(--warning-color)', fontWeight: 600, marginBottom: '6px' }}>
                    <AlertTriangle size={18} /> {scanResult.interaction.risk} Detected
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {scanResult.interaction.warning}
                  </p>
                </div>
              ) : (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderLeft: '4px solid var(--success-color)', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)', fontSize: '14px', fontWeight: 600 }}>
                  <CheckCircle size={16} /> Clinical Interaction Check: Clear
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={saveParsedMedication} 
                  disabled={isLoading}
                  style={{ flex: 1, backgroundColor: 'var(--primary-color)', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isLoading ? 'Saving...' : 'Add to Prescriptions'}
                </button>
                <button 
                  onClick={() => setScanResult(null)} 
                  style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Re-scan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Table: Active Prescriptions List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Active Prescriptions Vault</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-color)' }}>
            <Search size={16} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search medications..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', width: '180px' }} 
            />
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Medication</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Dosage</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Schedule</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedications.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No active prescriptions found. Try scanning a pill bottle label!
                </td>
              </tr>
            ) : (
              filteredMedications.map((med, idx) => (
                <tr key={med._id || idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <Pill size={18} color="var(--primary-color)" /> {med.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{med.dosage}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{med.schedule}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success-color)', fontSize: '14px', fontWeight: 600 }}>
                      <CheckCircle size={14} /> {med.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Keyframes styles for Scanner Lines & Animations */}
      <style>{`
        @keyframes scannerLine {
          0% { top: 0px; }
          50% { top: calc(100% - 220px); }
          100% { top: 0px; }
        }
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .table-row-hover:hover {
          background-color: var(--bg-color);
        }
      `}</style>
    </div>
  );
}
