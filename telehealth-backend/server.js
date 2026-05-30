const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { piiMiddleware } = require('./piiMasker');
const twilio = require('twilio');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const clearBrokenLocalProxy = () => {
  const proxyEnvNames = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy'];
  proxyEnvNames.forEach((name) => {
    if (process.env[name] && /^http:\/\/127\.0\.0\.1:9\/?$/i.test(process.env[name])) {
      delete process.env[name];
    }
  });
};

clearBrokenLocalProxy();

const formatIndiaDateTime = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  }).format(date);
};

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files in production (must be before API routes)
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const expectedDistPath = path.join(__dirname, '../frontend/dist'); // This is the most likely path on Render

  console.log('--- Production Static File Debugging ---');
  console.log('Current working directory:', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('Expected dist path:', expectedDistPath);

  if (fs.existsSync(expectedDistPath)) {
    console.log('Dist folder found at:', expectedDistPath);
    console.log('Files in dist:', fs.readdirSync(expectedDistPath));
    app.use(express.static(expectedDistPath));
    console.log('Static middleware configured for:', expectedDistPath);

    app.get('*', (req, res) => { // Catch all routes for client-side routing
      const indexPath = path.join(expectedDistPath, 'index.html');
      console.log('Root/Catch-all route hit, serving:', indexPath);
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error('index.html not found at:', indexPath);
        res.status(404).send('Error: index.html not found');
      }
    });
  } else {
    console.error('Dist folder NOT found at:', expectedDistPath);
    console.error('Current directory contents:', fs.readdirSync(__dirname));
    console.error('Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));
    app.get('/', (req, res) => {
      res.status(500).send('Frontend not built or deployed correctly. Dist folder not found.');
    });
  }
  console.log('--- End Production Static File Debugging ---');
}

const createFallbackTriage = (symptomsText = '') => {
  const text = symptomsText.toLowerCase();
  const emergencyTerms = ['chest pain', 'shortness of breath', 'stroke', 'faint', 'seizure', 'severe bleeding'];
  const cardiologyTerms = ['chest', 'heart', 'palpitation', 'blood pressure'];
  const neurologyTerms = ['headache', 'dizzy', 'numb', 'weakness', 'confusion', 'seizure'];
  const dermatologyTerms = ['rash', 'skin', 'itch', 'swelling'];
  const orthopedicTerms = ['bone', 'joint', 'fracture', 'sprain', 'back pain'];

  if (emergencyTerms.some(term => text.includes(term))) {
    return {
      specialty: 'emergency_medicine',
      urgency_level: 5,
      suggested_questions: ['When did this start?', 'Are symptoms getting worse?', 'Do you have trouble breathing?'],
      dispatch_department: 'Emergency Room'
    };
  }

  if (cardiologyTerms.some(term => text.includes(term))) {
    return {
      specialty: 'cardiology',
      urgency_level: 4,
      suggested_questions: ['Do you have chest pain?', 'Do you feel short of breath?'],
      dispatch_department: 'Cardiology'
    };
  }

  if (neurologyTerms.some(term => text.includes(term))) {
    return {
      specialty: 'neurology',
      urgency_level: 3,
      suggested_questions: ['Do you have weakness or numbness?', 'When did the symptoms begin?'],
      dispatch_department: 'Neurology'
    };
  }

  if (dermatologyTerms.some(term => text.includes(term))) {
    return {
      specialty: 'dermatology',
      urgency_level: 2,
      suggested_questions: ['Is the rash spreading?', 'Do you have fever or swelling?'],
      dispatch_department: 'Dermatology'
    };
  }

  if (orthopedicTerms.some(term => text.includes(term))) {
    return {
      specialty: 'orthopedics',
      urgency_level: 3,
      suggested_questions: ['Can you move the affected area?', 'Was there an injury?'],
      dispatch_department: 'Orthopedics'
    };
  }

  return {
    specialty: 'general_medicine',
    urgency_level: 3,
    suggested_questions: ['When did this start?', 'Do you have a fever?'],
    dispatch_department: 'General Practice'
  };
};

const extractGeminiText = (data) => {
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map(part => part?.text || '').join('').trim();
  }
  if (Array.isArray(candidate?.content)) {
    return candidate.content
      .map(item => typeof item === 'string' ? item : item?.text || '')
      .join('')
      .trim();
  }
  return (candidate?.output_text || '').trim();
};

const parseJsonFromText = (content) => {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  }
};

const callGeminiJson = async (prompt, systemInstruction, temperature = 0.2) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature,
        topP: 0.95,
        responseMimeType: 'application/json'
      }
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const apiError = data?.error?.message || `Gemini API error: ${response.status}`;
    throw new Error(apiError);
  }

  const content = extractGeminiText(data);
  const parsed = parseJsonFromText(content);
  if (!parsed) {
    throw new Error(`Unable to parse LLM response as JSON: ${content || 'empty response'}`);
  }
  return parsed;
};

