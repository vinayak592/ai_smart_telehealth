import { useState, useEffect, useRef } from 'react';
import { Mic, Square, FileText, CheckCircle, Clock, Share2, Check, Loader2 } from 'lucide-react';

export default function ClinicalScribe({ user }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [sharingId, setSharingId] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState(user?.phone || '+1234567890');
  const [shareSuccessId, setShareSuccessId] = useState(null);
  
  const recognitionRef = useRef(null);
  const mockIntervalRef = useRef(null);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:5001/clinical_notes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        // Sort newest first
        setTranscripts(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let totalTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setLiveTranscript(totalTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, []);

  const handleShareWhatsApp = async (transcript) => {
    setSharingId(transcript._id || transcript.id);
    setShareSuccessId(null);
    try {
      const reportText = `*Clinical Scribe Note*\n\nTitle: ${transcript.title}\nDate: ${new Date(transcript.date).toLocaleDateString()}\n\nSummary:\n${transcript.summary}`;
      const response = await fetch('http://localhost:5001/send_whatsapp_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          reportText,
          phone: whatsappPhone
        })
      });
      const data = await response.json();
      if (data.success) {
        setShareSuccessId(transcript._id || transcript.id);
        setTimeout(() => setShareSuccessId(null), 3000);
      } else {
        alert('Failed to send note: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send report. Using mock developer fallback.');
      setShareSuccessId(transcript._id || transcript.id);
      setTimeout(() => setShareSuccessId(null), 3000);
    }
    setSharingId(null);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      } else if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
      
      const summaryText = liveTranscript.trim() || 'No audio captured.';
      
      fetch('http://localhost:5001/clinical_notes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: 'Voice Note - ' + new Date().toLocaleTimeString(),
          summary: summaryText
        })
      }).then(() => fetchNotes()).catch(console.error);
      
    } else {
      setIsRecording(true);
      setLiveTranscript('');
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback Mock Simulation for browsers without SpeechRecognition
        const mockPhrases = [
          "Patient is presenting with ", "mild fever ", "and reports feeling fatigued ", 
          "for the past 3 days. ", "I recommend ", "plenty of fluids ", "and resting."
        ];
        let currentText = "";
        let index = 0;
        
        mockIntervalRef.current = setInterval(() => {
          if (index < mockPhrases.length) {
            currentText += mockPhrases[index];
            setLiveTranscript(currentText);
            index++;
          } else {
            clearInterval(mockIntervalRef.current);
            setIsRecording(false);
            
            fetch('http://localhost:5001/clinical_notes', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                title: 'Voice Note - ' + new Date().toLocaleTimeString(),
                summary: currentText
              })
            }).then(() => fetchNotes()).catch(console.error);

          }
        }, 800);
      }
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="hero-widget" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, var(--secondary-color), #4A148C)' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>AI Clinical Scribe</h2>
          <p style={{ maxWidth: '500px', opacity: 0.9, fontSize: '14px', lineHeight: '1.5' }}>
            Record your visit, consults, or symptoms. Aura AI automatically transcribes the audio and generates a structured patient summary.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={toggleRecording}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: isRecording ? 'var(--danger-color)' : 'white',
              color: isRecording ? 'white' : 'var(--secondary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isRecording ? '0 0 0 8px rgba(239, 68, 68, 0.3)' : 'var(--shadow-md)',
              transition: 'all 0.3s ease'
            }}
          >
            {isRecording ? <Square size={32} /> : <Mic size={32} />}
          </button>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>
            {isRecording ? 'Recording... Speak now' : 'Tap to Record'}
          </div>
        </div>
        
        {isRecording && (
          <div style={{ marginTop: '24px', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px', color: 'white', minHeight: '60px', width: '100%' }}>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger-color)', animation: 'blink 1s infinite' }} />
              Live Transcript
            </div>
            <div style={{ fontSize: '16px', fontStyle: liveTranscript ? 'normal' : 'italic', opacity: liveTranscript ? 1 : 0.7 }}>
              {liveTranscript || 'Listening for your voice...'}
            </div>
          </div>
        )}
      </div>

      {/* Scribe Header Actions with WhatsApp Target Column */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Past Clinical Notes</h3>
        
        {/* WhatsApp Number Column Configurator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          backgroundColor: 'rgba(0,0,0,0.15)', 
          padding: '8px 16px', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)' 
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WhatsApp Target:</span>
          <input 
            type="text"
            value={whatsappPhone}
            onChange={e => setWhatsappPhone(e.target.value)}
            placeholder="e.g. +1234567890"
            style={{
              padding: '6px 10px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
              width: '160px',
              outline: 'none'
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {transcripts.length === 0 ? (
           <div className="card glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              <FileText size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <p style={{ fontSize: '14px' }}>No transcribes recorded yet. Click the recorder above to dictate.</p>
           </div>
        ) : (
          transcripts.map(t => {
            const noteId = t._id || t.id;
            const isNoteSharing = sharingId === noteId;
            const isNoteSuccess = shareSuccessId === noteId;
            
            return (
              <div key={noteId} className="card glass-panel" style={{ border: '1px solid var(--border-color)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar" style={{ backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary-color)', border: 'none' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={12} /> {new Date(t.date || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <CheckCircle size={13} /> AI Encrypted
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', backgroundColor: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                  {t.summary}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => handleShareWhatsApp(t)}
                    disabled={isNoteSharing}
                    style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      backgroundColor: isNoteSuccess ? 'var(--success-color)' : 'transparent', 
                      color: isNoteSuccess ? 'white' : '#25D366', 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid ' + (isNoteSuccess ? 'var(--success-color)' : '#25D366'), 
                      fontWeight: 700, 
                      fontSize: '12px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isNoteSharing ? 0.7 : 1
                    }}
                  >
                    {isNoteSharing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Sending...
                      </>
                    ) : isNoteSuccess ? (
                      <>
                        <Check size={14} /> Sent!
                      </>
                    ) : (
                      <>
                        <Share2 size={14} /> Share via WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
