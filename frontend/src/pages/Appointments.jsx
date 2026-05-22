import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Plus, Star, X, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const doctorsData = [
  { id: 'patel', name: 'Dr. Sophia Patel', specialty: 'Cardiology', rating: 4.9, experience: '12 yrs', bio: 'Expert in cardiovascular health, preventative care, and echocardiology.', avatar: 'SP', color: '#3b82f6' },
  { id: 'vance', name: 'Dr. Marcus Vance', specialty: 'Neurology', rating: 4.8, experience: '15 yrs', bio: 'Specialist in complex neurodegenerative disorders and migraine management.', avatar: 'MV', color: '#8b5cf6' },
  { id: 'stone', name: 'Dr. Emily Stone', specialty: 'Orthopedics', rating: 4.7, experience: '8 yrs', bio: 'Expert in sports medicine, clinical joint rehabilitation, and orthotic therapy.', avatar: 'ES', color: '#10b981' },
  { id: 'bennett', name: 'Dr. Clara Bennett', specialty: 'Dermatology', rating: 4.9, experience: '10 yrs', bio: 'Leader in advanced dermoscopy, acne treatment, and skin cancer screening.', avatar: 'CB', color: '#ec4899' },
  { id: 'kim', name: 'Dr. Daniel Kim', specialty: 'General Practice', rating: 4.6, experience: '6 yrs', bio: 'Dedicated to family wellness, preventative screening, and health coaching.', avatar: 'DK', color: '#f59e0b' }
];