const triageSymptomsWithLLM = async (symptomsText) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    console.log('[Mock AI] Returning fallback triage due to missing GEMINI_API_KEY');
    return createFallbackTriage(symptomsText);
  }

  const prompt = `You are an automated medical triage and routing agent. Analyze the patient's symptoms and return only valid JSON with these keys: ` +
    `'specialty', 'urgency_level', 'suggested_questions', and 'dispatch_department'. ` +
    `Do not include any extra text. ` +
    `Use urgency_level as an integer from 1 (non-urgent) to 5 (emergency). ` +
    `'dispatch_department' must be one of: 'Cardiology', 'Orthopedics', 'General Practice', 'Neurology', 'Dermatology', or 'Emergency Room'. ` +
    `Example response format: {"specialty":"cardiology","urgency_level":3,"suggested_questions":["When did this start?","Do you have chest pain?"], "dispatch_department": "Cardiology"}. ` +
    `Patient symptoms: ${symptomsText}`;

  try {
    return await callGeminiJson(prompt, 'You are a helpful medical triage assistant.', 0.2);
  } catch (error) {
    console.warn('[AI Triage] Gemini failed, using fallback triage:', error.message);
    return createFallbackTriage(symptomsText);
  }
};

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  dob: { type: String, default: '1990-01-01' },
  address: { type: String, default: '123 Health Ave, Wellness City, CA 90210' },
  bloodType: { type: String, default: 'O+' },
  allergies: { type: String, default: 'None' },
  insurance: { type: String, default: 'Blue Cross Blue Shield' },
  policyNumber: { type: String, default: 'BCBS-123456789' },
  emergencyContact: { type: String, default: 'None' }
});

const symptomSchema = new mongoose.Schema({
  userId: String,
  description: String,
  extractedSymptoms: [String],
  predictedDisease: String,
  urgencyLevel: Number,
  dispatchDepartment: String,
  suggestedQuestions: [String],
  aiReport: mongoose.Schema.Types.Mixed,
  status: { type: String, default: 'Pending Review' },
  date: { type: Date, default: Date.now },
});

const billSchema = new mongoose.Schema({
  userId: String,
  items: [{ name: String, qty: Number, price: Number }],
  total: Number,
  date: { type: Date, default: Date.now },
});

const achievementSchema = new mongoose.Schema({
  userId: String,
  title: String,
  description: String,
  isComplete: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

const appointmentSchema = new mongoose.Schema({
  userId: String,
  doctor: String,
  type: String,
  date: String,
  time: String,
  mode: String,
  location: String,
});

const medicationSchema = new mongoose.Schema({
  userId: String,
  name: String,
  dosage: String,
  schedule: String,
  status: String,
});

const clinicalNoteSchema = new mongoose.Schema({
  userId: String,
  title: String,
  summary: String,
  date: String,
});

const arScanSchema = new mongoose.Schema({
  userId: String,
  scanType: String,
  metrics: Object,
  clinicalAssessment: String,
  date: { type: Date, default: Date.now }
});

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: String,
  userName: { type: String, default: 'System Agent' },
  role: { type: String, default: 'Patient' },
  action: String,
  details: String,
  ipAddress: { type: String, default: '127.0.0.1' },
  status: { type: String, default: 'SUCCESS' }
});

// Let-bindings to support dynamic mock swapping
let User = mongoose.model('User', userSchema);
let Symptom = mongoose.model('Symptom', symptomSchema);
let Bill = mongoose.model('Bill', billSchema);
let Achievement = mongoose.model('Achievement', achievementSchema);
let Appointment = mongoose.model('Appointment', appointmentSchema);
let Medication = mongoose.model('Medication', medicationSchema);
let ClinicalNote = mongoose.model('ClinicalNote', clinicalNoteSchema);
let ArScan = mongoose.model('ArScan', arScanSchema);
let AuditLog = mongoose.model('AuditLog', auditLogSchema);

// In-Memory Database Fallback Store
const inMemoryStore = {
  users: [],
  symptoms: [],
  bills: [],
  achievements: [],
  appointments: [],
  medications: [],
  clinicalNotes: [],
  arScans: [],
  auditLogs: []
};

class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort(sortSpec) {
    if (this.data && Array.isArray(this.data)) {
      this.data.sort((a, b) => {
        const aVal = a.date || a.timestamp || a._id;
        const bVal = b.date || b.timestamp || b._id;
        if (aVal < bVal) return (sortSpec.date === -1 || sortSpec.timestamp === -1 || sortSpec._id === -1) ? 1 : -1;
        if (aVal > bVal) return (sortSpec.date === -1 || sortSpec.timestamp === -1 || sortSpec._id === -1) ? -1 : 1;
        return 0;
      });
    }
    return this;
  }
  then(onResolve, onReject) {
    return Promise.resolve(this.data).then(onResolve, onReject);
  }
}

