import { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare } from 'lucide-react';

export default function VideoConsultation() {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [captions] = useState([
    "Dr. Smith: Hello, how are you feeling today?",
    "Patient: I still have that sharp pain in my chest.",
    "Dr. Smith: Okay, let's go over your vitals that Aura AI sent me."
  ]);

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px' }}>Telehealth Video Consult</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', backgroundColor: 'rgba(250, 77, 86, 0.1)', color: 'var(--danger-color)', borderRadius: '20px', fontWeight: 600 }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--danger-color)', borderRadius: '50%', animation: 'blink 1s infinite' }}></div>
          LIVE (14:02)
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
        {/* Video Area */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ 
            flex: 1, backgroundColor: '#1A1A1A', borderRadius: '16px', position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '1px solid var(--border-color)'
          }}>
            {/* Main Video Feed (Doctor) */}
            <div style={{ position: 'absolute', opacity: 0.8 }}>
              <Video size={64} style={{ opacity: 0.2 }} />
              <p style={{ textAlign: 'center', marginTop: '16px', opacity: 0.5 }}>Dr. Smith's Camera Feed</p>
            </div>
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
              Dr. Sarah Smith, MD
            </div>

            {/* Picture-in-Picture (Patient) */}
            <div style={{ 
              position: 'absolute', bottom: '16px', right: '16px', width: '160px', height: '220px', 
              backgroundColor: videoOn ? '#2A2A2A' : '#111', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {videoOn ? <Video size={32} style={{ opacity: 0.2 }} /> : <VideoOff size={32} style={{ opacity: 0.5 }} />}
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                You
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="card" style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '16px' }}>
            <button 
              onClick={() => setMicOn(!micOn)}
              style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: micOn ? 'var(--surface-hover)' : 'var(--danger-color)', color: micOn ? 'var(--text-primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
            >
              {micOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button 
              onClick={() => setVideoOn(!videoOn)}
              style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: videoOn ? 'var(--surface-hover)' : 'var(--danger-color)', color: videoOn ? 'var(--text-primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
            >
              {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            <button style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--danger-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneOff size={24} />
            </button>
          </div>
        </div>

        {/* AI Closed Captioning Sidebar */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <MessageSquare color="var(--primary-color)" size={20} /> AI Clinical Captions
          </div>
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {captions.map((cap, i) => {
              const isPatient = cap.startsWith("Patient:");
              return (
                <div key={i} style={{ 
                  backgroundColor: isPatient ? 'var(--primary-color)' : 'var(--surface-hover)',
                  color: isPatient ? 'white' : 'var(--text-primary)',
                  padding: '12px 16px', borderRadius: '12px',
                  borderTopLeftRadius: isPatient ? '12px' : '4px',
                  borderTopRightRadius: isPatient ? '4px' : '12px',
                  alignSelf: isPatient ? 'flex-end' : 'flex-start',
                  maxWidth: '90%', fontSize: '14px', lineHeight: 1.5
                }}>
                  {cap}
                </div>
              );
            })}
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', padding: '12px 16px', backgroundColor: 'var(--surface-hover)', borderRadius: '12px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'blink 1.4s infinite' }}></span>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'blink 1.4s infinite 0.2s' }}></span>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'blink 1.4s infinite 0.4s' }}></span>
            </div>
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Transcripts are securely saved to your Clinical Scribe.
          </div>
        </div>
      </div>
    </div>
  );
}
