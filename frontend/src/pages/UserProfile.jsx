import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Shield, Heart, Save, X, Calendar } from 'lucide-react';

export default function UserProfile({ user: authUser, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    address: '',
    bloodType: '',
    allergies: '',
    insurance: '',
    policyNumber: '',
    emergencyContact: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name || 'John Doe',
        phone: authUser.phone || '+1 (555) 123-4567',
        dob: authUser.dob || '1990-01-01',
        address: authUser.address || '123 Health Ave, Wellness City, CA 90210',
        bloodType: authUser.bloodType || 'O+',
        allergies: authUser.allergies || 'Penicillin, Peanuts',
        insurance: authUser.insurance || 'Blue Cross Blue Shield',
        policyNumber: authUser.policyNumber || 'BCBS-987654321',
        emergencyContact: authUser.emergencyContact || 'Jane Doe (Spouse) - +1 (555) 987-6543'
      });
    }
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5001/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        if (onUpdateUser) onUpdateUser(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        // Fallback local update if API is disconnected/mocked
        if (onUpdateUser) onUpdateUser({ ...authUser, ...formData });
        setIsEditing(false);
        alert('Profile saved locally (MOCK mode).');
      }
    } catch (err) {
      console.error(err);
      if (onUpdateUser) onUpdateUser({ ...authUser, ...formData });
      setIsEditing(false);
      alert('Profile saved locally.');
    }
    setIsSaving(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="hero-widget" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: 700
          }}>
            {formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '4px' }}>{formData.name}</h2>
            <div style={{ opacity: 0.8 }}>Patient ID: P-101-492</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEditing ? (
            <>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="btn-primary"
                style={{ 
                  backgroundColor: 'white', color: 'var(--primary-color)', 
                  padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', 
                  padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px', border: 'none'
                }}
              >
                <X size={18} /> Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ 
                backgroundColor: 'white', color: 'var(--primary-color)', 
                padding: '10px 20px', borderRadius: '8px', fontWeight: 600 
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Personal Details */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--primary-color)" /> Personal Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email Address</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, marginTop: '4px' }}>
                <Mail size={16} color="var(--text-secondary)" /> {authUser?.email || 'john.doe@example.com'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>WhatsApp/Phone Number</div>
              {isEditing ? (
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, marginTop: '4px' }}>
                  <Phone size={16} color="var(--text-secondary)" /> {formData.phone}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Date of Birth</div>
              {isEditing ? (
                <input 
                  type="date" 
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, marginTop: '4px' }}>
                  <Calendar size={16} color="var(--text-secondary)" /> {formData.dob}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Address</div>
              {isEditing ? (
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, marginTop: '4px' }}>
                  <MapPin size={16} color="var(--text-secondary)" /> {formData.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Context */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} color="var(--danger-color)" /> Medical Context
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Blood Type</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                  />
                ) : (
                  <div style={{ fontWeight: 600, fontSize: '20px', color: 'var(--danger-color)', marginTop: '4px' }}>{formData.bloodType}</div>
                )}
              </div>
              
              <div style={{ flex: 1, textAlign: isEditing ? 'left' : 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Known Allergies</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                  />
                ) : (
                  <div style={{ fontWeight: 500, marginTop: '4px' }}>{formData.allergies}</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Emergency Contact</div>
              {isEditing ? (
                <input 
                  type="text" 
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                />
              ) : (
                <div style={{ fontWeight: 500, color: 'var(--primary-color)', marginTop: '4px' }}>{formData.emergencyContact}</div>
              )}
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--success-color)" /> Insurance & Billing
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: 1, display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Insurance Provider</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                  />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>{formData.insurance}</div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Policy Number</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                  />
                ) : (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Policy: {formData.policyNumber}</div>
                )}
              </div>
            </div>
            
            <span style={{ 
              padding: '6px 12px', backgroundColor: 'rgba(25, 128, 56, 0.1)', 
              color: 'var(--success-color)', borderRadius: '20px', fontSize: '12px', fontWeight: 600 
            }}>
              Active Coverage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
