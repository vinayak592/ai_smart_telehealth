# 🎤 Voice Symptom Checker - Implementation Guide

## Overview
The Voice Symptom Checker is a fully integrated AI-powered telehealth feature that enables patients to:
- Record symptoms using their voice/microphone
- Generate professional AI medical reports using Gemini API
- Send comprehensive reports directly via WhatsApp using Twilio

---

## 🚀 Quick Start

### For Development Testing

1. **Start the Backend**
   ```bash
   cd telehealth-backend
   npm install
   npm start
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access the Feature**
   - Login to patient portal
   - Navigate to "Voice Symptom Check" in sidebar
   - Allow microphone access when prompted

---

## 📋 Features

### 1. **Voice Recording**
- Uses Web Speech API (native browser API)
- Real-time transcription display
- Recording timer
- Stop recording at any time
- Full transcript visible during recording

### 2. **AI Report Generation**
- Sends voice transcript to backend
- Gemini API analyzes symptoms
- Generates structured clinical report including:
  - **Report Title**: Automated clinical summary
  - **Patient Description**: Voice-to-text symptom description
  - **AI Assessment**: Professional medical analysis
  - **Clinical Flags**: Any red flags detected
  - **Recommendations**: Suggested departments and actions
  - **Follow-up Instructions**: Next steps for patient
  - **Urgency Level**: 1-5 scale (1=non-urgent, 5=emergency)

### 3. **WhatsApp Integration**
- Enter recipient phone number (+format)
- Send complete AI report via WhatsApp
- Uses Twilio API for real messaging (or mock mode)
- Professional formatting for WhatsApp display

### 4. **Recording History**
- Keeps track of all voice recordings
- Shows timestamp and transcript preview
- Quick access to previous reports
- Collapsible history panel

---

## 🔧 Backend Endpoints

### POST `/voice_symptom_report`
**Generate AI report from voice input**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "voiceTranscript": "I have been experiencing chest pain for 3 days...",
  "symptoms": ["chest pain", "shortness of breath"]
}
```

**Response:**
```json
{
  "success": true,
  "symptomId": "...",
  "voiceTranscript": "...",
  "triageResult": {
    "specialty": "cardiology",
    "urgency_level": 4,
    "dispatch_department": "Cardiology",
    "suggested_questions": ["When did this start?", "Is it sharp or dull?"]
  },
  "aiReport": {
    "report_title": "Acute Chest Pain - Cardiology Referral",
    "patient_description": "Patient reports acute chest pain...",
    "ai_assessment": "Professional medical assessment...",
    "clinical_flags": ["High urgency", "Potential cardiac involvement"],
    "recommendations": ["Immediate cardiology consultation", "ECG recommended"],
    "follow_up": "Seek emergency care if symptoms worsen",
    "urgency_summary": "Urgency Level 4/5: Cardiology"
  },
  "report_ready_for_whatsapp": true
}
```

### POST `/send_voice_report_whatsapp`
**Send AI report via WhatsApp**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "aiReport": { /* report object from above */ },
  "voiceTranscript": "...",
  "phone": "+1234567890",
  "urgencyLevel": 4,
  "dispatchDepartment": "Cardiology"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voice report sent to WhatsApp successfully!",
  "sid": "SM1234567890..." // Twilio message SID
}
```

---

## 🛠️ Configuration

### Required Environment Variables

**In `telehealth-backend/.env`:**

```env
# Gemini AI API (for report generation)
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-pro

# Twilio (for WhatsApp integration)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Getting API Keys

**Gemini API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project
3. Enable "Generative AI API"
4. Create API key for "Other (non-web application)"
5. Add to `.env` as `GEMINI_API_KEY`

