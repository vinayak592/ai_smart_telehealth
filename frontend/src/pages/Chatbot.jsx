import { useState, useRef, useEffect } from 'react';
import { Send, Activity, User, Bot, AlertCircle } from 'lucide-react';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am Aura, your AI health assistant. How are you feeling today?", sender: "ai" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biofeedback, setBiofeedback] = useState({ emotion: 'Neutral', confidence: 100, color: 'var(--success-color)' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeEmotion = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('pain') || lower.includes('hurt') || lower.includes('severe')) {
      return { emotion: 'Distressed', confidence: 85, color: 'var(--danger-color)' };
    }
    if (lower.includes('anxious') || lower.includes('worried') || lower.includes('scared')) {
      return { emotion: 'Anxious', confidence: 78, color: 'var(--warning-color)' };
    }
    return { emotion: 'Neutral', confidence: 90, color: 'var(--success-color)' };
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const detectedEmotion = analyzeEmotion(input);
    setBiofeedback(detectedEmotion);

    // Call the actual telehealth backend
    try {
      const response = await fetch('http://localhost:5001/triage_symptoms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ symptoms: input })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        let aiResponseText = `Based on my analysis, your symptoms suggest a **Level ${data.urgency_level}** urgency. `;
        aiResponseText += `I recommend directing this to **${data.dispatch_department}**. `;
        
        if (data.suggested_questions && data.suggested_questions.length > 0) {
          aiResponseText += `\n\nTo help further, could you answer: ${data.suggested_questions[0]}`;
        }

        setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponseText, sender: "ai" }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: data.error || "I'm having trouble analyzing your symptoms.", sender: "ai" }]);
      }
      
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having trouble connecting to the medical server right now.", sender: "ai" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
      {/* Chat Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px' }}>AI Medical Triage</h3>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Powered by Gemini</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              gap: '12px',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              maxWidth: '80%'
            }}>
              <div className="avatar" style={{ 
                backgroundColor: msg.sender === 'user' ? 'var(--secondary-color)' : 'var(--primary-color)',
                width: '32px', height: '32px', fontSize: '14px' 
              }}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div style={{
                backgroundColor: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--bg-color)',
                color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div className="avatar" style={{ backgroundColor: 'var(--primary-color)', width: '32px', height: '32px' }}>
                <Bot size={16} />
              </div>
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '12px 16px', borderRadius: '16px' }}>
                <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'blink 1.4s infinite both' }}></span>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'blink 1.4s infinite both 0.2s' }}></span>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'blink 1.4s infinite both 0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ padding: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms..."
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <button type="submit" disabled={!input.trim() || isLoading} style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            padding: '0 24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!input.trim() || isLoading) ? 0.5 : 1
          }}>
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Biofeedback Sidebar */}
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 600 }}>
            <Activity color="var(--primary-color)" />
            Real-time Biofeedback
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Detected State</div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '6px 12px', 
                backgroundColor: `${biofeedback.color}15`, 
                color: biofeedback.color,
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: biofeedback.color }}></span>
                {biofeedback.emotion}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>AI Empathy Engine</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                {biofeedback.emotion === 'Neutral' ? 'Active Listening Mode' : 'High Support Mode Active'}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ backgroundColor: 'rgba(250, 77, 86, 0.05)', borderColor: 'rgba(250, 77, 86, 0.2)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--danger-color)' }}>
            <AlertCircle size={18} />
            Clinical Red Flags
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            The AI continuously monitors your text for critical red flags like chest pain or breathing difficulties to immediately route you to human emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}
