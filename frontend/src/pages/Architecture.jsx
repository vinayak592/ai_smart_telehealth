import React from 'react';
import { Server, Database, BrainCircuit, Globe, Code, Shield, Smartphone } from 'lucide-react';

export default function Architecture() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(15, 98, 254, 0.1)', 
          color: 'var(--primary-color)', marginBottom: '16px' 
        }}>
          <Code size={40} />
        </div>
        <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>System Architecture & Technologies</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          An overview of the advanced technologies and design patterns utilized to build the Aura AI Telehealth Platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Frontend Section */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Globe color="var(--primary-color)" size={28} />
            <h3 style={{ fontSize: '20px', margin: 0 }}>Frontend: React.js & Vite</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            The user interface is built using modern <strong>React</strong> and bundled with <strong>Vite</strong> for blazing-fast HMR and optimized production builds. 
            The UI employs a custom, highly responsive CSS design system inspired by IBM Carbon and Material Design, entirely utilizing vanilla CSS variables for a seamless dark/light mode transition.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#e1f5fe', color: '#0277bd', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>React Hooks</span>
            <span className="badge" style={{ background: '#e1f5fe', color: '#0277bd', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>Recharts</span>
            <span className="badge" style={{ background: '#e1f5fe', color: '#0277bd', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>Lucide Icons</span>
          </div>
        </div>

        {/* Backend Section */}
        <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Server color="var(--success-color)" size={28} />
            <h3 style={{ fontSize: '20px', margin: 0 }}>Backend: Node.js & Express REST API</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            The server architecture leverages <strong>Node.js</strong> and <strong>Express</strong> to create a robust, scalable RESTful API. 
            It handles secure JWT-based authentication, password hashing with bcrypt, and acts as the secure middleware between the client and our AI models.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>Express.js</span>
            <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>JWT Auth</span>
            <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>PII Masking</span>
          </div>
        </div>

        {/* Database Section */}
        <div className="card" style={{ borderLeft: '4px solid var(--warning-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Database color="var(--warning-color)" size={28} />
            <h3 style={{ fontSize: '20px', margin: 0 }}>Database: MongoDB Atlas</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            Persistent data storage is powered by <strong>MongoDB Atlas</strong>, a fully managed cloud NoSQL database. 
            We utilize <strong>Mongoose</strong> schemas to enforce strict data modeling for Users, Appointments, Clinical Notes, and Vitals.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#fff8e1', color: '#f57f17', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>NoSQL</span>
            <span className="badge" style={{ background: '#fff8e1', color: '#f57f17', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>Mongoose ODM</span>
          </div>
        </div>

        {/* AI & 3rd Party Section */}
        <div className="card" style={{ borderLeft: '4px solid var(--secondary-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <BrainCircuit color="var(--secondary-color)" size={28} />
            <h3 style={{ fontSize: '20px', margin: 0 }}>AI & Third-Party Integrations</h3>
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            This platform integrates cutting-edge technologies to simulate a next-generation hospital:
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong>OpenAI GPT-3.5 API:</strong> Powers the dynamic symptom triage, classifying urgency and specialties.</li>
              <li style={{ marginBottom: '8px' }}><strong>Web Speech API:</strong> Native browser-level Speech-to-Text conversion for the Clinical Scribe.</li>
              <li style={{ marginBottom: '8px' }}><strong>WhatsApp Mock Service:</strong> Demonstrates omni-channel report sharing functionality (Twilio-ready).</li>
            </ul>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#f3e5f5', color: '#6a1b9a', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>OpenAI</span>
            <span className="badge" style={{ background: '#f3e5f5', color: '#6a1b9a', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>Web Speech API</span>
            <span className="badge" style={{ background: '#f3e5f5', color: '#6a1b9a', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>Twilio Mock</span>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', padding: '32px', backgroundColor: 'var(--surface-hover)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Developed By Keerti</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          This application was built as a comprehensive full-stack portfolio piece, demonstrating expertise in React, Node.js, MongoDB, and AI API integrations.
        </p>
      </div>

    </div>
  );
}