**Twilio WhatsApp:**
1. Create account at [Twilio.com](https://www.twilio.com)
2. Get WhatsApp-enabled number
3. Get Account SID and Auth Token from dashboard
4. Set sandbox or connect to WhatsApp Business Account

---

## 📱 Frontend Component Structure

### File: `frontend/src/pages/VoiceSymptomChecker.jsx`

**Key Functions:**
- `toggleRecording()` - Start/stop voice capture
- `generateAIReport()` - Send transcript to backend for AI analysis
- `sendViaWhatsApp()` - Send report via Twilio
- `formatTime()` - Display recording duration

**State Variables:**
- `isRecording` - Recording active/inactive
- `liveTranscript` - Current voice text
- `aiReport` - Generated report data
- `whatsappPhone` - Recipient phone number
- `recordingHistory` - Previous recordings

---

## 🔐 Security Features

### Implemented
- ✅ JWT Token verification on all endpoints
- ✅ PII (Personally Identifiable Information) masking middleware
- ✅ HIPAA compliance audit logging
- ✅ User ID enforcement (can't access others' data)
- ✅ Phone number validation for WhatsApp

### Best Practices
- Never store raw medical data without encryption
- All WhatsApp messages are logged for audit
- Reports are tied to authenticated user ID
- All API calls require valid JWT token

---

## 🧪 Testing Scenarios

### Test Case 1: Basic Voice Recording
```
Steps:
1. Click "Start Recording"
2. Say: "I have a fever and cough for 2 days"
3. Click "Stop Recording"
4. Verify transcript appears correctly
Expected: Transcript should show your symptoms
```

### Test Case 2: AI Report Generation
```
Steps:
1. Record symptoms (from Test 1)
2. Click "Generate Report"
3. Wait for AI processing
4. Verify report displays with title, assessment, flags
Expected: Professional medical report appears with urgency level
```

### Test Case 3: WhatsApp Sharing
```
Steps:
1. Generate report (from Test 2)
2. Enter valid phone: +1234567890
3. Click "Send via WhatsApp"
4. Wait for success message
Expected: Success message appears, report formatted for WhatsApp
```

---

## 🚨 Troubleshooting

### Issue: "Microphone not working"
**Solution:**
- Check browser microphone permissions
- Ensure website has microphone access
- Try Chrome, Edge, or Firefox (Firefox requires HTTPS)
- Check if another app is using microphone

### Issue: "Gemini API Error"
**Solution:**
- Verify `GEMINI_API_KEY` in `.env`
- Ensure Generative AI API is enabled in Google Cloud
- Check API key permissions
- Verify API key hasn't been revoked

### Issue: "WhatsApp message not sending"
**Solution:**
- Verify Twilio credentials in `.env`
- Ensure phone number is valid (+country code format)
- Check Twilio account balance
- Verify WhatsApp Business Account is linked

### Issue: "No transcript appearing"
**Solution:**
- Check browser console for errors (F12)
- Speak clearly and close to microphone
- Ensure speech recognition is enabled
- Try refreshing the page and recording again

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│  Patient Speaks     │
│  Symptoms into Mic  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  Web Speech API             │
│  Voice → Text Conversion    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  /voice_symptom_report      │
│  Backend Endpoint           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Gemini AI API              │
│  Analyze & Generate Report  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Structured JSON Report     │
│  Displayed to Patient       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  /send_voice_report_whatsapp│
│  Twilio WhatsApp Integration│
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  WhatsApp Message Sent      │
│  to Patient/Healthcare Team │
└─────────────────────────────┘
```

---

## 🎯 Next Steps / Enhancements

Potential future improvements:
- [ ] Multi-language support for voice recognition
- [ ] Audio file upload (not just live recording)
- [ ] PDF export of reports
- [ ] Email integration
- [ ] SMS integration
- [ ] Advanced sentiment analysis
- [ ] Voice clarity scoring
- [ ] Integration with EHR systems
- [ ] Real-time doctor notifications
- [ ] Report signing and verification

---

## 📝 API Reference Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/voice_symptom_report` | POST | Generate AI report from voice |
| `/send_voice_report_whatsapp` | POST | Send report via WhatsApp |
| `/clinical_notes` | POST/GET | Store clinical notes |
| `/triage_symptoms` | POST | General symptom triage |

---

## 💡 Key Technologies Used

- **Frontend**: React, Web Speech API, Lucide Icons
- **Backend**: Node.js/Express, Gemini API, Twilio SDK
- **Database**: MongoDB (stores voice records)
- **Authentication**: JWT Tokens
- **AI Analysis**: Google Gemini 1.5 Pro

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review browser console (F12 → Console tab)
3. Check backend logs in terminal
4. Verify all environment variables are set
5. Test with mock mode if APIs unavailable

---

**Last Updated**: May 30, 2026
**Version**: 1.0
**Status**: ✅ Production Ready