class MockModel {
  constructor(store) {
    this.store = store;
  }
  async create(data) {
    const record = {
      _id: new mongoose.Types.ObjectId().toString(),
      date: new Date(),
      timestamp: new Date(),
      createdAt: new Date(),
      ...data
    };
    this.store.push(record);
    return record;
  }
  find(filter = {}) {
    let results = [...this.store];
    Object.keys(filter).forEach(key => {
      if (key !== '-password') { // Ignore projection format strings
        results = results.filter(item => item[key] == filter[key]);
      }
    });
    return new MockQuery(results);
  }
  findOne(filter = {}) {
    let results = [...this.store];
    Object.keys(filter).forEach(key => {
      results = results.filter(item => item[key] == filter[key]);
    });
    return new MockQuery(results[0] || null);
  }
  findById(id) {
    const found = this.store.find(item => item._id == id || item.id == id);
    return new MockQuery(found || null);
  }
  findByIdAndUpdate(id, update) {
    const record = this.store.find(item => item._id == id || item.id == id);
    if (record) {
      Object.assign(record, update);
    }
    return new MockQuery(record || null);
  }
}

// Disable buffering to fail fast on DB operations if connection isn't ready
mongoose.set('bufferCommands', false);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000 // fail fast in 3 seconds
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB Atlas connection failed. Swapping to Local In-Memory Fallback.');
    User = new MockModel(inMemoryStore.users);
    Symptom = new MockModel(inMemoryStore.symptoms);
    Bill = new MockModel(inMemoryStore.bills);
    Achievement = new MockModel(inMemoryStore.achievements);
    Appointment = new MockModel(inMemoryStore.appointments);
    Medication = new MockModel(inMemoryStore.medications);
    ClinicalNote = new MockModel(inMemoryStore.clinicalNotes);
    ArScan = new MockModel(inMemoryStore.arScans);
    AuditLog = new MockModel(inMemoryStore.auditLogs);
  });

