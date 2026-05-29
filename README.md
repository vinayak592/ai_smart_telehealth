# Aura Health Telehealth Platform

Aura Health is a high-fidelity, unified AI-powered telehealth platform designed to deliver secure Patient, Provider (Doctor), and Administrator portal workflows. It features live optical telemetry simulators, automatic HIPAA compliance audit logging, interactive Clinical Decision Support (CDS) biometrics checkers, and full SOAP note summaries.

---

## 🛠️ Technology Stack
* **Frontend:** React + Vite + CSS Variables (Dark/Light mode).
* **Backend:** Express + Node.js with built-in in-memory fallback store (no hard DB dependency to start testing!).
* **Database (Optional):** MongoDB Atlas support.
* **Integrations:** OpenAI API (for real-time triage routing) & Twilio WhatsApp notifications.

---

## 🚀 Local Execution
To install all dependencies (root, backend, and frontend) and launch both developer servers concurrently:

```bash
# Install all dependencies across all directories
npm install
npm run install-backend
npm run install-frontend

# Run both servers concurrently
npm start
```
* **Frontend Server:** http://localhost:5173
* **Backend API Server:** http://localhost:5001

---

## 🌐 Seamless Render Deployment (Consolidated)
The repository is equipped with a `render.yaml` infrastructure configuration, which deploys the frontend and backend as a **single, unified Render Web Service**. This cuts deployment costs in half and resolves any CORS connection issues out of the box by serving the compiled React build directly from the Express server.

### 📝 Step-by-Step Deployment:
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect this GitHub repository.
4. Render will read the `render.yaml` configuration automatically.
5. Provide your configuration environment variables when prompted:
   * `MONGO_URI`: Your MongoDB connection string.
   * `JWT_SECRET`: A secure, secret string for authorization tokens.
   * `OPENAI_API_KEY`: (Optional) OpenAI API Key for symptom triage.
   * `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`: (Optional) Credentials to enable WhatsApp notifications.
6. Click **Deploy**!