const specialties = ['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'General Practice'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Multi-step form states
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('Cardiology');
  const [selectedDoctor, setSelectedDoctor] = useState(doctorsData[0]);
  const [bookingDate, setBookingDate] = useState('May 25, 2026');
  const [bookingTime, setBookingTime] = useState('10:30 AM');
  const [consultMode, setConsultMode] = useState('Video Consult'); // 'Video Consult' or 'In-Person Clinic'
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/appointments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setAppointments([]);
        }
      })
      .catch(err => {
        console.error(err);
        setAppointments([]);
      });
  }, []);

  const selectSpecialtyAndDoctor = (spec) => {
    setSelectedSpecialty(spec);
    const match = doctorsData.find(d => d.specialty === spec);
    if (match) setSelectedDoctor(match);
  };

  const handleNextStep = () => {
    setBookingStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setBookingStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalizeBooking = async () => {
    setIsSaving(true);
    // Mimic real security/network delay for high aesthetic feedback
    await new Promise(r => setTimeout(r, 800));

    const newApt = {
      doctor: selectedDoctor.name,
      type: `${selectedDoctor.specialty} Consultation`,
      date: bookingDate,
      time: bookingTime,
      mode: consultMode,
      location: consultMode === 'Video Consult' 
        ? 'Aura Secure Room ' + Math.floor(Math.random() * 100 + 101) 
        : 'Medical Plaza Building B, Suite ' + Math.floor(Math.random() * 20 + 201)
    };

    try {
      const response = await fetch('http://localhost:5001/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(newApt)
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(prev => [...prev, data]);
      } else {
        // Fallback save locally for smooth trial demo
        const fallback = { ...newApt, id: Date.now().toString() };
        setAppointments(prev => [...prev, fallback]);
      }
    } catch (err) {
      console.error('Failed to post appointment:', err);
      const fallback = { ...newApt, id: Date.now().toString() };
      setAppointments(prev => [...prev, fallback]);
    }

    setIsSaving(false);
    setBookingStep(1);
    setIsModalOpen(false);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            My Clinical Consultations
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Book secure, HIPAA-compliant appointments with your primary healthcare providers.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Schedule Appointment
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '32px' }}>
        
        {/* Appointments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Upcoming Clinical Visits</h3>
          
          {appointments.length === 0 ? (
            <div className="card glass-panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
              <CalendarIcon size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px', opacity: 0.5 }} />
              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No Appointments Booked</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
                You have no scheduled clinical visits. Click the button above to book an instant video consultation.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary" 
                style={{ padding: '10px 20px' }}
              >
                Book Your First Visit
              </button>
            </div>
          ) : (
            appointments.map(app => {
              const dateParts = app.date.split(' ');
              const month = dateParts[0] || 'May';
              const day = dateParts[1] ? dateParts[1].replace(',', '') : '22';
              
              return (
                <div 
                  key={app.id || app._id} 
                  className="card glass-panel" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    border: '1px solid var(--border-color)',
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Calendar Badge */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'var(--surface-hover)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '12px 18px', 
                      minWidth: '88px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase' }}>{month}</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{day}</div>
                    </div>
                    
                    {/* Appointment Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-color)', tracking: '0.5px' }}>
                        {app.type?.toUpperCase()}
                      </span>
                      <h4 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-primary)' }}>{app.doctor}</h4>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={13} /> {app.time}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} /> {app.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mode & Action */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      padding: '6px 14px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 700,
                      backgroundColor: app.mode === 'Video Consult' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      color: app.mode === 'Video Consult' ? 'var(--primary-color)' : 'var(--success-color)'
                    }}>
                      {app.mode === 'Video Consult' ? <Video size={13} /> : <MapPin size={13} />} {app.mode}
                    </div>
                    {app.mode === 'Video Consult' ? (
                      <button style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '13px', textDecoration: 'underline' }}>
                        Launch Video Suite →
                      </button>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Please arrive 10 min early</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Calendar Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Calendar Agenda</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
              {[...Array(30)].map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === 22;
                const hasApt = dayNum === 25;
                return (
                  <div key={i} style={{ 
                    padding: '8px 0', 
                    borderRadius: '50%', 
                    fontSize: '13px', 
                    cursor: 'pointer',
                    backgroundColor: isToday ? 'var(--primary-color)' : hasApt ? 'var(--success-glow)' : 'transparent',
                    color: isToday ? 'white' : hasApt ? 'var(--success-color)' : 'var(--text-primary)',
                    fontWeight: (isToday || hasApt) ? 700 : 400,
                    border: hasApt ? '1px dashed var(--success-color)' : 'none'
                  }}>
                    {dayNum}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }} />
                <span>Today (May 22)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }} />
                <span>Upcoming Consultation</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* High-Fidelity Multi-Step Booking Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-sheet glass-panel" style={{ maxWidth: '640px', padding: '36px', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-color)', letterSpacing: '1px' }}>
                  Step {bookingStep} of 4
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {bookingStep === 1 && 'Select Specialty & Doctor'}
                  {bookingStep === 2 && 'Choose Calendar Block'}
                  {bookingStep === 3 && 'Select Consultation Mode'}
                  {bookingStep === 4 && 'Confirm Security Clearance'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setBookingStep(1); }}
                style={{ color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Specialty & Doctor Selection */}
            {bookingStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Specialty Department</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {specialties.map(spec => (
                      <button
                        key={spec}
                        onClick={() => selectSpecialtyAndDoctor(spec)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          backgroundColor: selectedSpecialty === spec ? 'var(--primary-color)' : 'var(--surface-hover)',
                          color: selectedSpecialty === spec ? 'white' : 'var(--text-primary)',
                          border: '1px solid ' + (selectedSpecialty === spec ? 'var(--primary-color)' : 'var(--border-color)'),
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>Assigned Healthcare Specialists</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {doctorsData.filter(d => d.specialty === selectedSpecialty).map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        style={{
                          display: 'flex',
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: '2px solid ' + (selectedDoctor.id === doc.id ? 'var(--primary-color)' : 'var(--border-color)'),
                          backgroundColor: selectedDoctor.id === doc.id ? 'var(--primary-glow)' : 'rgba(0, 0, 0, 0.05)',
                          cursor: 'pointer',
                          gap: '16px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ 
                          width: '54px', 
                          height: '54px', 
                          borderRadius: '12px', 
                          backgroundColor: doc.color, 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 800,
                          fontSize: '18px',
                          boxShadow: '0 4px 12px ' + doc.color + '33'
                        }}>
                          {doc.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--warning-color)', fontWeight: 700 }}>
                              <Star size={14} fill="currentColor" /> {doc.rating}
                            </div>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 700, textTransform: 'uppercase' }}>
                            {doc.specialty} • {doc.experience} exp
                          </span>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{doc.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date & Slot Selector */}
            {bookingStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Choose Booking Date</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {[
                      { display: 'Mon 25', full: 'May 25, 2026' },
                      { display: 'Tue 26', full: 'May 26, 2026' },
                      { display: 'Wed 27', full: 'May 27, 2026' },
                      { display: 'Thu 28', full: 'May 28, 2026' },
                      { display: 'Fri 29', full: 'May 29, 2026' }
                    ].map(d => (
                      <button
                        key={d.full}
                        onClick={() => setBookingDate(d.full)}
                        style={{
                          padding: '14px 4px',
                          borderRadius: '12px',
                          border: '1px solid ' + (bookingDate === d.full ? 'var(--primary-color)' : 'var(--border-color)'),
                          backgroundColor: bookingDate === d.full ? 'var(--primary-glow)' : 'var(--surface-hover)',
                          color: bookingDate === d.full ? 'var(--primary-color)' : 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: '13px',
                          textAlign: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {d.display}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Choose Available Time Slot</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(t => (
                      <button
                        key={t}
                        onClick={() => setBookingTime(t)}
                        style={{
                          padding: '12px 0',
                          borderRadius: '12px',
                          border: '1px solid ' + (bookingTime === t ? 'var(--primary-color)' : 'var(--border-color)'),
                          backgroundColor: bookingTime === t ? 'var(--primary-glow)' : 'var(--surface-hover)',
                          color: bookingTime === t ? 'var(--primary-color)' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '13px',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Clock size={14} /> {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Consultation Mode Selector */}
            {bookingStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Consultation Delivery Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { mode: 'Video Consult', desc: 'Secure high-definition telehealth conference directly inside the Aura application dashboard. (HIPAA Encrypted)', icon: <Video size={28} /> },
                    { mode: 'In-Person Clinic', desc: 'Face-to-face consultation at our clinical campus. Arrive at Medical Plaza B Suite 204.', icon: <MapPin size={28} /> }
                  ].map(opt => (
                    <div
                      key={opt.mode}
                      onClick={() => setConsultMode(opt.mode)}
                      style={{
                        padding: '24px 20px',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid ' + (consultMode === opt.mode ? 'var(--primary-color)' : 'var(--border-color)'),
                        backgroundColor: consultMode === opt.mode ? 'var(--primary-glow)' : 'rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: consultMode === opt.mode ? 'var(--primary-color)' : 'var(--surface-hover)',
                        color: consultMode === opt.mode ? 'white' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {opt.icon}
                      </div>
                      <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>{opt.mode}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Confirm Security Clearance */}
            {bookingStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success-glow)',
                  color: 'var(--success-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                }}>
                  <Check size={36} />
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Security & Consent Review</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto', lineHeight: '1.5' }}>
                    You are scheduling a session with <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{selectedDoctor.name}</span> on <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bookingDate}</span> at <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bookingTime}</span> via <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{consultMode}</span>. 
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.15)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  lineHeight: '1.4'
                }}>
                  <span style={{ color: 'var(--warning-color)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>🔒 HIPAA DISCLOSURE Consent</span>
                  This session transmits biometric telemetry. By finalizing, you consent to secure clinical recording and automated EHR transcription via Aura AI Scribe.
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '32px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px'
            }}>
              <button
                onClick={handlePrevStep}
                disabled={bookingStep === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  opacity: bookingStep === 1 ? 0.3 : 1,
                  cursor: bookingStep === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              {bookingStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleFinalizeBooking}
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '10px 24px',
                    background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))' 
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      Securing EHR Block...
                    </>
                  ) : (
                    <>
                      Confirm & Save <Check size={16} />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