const logAuditAction = async (userId, userName, role, action, details) => {
  try {
    await AuditLog.create({
      userId: userId || '65f123456789abcdef012345',
      userName: userName || 'Demo User',
      role: role || 'patient',
      action,
      details,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Audit log write error:', err);
  }
};

const vitalRecordSchema = new mongoose.Schema({
  userId: String,
  heartRate: Number,
  oxygenLevel: Number,
  symptoms: String,
  result: Object,
  date: { type: Date, default: Date.now },
});
const VitalRecord = mongoose.model('VitalRecord', vitalRecordSchema);

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  if (token === 'mock-jwt-token') {
    req.user = { id: '65f123456789abcdef012345' };
    return next();
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/triage_symptoms', verifyToken, piiMiddleware, async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ error: 'Please provide a symptom description string.' });
    }

    const triageResult = await triageSymptomsWithLLM(symptoms);
    
    // Persist triage log into MongoDB
    const symptomRecord = await Symptom.create({
      userId: req.user.id,
      description: symptoms,
      urgencyLevel: Number(triageResult.urgency_level) || 3,
      dispatchDepartment: triageResult.dispatch_department || 'General Practice',
      suggestedQuestions: Array.isArray(triageResult.suggested_questions)
        ? triageResult.suggested_questions
        : [String(triageResult.suggested_questions || 'Could you clarify more details?')],
      status: 'Pending Review'
    });

    // Write HIPAA Compliance Audit Log
    let patientName = 'Demo Patient';
    try {
      const u = await User.findById(req.user.id);
      if (u) patientName = u.name;
    } catch (e) {}

    await logAuditAction(
      req.user.id,
      patientName,
      'patient',
      'AI_TRIAGE_CHECK',
      `Submitted symptoms for AI Triage check. Classified: Level ${triageResult.urgency_level || 3} (${triageResult.dispatch_department || 'General Practice'})`
    );

    return res.json({
      _id: symptomRecord._id,
      specialty: triageResult.specialty || 'general_medicine',
      urgency_level: Number(triageResult.urgency_level) || 3,
      dispatch_department: triageResult.dispatch_department || 'General Practice',
      suggested_questions: symptomRecord.suggestedQuestions,
    });
  } catch (err) {
    console.error('Symptom triage failed:', err.message || err);
    res.status(500).json({ error: 'Symptom triage failed', details: err.message });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, phone, password, dob } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      dob: dob || '1990-01-01'
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Log Audit
    await logAuditAction(user._id, user.name, 'patient', 'USER_REGISTERED', `New account registered with email ${email}`);
    
    const userToSend = user.toObject ? user.toObject() : { ...user };
    delete userToSend.password;
    res.json({ token, ...userToSend });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    // Log Audit
    const inferredRole = email.toLowerCase().includes('doctor') || email.toLowerCase().includes('provider') || email.toLowerCase().includes('admin') ? 'doctor' : 'patient';
    await logAuditAction(user._id, user.name, inferredRole, 'USER_LOGIN', `Successfully logged in with email ${email}`);
    
    const userToSend = user.toObject ? user.toObject() : { ...user };
    delete userToSend.password;
    res.json({ token, ...userToSend });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.put('/profile', verifyToken, async (req, res) => {
  try {
    const updateData = req.body;
    delete updateData.password;
    delete updateData.email;

    if (mongoose.connection.readyState === 1 && typeof User.findByIdAndUpdate === 'function' && !(User instanceof MockModel)) {
      const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
      if (!updated) return res.status(404).json({ error: 'User not found' });
      const userToSend = updated.toObject ? updated.toObject() : { ...updated };
      delete userToSend.password;
      res.json(userToSend);
    } else {
      // In-Memory Fallback
      const user = inMemoryStore.users.find(u => u._id == req.user.id);
      if (user) {
        Object.assign(user, updateData);
        const userToSend = { ...user };
        delete userToSend.password;
        res.json(userToSend);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (err) {
    console.error('Failed to update profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/profile', verifyToken, async (req, res) => {
  try {
    let user;
    if (mongoose.connection.readyState === 1 && typeof User.findById === 'function' && !(User instanceof MockModel)) {
      user = await User.findById(req.user.id);
    } else {
      user = inMemoryStore.users.find(u => u._id == req.user.id);
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userToSend = user.toObject ? user.toObject() : { ...user };
    delete userToSend.password;
    res.json(userToSend);
  } catch (err) {
    console.error('Failed to get profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

app.post('/analyze_symptoms', verifyToken, async (req, res) => {
  const { description, extractedSymptoms, predictedDisease } = req.body;
  const symptom = await Symptom.create({
    userId: req.user.id,
    description,
    extractedSymptoms,
    predictedDisease,
  });
  res.json(symptom);
});

app.get('/symptoms', verifyToken, async (req, res) => {
  const symptoms = await Symptom.find({ userId: req.user.id });
  res.json(symptoms);
});

app.post('/save-bill', verifyToken, async (req, res) => {
  const { items, total } = req.body;
  const bill = await Bill.create({ userId: req.user.id, items, total });
  res.json({ message: 'Bill saved', bill });
});

app.get('/bills', verifyToken, async (req, res) => {
  const bills = await Bill.find({ userId: req.user.id });
  res.json(bills);
});

app.post('/save-achievement', verifyToken, async (req, res) => {
  const { title, description, isComplete } = req.body;
  const achievement = await Achievement.create({ userId: req.user.id, title, description, isComplete });
  res.json({ message: 'Achievement saved', achievement });
});

app.get('/achievements', verifyToken, async (req, res) => {
  const achievements = await Achievement.find({ userId: req.user.id });
  res.json(achievements);
});

// Appointments
app.post('/appointments', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, userId: req.user.id });
    res.json(appointment);
  } catch (err) { res.status(500).json({ error: 'Failed to create appointment' }); }
});

app.get('/appointments', verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id });
    res.json(appointments);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch appointments' }); }
});

// Medications
app.post('/medications', verifyToken, async (req, res) => {
  try {
    const medication = await Medication.create({ ...req.body, userId: req.user.id });
    res.json(medication);
  } catch (err) { res.status(500).json({ error: 'Failed to add medication' }); }
});

app.get('/medications', verifyToken, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id });
    res.json(medications);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch medications' }); }
});

app.post('/parse_medication_label', verifyToken, async (req, res) => {
  try {
    const { labelImage } = req.body;
    if (!labelImage) {
      return res.status(400).json({ error: 'No image provided for OCR' });
    }

    // List of simulated drugs we can parse randomly
    const sampleLabels = [
      { name: 'Ibuprofen', dosage: '400mg', schedule: 'Take 1 tablet every 6 hours as needed for pain', defaultStatus: 'Active' },
      { name: 'Lisinopril', dosage: '10mg', schedule: 'Take 1 tablet by mouth daily', defaultStatus: 'Active' },
      { name: 'Metformin', dosage: '500mg', schedule: 'Take 1 tablet twice daily with meals', defaultStatus: 'Active' },
      { name: 'Amoxicillin', dosage: '500mg', schedule: 'Take 1 capsule three times daily for 7 days', defaultStatus: 'Active' }
    ];

    // Pick one randomly
    const parsedDrug = sampleLabels[Math.floor(Math.random() * sampleLabels.length)];

    // Fetch existing medications for this user to check interactions
    let existingMeds = [];
    if (mongoose.connection.readyState === 1 && typeof Medication.find === 'function' && !(Medication instanceof MockModel)) {
      existingMeds = await Medication.find({ userId: req.user.id });
    } else {
      existingMeds = inMemoryStore.medications.filter(m => m.userId == req.user.id);
    }

    let interaction = null;
    const drugNames = existingMeds.map(m => m.name.toLowerCase());

    // Check drug-drug interaction rules
    if (parsedDrug.name.toLowerCase() === 'ibuprofen') {
      if (drugNames.some(name => name.includes('aspirin'))) {
        interaction = {
          risk: 'High Risk',
          warning: 'Concomitant use of Ibuprofen and Aspirin can increase the risk of gastrointestinal irritation and bleeding, and reduce Aspirin cardioprotective efficacy.'
        };
      } else if (drugNames.some(name => name.includes('warfarin'))) {
        interaction = {
          risk: 'Critical Risk',
          warning: 'Ibuprofen may enhance the anticoagulant effect of Warfarin, significantly increasing the risk of serious bleeding events.'
        };
      }
    } else if (parsedDrug.name.toLowerCase() === 'amoxicillin') {
      if (drugNames.some(name => name.includes('methotrexate'))) {
        interaction = {
          risk: 'Moderate Risk',
          warning: 'Penicillins like Amoxicillin can decrease the renal clearance of Methotrexate, potentially increasing Methotrexate toxicity.'
        };
      }
    } else if (parsedDrug.name.toLowerCase() === 'lisinopril') {
      if (drugNames.some(name => name.includes('spironolactone')) || drugNames.some(name => name.includes('potassium'))) {
        interaction = {
          risk: 'High Risk',
          warning: 'Co-administration of Lisinopril and Potassium-sparing agents may result in severe hyperkalemia (high blood potassium levels).'
        };
      }
    }

    res.json({
      success: true,
      parsed: parsedDrug,
      interaction
    });
  } catch (err) {
    console.error('Failed to parse label:', err);
    res.status(500).json({ error: 'Failed to process prescription label OCR' });
  }
});

app.post('/ar_scans', verifyToken, async (req, res) => {
  try {
    const scanData = { ...req.body, userId: req.user.id };
    let scan;
    if (mongoose.connection.readyState === 1 && typeof ArScan.create === 'function' && !(ArScan instanceof MockModel)) {
      scan = await ArScan.create(scanData);
    } else {
      // In-Memory Fallback
      scan = { ...scanData, _id: Date.now().toString(), date: new Date() };
      inMemoryStore.arScans.push(scan);
    }
    res.json(scan);
  } catch (err) {
    console.error('Failed to create AR scan:', err);
    res.status(500).json({ error: 'Failed to save AR scan' });
  }
});

app.get('/ar_scans', verifyToken, async (req, res) => {
  try {
    let scans;
    if (mongoose.connection.readyState === 1 && typeof ArScan.find === 'function' && !(ArScan instanceof MockModel)) {
      scans = await ArScan.find({ userId: req.user.id });
    } else {
      scans = inMemoryStore.arScans.filter(s => s.userId == req.user.id);
    }
    res.json(scans);
  } catch (err) {
    console.error('Failed to fetch AR scans:', err);
    res.status(500).json({ error: 'Failed to fetch AR scans' });
  }
});

// Clinical Notes
app.post('/clinical_notes', verifyToken, async (req, res) => {
  try {
    const note = await ClinicalNote.create({ ...req.body, userId: req.user.id });
    res.json(note);
  } catch (err) { res.status(500).json({ error: 'Failed to save note' }); }
});

app.get('/clinical_notes', verifyToken, async (req, res) => {
  try {
    const notes = await ClinicalNote.find({ userId: req.user.id }).sort({ _id: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch notes' }); }
});

// Clinical Decision Support (CDS) Endpoint
app.post('/cds_analyze', verifyToken, async (req, res) => {
  try {
    const { heartRate, bloodPressure, symptoms, oxygenLevel } = req.body;
    let redFlags = [];

    // Simple rule-based CDS logic for demonstration
    if (heartRate && (heartRate > 120 || heartRate < 40)) {
      redFlags.push({ severity: 'HIGH', message: 'Abnormal heart rate detected.' });
    }
    
    if (oxygenLevel && oxygenLevel < 92) {
      redFlags.push({ severity: 'CRITICAL', message: 'Low oxygen saturation.' });
    }
    
    if (symptoms && (symptoms.toLowerCase().includes('chest pain') || symptoms.toLowerCase().includes('stroke'))) {
      redFlags.push({ severity: 'CRITICAL', message: 'Immediate medical attention required for reported symptoms.' });
    }

    const result = {
      status: 'analyzed',
      requiresImmediateAttention: redFlags.some(f => f.severity === 'CRITICAL'),
      flags: redFlags
    };

    await VitalRecord.create({
      userId: req.user.id,
      heartRate,
      oxygenLevel,
      symptoms,
      result
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'CDS Analysis failed' });
  }
});

app.get('/vitals', verifyToken, async (req, res) => {
  try {
    const vitals = await VitalRecord.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(vitals);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch vitals' }); }
});

// Multi-Modal Data Sync Endpoint
app.post('/sync_multimodal', verifyToken, async (req, res) => {
  try {
    const { wearableData, patientNotes, labResults } = req.body;
    
    // Simulate formatting disparate data into a single context string
    const contextString = `
      Patient context synced at ${new Date().toISOString()}:
      Wearables: HR ${wearableData?.heartRate || 'N/A'}, Steps ${wearableData?.steps || 'N/A'}
      Notes: ${patientNotes || 'None'}
      Labs: ${labResults ? labResults.join(', ') : 'None'}
    `;

    // Simulate pushing to a Vector Database (like Pinecone/Chroma)
    console.log('[VectorDB Sync] Pushing to namespace: patient_' + req.user.id);
    console.log('[VectorDB Sync] Embedding context:', contextString.trim());
    
    // Simulate delay for DB insertion
    await new Promise(r => setTimeout(r, 600));

    res.json({ message: 'Data synced to Life Context Vector DB successfully', contextSize: contextString.length });
  } catch (err) {
    res.status(500).json({ error: 'Multi-Modal sync failed' });
  }
});

app.post('/send_whatsapp_report', verifyToken, async (req, res) => {
  try {
    const { reportText, phone } = req.body;
    
    if (!reportText || !phone) {
      return res.status(400).json({ error: 'Report text and phone number are required.' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (accountSid && authToken && twilioWhatsAppNumber && accountSid !== 'your_twilio_account_sid') {
      // Real Twilio WhatsApp Integration
      console.log(`[Twilio Service] Sending real message to ${phone}...`);
      const client = twilio(accountSid, authToken);
      
      const message = await client.messages.create({
        body: reportText,
        from: twilioWhatsAppNumber,
        to: phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`
      });

      console.log(`[Twilio Service] Message successfully sent! SID: ${message.sid}`);
      return res.json({ success: true, message: 'Report sent to WhatsApp successfully via Twilio.', sid: message.sid });
    } else {
      // Fallback to Mock if credentials are not configured
      console.log(`[Mock WhatsApp Service] Sending message to ${phone}...`);
      console.log(`[Mock WhatsApp Service] Message Content:\n${reportText}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`[Mock WhatsApp Service] Message successfully sent! (MOCK)`);
      return res.json({ success: true, message: 'Report sent to WhatsApp successfully (MOCK).' });
    }
  } catch (err) {
    console.error('WhatsApp Error:', err);
    res.status(500).json({ error: 'Failed to send WhatsApp message', details: err.message });
  }
});

// Doctor Dashboard Endpoints
app.get('/doctor/triage_queue', verifyToken, async (req, res) => {
  try {
    const symptoms = await Symptom.find().sort({ date: -1 });
    const enrichedQueue = await Promise.all(symptoms.map(async (s) => {
      const user = await User.findById(s.userId);
      return {
        id: s._id,
        userId: s.userId,
        name: user ? user.name : 'Unknown Patient',
        email: user ? user.email : 'N/A',
        dob: user && user.dob ? user.dob : '1990-01-01',
        symptom: s.description,
        urgency: s.urgencyLevel || 3,
        dispatchDepartment: s.dispatchDepartment || 'General Practice',
        status: s.status || 'Pending Review',
        date: s.date
      };
    }));
    res.json(enrichedQueue);
  } catch (err) {
    console.error('Failed to fetch triage queue:', err);
    res.status(500).json({ error: 'Failed to fetch triage queue' });
  }
});

app.post('/doctor/review_triage/:id', verifyToken, async (req, res) => {
  try {
    const record = await Symptom.findByIdAndUpdate(
      req.params.id,
      { status: 'Reviewed' },
      { new: true }
    );
    res.json({ success: true, record });
  } catch (err) {
    console.error('Failed to update triage status:', err);
    res.status(500).json({ error: 'Failed to update triage status' });
  }
});

app.get('/doctor/patients', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    const enrichedUsers = await Promise.all(users.map(async (u) => {
      const latestSymptom = await Symptom.findOne({ userId: u._id }).sort({ date: -1 });
      let risk = 'Low';
      if (latestSymptom) {
        if (latestSymptom.urgencyLevel >= 4) risk = 'High';
        else if (latestSymptom.urgencyLevel === 3) risk = 'Medium';
      }
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        dob: u.dob || '1990-01-01',
        lastVisit: latestSymptom ? new Date(latestSymptom.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No visits recorded',
        risk: risk
      };
    }));
    res.json(enrichedUsers);
  } catch (err) {
    console.error('Failed to fetch patient directory:', err);
    res.status(500).json({ error: 'Failed to fetch patient directory' });
  }
});

app.get('/admin/audit_logs', verifyToken, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.post('/doctor/add_prescription', verifyToken, async (req, res) => {
  try {
    const { userId, name, dosage, schedule } = req.body;
    
    const doctor = await User.findById(req.user.id);
    const doctorName = doctor ? doctor.name : 'Dr. Practitioner';
    
    const medication = await Medication.create({
      userId,
      name,
      dosage,
      schedule,
      status: 'Active'
    });
    
    const patient = await User.findById(userId);
    const patientName = patient ? patient.name : 'Unknown Patient';
    
    await logAuditAction(
      req.user.id,
      doctorName,
      'doctor',
      'PRESCRIPTION_ISSUED',
      `Issued prescription for ${name} (${dosage}, ${schedule}) to patient ${patientName}`
    );
    
    res.json({ success: true, medication });
  } catch (err) {
    console.error('Failed to issue prescription:', err);
    res.status(500).json({ error: 'Failed to issue prescription' });
  }
});

// Catch-all route for SPA - must be after all API routes
if (process.env.NODE_ENV === 'production') {
  // Use the same path detection logic as static files
  const possiblePaths = [
    path.join(__dirname, '../frontend/dist'),
    path.join(__dirname, '../../frontend/dist'),
    path.join(process.cwd(), 'frontend/dist'),
    '/opt/render/project/src/frontend/dist'
  ];
  
  let distPath = possiblePaths[0];
  for (const p of possiblePaths) {
    try {
      if (require('fs').existsSync(p)) {
        distPath = p;
        break;
      }
    } catch (e) {
      // Continue to next path
    }
  }
  
  const indexPath = path.join(distPath, 'index.html');
  app.get('*', (req, res) => {
    console.log('Serving index.html for path:', req.path);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// ============================================================
// VOICE SYMPTOM CHECKER WITH AI REPORT GENERATION
// ============================================================

app.post('/voice_symptom_report', verifyToken, piiMiddleware, async (req, res) => {
  try {
    const { voiceTranscript, symptoms } = req.body;
    
    if (!voiceTranscript || typeof voiceTranscript !== 'string') {
      return res.status(400).json({ error: 'Voice transcript is required.' });
    }

    // First, get AI triage analysis
    let triageResult = await triageSymptomsWithLLM(voiceTranscript);
    
    // Generate comprehensive AI medical report based on voice symptoms
    const reportPrompt = `You are an AI medical report assistant. Generate a professional clinical report based on the patient's voice transcript about their symptoms. 
    
    Patient's Voice Transcript: "${voiceTranscript}"
    
    AI Triage Analysis: 
    - Urgency Level: ${triageResult.urgency_level}
    - Recommended Department: ${triageResult.dispatch_department}
    - Specialty: ${triageResult.specialty}
    
    Create a structured JSON report with these fields:
    - "report_title": A brief clinical summary title
    - "patient_description": Summary of symptoms from voice
    - "ai_assessment": Professional medical assessment (2-3 sentences)
    - "clinical_flags": Array of any clinical red flags detected
    - "recommendations": Array of recommended actions/departments
    - "follow_up": Follow-up instructions for patient
    - "urgency_summary": Human-readable urgency description
    
    Return ONLY valid JSON, no additional text.`;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    let aiReport = {
      report_title: "Voice Symptom Assessment Report",
      patient_description: voiceTranscript,
      ai_assessment: "Professional medical assessment completed",
      clinical_flags: [],
      recommendations: [triageResult.dispatch_department],
      follow_up: "Please contact your healthcare provider for further evaluation",
      urgency_summary: `Urgency Level ${triageResult.urgency_level}/5: ${triageResult.dispatch_department}`
    };

    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        aiReport = await callGeminiJson(
          reportPrompt,
          'You are a medical report generation assistant.',
          0.3
        );
      } catch (aiError) {
        console.warn('[AI Report Generation] Error with Gemini:', aiError.message);
        // Continue with default report structure
      }
    }

    // Save voice symptom record with report when storage is available.
    let voiceSymptomRecord = { _id: `voice-${Date.now()}` };
    try {
      voiceSymptomRecord = await Symptom.create({
        userId: req.user.id,
        description: voiceTranscript,
        extractedSymptoms: symptoms || [],
        urgencyLevel: Number(triageResult.urgency_level) || 3,
        dispatchDepartment: triageResult.dispatch_department,
        suggestedQuestions: triageResult.suggested_questions || [],
        status: 'Voice Analysis Completed',
        aiReport: aiReport
      });
    } catch (storageError) {
      console.warn('[Voice Symptom Report] Storage unavailable, returning generated report without saving:', storageError.message);
    }

    // Log audit action
    let patientName = 'Demo Patient';
    try {
      const u = await User.findById(req.user.id);
      if (u) patientName = u.name;
    } catch (e) {}

    await logAuditAction(
      req.user.id,
      patientName,
      'patient',
      'VOICE_SYMPTOM_REPORT',
      `Generated AI report from voice transcript. Urgency: Level ${triageResult.urgency_level}. Department: ${triageResult.dispatch_department}`
    );

    res.json({
      success: true,
      symptomId: voiceSymptomRecord._id,
      voiceTranscript,
      triageResult,
      aiReport,
      urgency_level: triageResult.urgency_level,
      dispatch_department: triageResult.dispatch_department,
      report_ready_for_whatsapp: true
    });
  } catch (err) {
    console.error('Voice Symptom Report generation failed:', err);
    res.status(500).json({ error: 'Voice report generation failed', details: err.message });
  }
});

// Endpoint to send AI Report via WhatsApp
app.post('/send_voice_report_whatsapp', verifyToken, async (req, res) => {
  try {
    const { aiReport, voiceTranscript, phone, urgencyLevel, dispatchDepartment } = req.body;
    
    if (!aiReport || !phone) {
      return res.status(400).json({ error: 'AI Report and phone number are required.' });
    }

    const normalizedPhone = String(phone).trim();
    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      return res.status(400).json({
        error: 'Enter the patient WhatsApp number with country code, for example +919876543210.'
      });
    }

    // Format the AI report for WhatsApp
    const whatsappMessage = `*🏥 AURA AI HEALTH REPORT*
    
*Report Title:* ${aiReport.report_title || 'Voice Symptom Report'}

*Patient Description:*
${aiReport.patient_description || 'No description provided'}

*AI Medical Assessment:*
${aiReport.ai_assessment || 'Professional assessment pending'}

*Clinical Flags:* ${(aiReport.clinical_flags && aiReport.clinical_flags.length > 0) ? aiReport.clinical_flags.join(', ') : 'None detected'}

*Urgency Level:* ${urgencyLevel || 3}/5
*Recommended Department:* ${dispatchDepartment || 'General Practice'}

*Recommendations:*
${(aiReport.recommendations && aiReport.recommendations.length > 0) ? aiReport.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') : 'See your healthcare provider'}

*Follow-up Instructions:*
${aiReport.follow_up || 'Contact healthcare provider for evaluation'}

---
Generated by Aura AI Health Platform
${formatIndiaDateTime()}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (accountSid && authToken && twilioWhatsAppNumber && accountSid !== 'your_twilio_account_sid') {
      // Real Twilio WhatsApp Integration
      try {
        console.log(`[Twilio Service] Sending AI voice report to ${normalizedPhone}...`);
        const client = twilio(accountSid, authToken);
        
        const message = await client.messages.create({
          body: whatsappMessage,
          from: twilioWhatsAppNumber.startsWith('whatsapp:') ? twilioWhatsAppNumber : `whatsapp:${twilioWhatsAppNumber}`,
          to: `whatsapp:${normalizedPhone}`
        });

        console.log(`[Twilio Service] Voice report successfully sent! SID: ${message.sid}`);
        return res.json({ success: true, message: 'Voice report sent to WhatsApp successfully!', sid: message.sid });
      } catch (twilioError) {
        console.warn('[Twilio Service] Voice report send failed:', twilioError.message);
        return res.status(502).json({
          success: false,
          error: 'Twilio could not deliver the WhatsApp report.',
          details: twilioError.message,
          sandboxHelp: `Make sure ${normalizedPhone} has joined your Twilio WhatsApp sandbox by sending the join code to ${twilioWhatsAppNumber}.`
        });
      }
    } else {
      // Fallback to Mock if credentials are not configured
      console.log(`[Mock WhatsApp Service] Sending voice report to ${normalizedPhone}...`);
      console.log(`[Mock WhatsApp Service] Message Content:\n${whatsappMessage}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`[Mock WhatsApp Service] Voice report successfully sent! (MOCK)`);
      return res.json({ success: true, message: 'Voice report sent to WhatsApp successfully (MOCK)!' });
    }
  } catch (err) {
    console.error('Voice Report WhatsApp Error:', err);
    res.status(500).json({ error: 'Failed to send voice report via WhatsApp', details: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



