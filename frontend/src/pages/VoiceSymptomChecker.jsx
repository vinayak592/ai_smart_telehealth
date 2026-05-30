import { useState, useEffect, useRef } from 'react';
import { Mic, Square, FileText, Send, Share2, Check, Loader2, Volume2, Copy, Download } from 'lucide-react';

export default function VoiceSymptomChecker({ user }) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recognitionRef, setRecognitionRef] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState(user?.phone || '');
  const [recordingHistory, setRecordingHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [voiceRecordingTime, setVoiceRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Voice recognition started');
        setVoiceRecordingTime(0);
        recordingTimerRef.current = setInterval(() => {
          setVoiceRecordingTime(prev => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event) => {
        let totalTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setLiveTranscript(totalTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      setRecognitionRef(recognition);
    } else {
      console.warn('Speech Recognition API not supported');
    }

    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (recognitionRef) {
        recognitionRef.abort();
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    } else {
      // Start recording
      setIsRecording(true);
      setLiveTranscript('');
      setAiReport(null);
      setShareSuccess(false);
      setShareMessage('');
      if (recognitionRef) {
        try {
          recognitionRef.start();
        } catch (e) {
          console.error('Error starting recognition:', e);
          setIsRecording(false);
        }
      }
    }
  };

  const generateAIReport = async () => {
    if (!liveTranscript.trim()) {
      alert('Please record some symptoms first');
      return;
    }

    setIsGenerating(true);
    setAiReport(null);

    try {
      const response = await fetch('http://localhost:5001/voice_symptom_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          voiceTranscript: liveTranscript,
          symptoms: liveTranscript.split(/[.,;]/).filter(s => s.trim())
        })
      });

      const data = await response.json();

      if (response.ok && data.aiReport) {
        setAiReport(data.aiReport);
        setAiReport({
          ...data.aiReport,
          urgency_level: data.urgency_level,
          dispatch_department: data.dispatch_department,
          voiceTranscript: liveTranscript,
          reportGeneratedAt: new Date().toLocaleString()
        });

        // Add to history
        setRecordingHistory(prev => [{
          id: Date.now(),
          transcript: liveTranscript,
          report: data.aiReport,
          urgency_level: data.urgency_level,
          dispatch_department: data.dispatch_department,
          timestamp: new Date().toLocaleString()
        }, ...prev]);
      } else {
        alert('Failed to generate report: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating AI report');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendViaWhatsApp = async () => {
    if (!aiReport || !whatsappPhone) {
      alert('Please generate a report and enter a phone number');
      return;
    }

    const normalizedPhone = whatsappPhone.trim();
    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      alert('Enter your WhatsApp number with country code, for example +919876543210');
      return;
    }

    setIsSharing(true);
    setShareSuccess(false);
    setShareMessage('');

    try {
      const response = await fetch('http://localhost:5001/send_voice_report_whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          aiReport: aiReport,
          voiceTranscript: aiReport.voiceTranscript || liveTranscript,
          phone: normalizedPhone,
          urgencyLevel: aiReport.urgency_level,
          dispatchDepartment: aiReport.dispatch_department
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShareSuccess(true);
        setShareMessage(data.message || 'Report sent to WhatsApp successfully.');
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        const details = data.details ? `\n\nTwilio details: ${data.details}` : '';
        const help = data.sandboxHelp ? `\n\n${data.sandboxHelp}` : '';
        alert('Failed to send WhatsApp report: ' + (data.error || 'Unknown error') + details + help);
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      alert('Error sending WhatsApp report');
    } finally {
      setIsSharing(false);
    }
  };

  const startNewSymptoms = () => {
    if (isRecording && recognitionRef) {
      recognitionRef.abort();
    }
    setIsRecording(false);
    setLiveTranscript('');
    setAiReport(null);
    setShareSuccess(false);
    setShareMessage('');
    setVoiceRecordingTime(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const renderList = (items, fallback) => {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!list.length) {
      return <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{fallback}</p>;
    }

    return (
      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  };

  const reportSectionStyle = {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)'
  };

  const reportLabelStyle = {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: 800,
    marginBottom: '6px',
    textTransform: 'uppercase'
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="hero-widget" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>🎤 Voice Symptom Checker</h2>
          <p style={{ maxWidth: '600px', opacity: 0.9, fontSize: '14px', lineHeight: '1.5' }}>
            Describe your symptoms using your voice. AI will analyze and generate a comprehensive medical report that you can share via WhatsApp.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Voice Recording */}
        <div className="card glass-panel" style={{ padding: '24px', borderLeft: '5px solid #FF6B6B' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic size={20} color="#FF6B6B" /> Voice Recording
          </h3>

          {/* Recording Status */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '16px',
            backgroundColor: isRecording ? 'rgba(255, 107, 107, 0.1)' : 'rgba(100, 200, 100, 0.1)',
            border: `2px solid ${isRecording ? '#FF6B6B' : '#64C864'}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
              STATUS: {isRecording ? 'RECORDING' : 'READY'}
            </div>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              color: isRecording ? '#FF6B6B' : '#64C864',
              animation: isRecording ? 'pulse 1s infinite' : 'none'
            }}>
              {isRecording ? `${formatTime(voiceRecordingTime)}` : '0:00'}
            </div>
          </div>

          {/* Live Transcript Display */}
          <div style={{
            minHeight: '100px',
            maxHeight: '150px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color)',
            marginBottom: '16px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.6',
            color: liveTranscript ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontStyle: liveTranscript ? 'normal' : 'italic'
          }}>
            {liveTranscript || 'Your voice will appear here...'}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={toggleRecording}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isRecording ? '#FF6B6B' : 'var(--primary-color)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isRecording ? (
                <>
                  <Square size={18} /> Stop Recording
                </>
              ) : (
                <>
                  <Mic size={18} /> Start Recording
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: AI Report */}
        <div className="card glass-panel" style={{ padding: '24px', borderLeft: '5px solid #4A90E2' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#4A90E2" /> AI Medical Report
          </h3>

          {!aiReport ? (
            <div style={{
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                Record your symptoms and click "Generate Report" to create an AI analysis
              </p>
              <button
                onClick={generateAIReport}
                disabled={!liveTranscript.trim() || isGenerating}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  backgroundColor: (!liveTranscript.trim() || isGenerating) ? 'var(--text-secondary)' : 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  cursor: (!liveTranscript.trim() || isGenerating) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: (!liveTranscript.trim() || isGenerating) ? 0.5 : 1
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Generate Report
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Report Content */}
              <div style={{
                backgroundColor: 'rgba(74, 144, 226, 0.05)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(74, 144, 226, 0.2)'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4A90E2' }}>
                  {aiReport.report_title || 'Voice Symptom Assessment Report'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={reportSectionStyle}>
                    <span style={reportLabelStyle}>Patient Description</span>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {aiReport.patient_description || aiReport.voiceTranscript || liveTranscript}
                    </p>
                  </div>
                  <div style={reportSectionStyle}>
                    <span style={reportLabelStyle}>AI Assessment</span>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {aiReport.ai_assessment || 'Professional assessment pending.'}
                    </p>
                  </div>
                  <div style={reportSectionStyle}>
                    <span style={reportLabelStyle}>Clinical Flags</span>
                    {renderList(aiReport.clinical_flags, 'No red flags detected from this voice note.')}
                  </div>
                  <div style={reportSectionStyle}>
                    <span style={reportLabelStyle}>Recommendations</span>
                    {renderList(aiReport.recommendations, 'Please contact your healthcare provider for evaluation.')}
                  </div>
                  <div style={reportSectionStyle}>
                    <span style={reportLabelStyle}>Follow Up</span>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {aiReport.follow_up || 'Contact your healthcare provider for further guidance.'}
                    </p>
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  marginTop: '12px'
                }}>
                  <strong style={{ color: 'var(--primary-color)' }}>Urgency Level:</strong> {aiReport.urgency_level}/5
                  <br />
                  <strong style={{ color: 'var(--primary-color)' }}>Department:</strong> {aiReport.dispatch_department}
                  <br />
                  <strong style={{ color: 'var(--primary-color)' }}>Summary:</strong> {aiReport.urgency_summary || 'Review recommended'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={startNewSymptoms}
                  style={{
                    padding: '11px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Mic size={16} /> New Symptoms
                </button>
                <button
                  onClick={generateAIReport}
                  disabled={!liveTranscript.trim() || isGenerating}
                  style={{
                    padding: '11px',
                    borderRadius: '8px',
                    backgroundColor: (!liveTranscript.trim() || isGenerating) ? 'var(--text-secondary)' : 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    cursor: (!liveTranscript.trim() || isGenerating) ? 'not-allowed' : 'pointer',
                    opacity: (!liveTranscript.trim() || isGenerating) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : <><Send size={16} /> Update Report</>}
                </button>
              </div>

              {/* WhatsApp Phone Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+919876543210"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Use the same WhatsApp number that joined the Twilio sandbox.
                </p>
              </div>

              {/* Share Button */}
              <button
                onClick={sendViaWhatsApp}
                disabled={isSharing}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: shareSuccess ? 'var(--success-color)' : 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: isSharing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isSharing ? 0.6 : 1
                }}
              >
                {shareSuccess ? (
                  <>
                    <Check size={18} /> Report Sent!
                  </>
                ) : isSharing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Share2 size={18} /> Send via WhatsApp
                  </>
                )}
              </button>
              {shareMessage && (
                <div style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 200, 100, 0.3)',
                  backgroundColor: 'rgba(100, 200, 100, 0.1)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  lineHeight: 1.5
                }}>
                  {shareMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recording History */}
      {recordingHistory.length > 0 && (
        <div className="card glass-panel" style={{ marginTop: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>📋 Recording History</h3>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {recordingHistory.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedHistory(selectedHistory?.id === item.id ? null : item)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: selectedHistory?.id === item.id ? 'rgba(74, 144, 226, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${selectedHistory?.id === item.id ? 'rgba(74, 144, 226, 0.3)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {item.timestamp}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {item.transcript.substring(0, 60)}...
                </div>
                {selectedHistory?.id === item.id && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <strong>Urgency:</strong> {item.urgency_level}/5 | <strong>Department:</strong> {item.dispatch_department}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
