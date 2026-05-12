const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { piiMiddleware } = require('./piiMasker');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const triageSymptomsWithLLM = async (symptomsText) => {
  const prompt = `You are an automated medical triage and routing agent. Analyze the patient's symptoms and return only valid JSON with these keys: ` +
    `'specialty', 'urgency_level', 'suggested_questions', and 'dispatch_department'. ` +
    `Do not include any extra text. ` +
    `Use urgency_level as an integer from 1 (non-urgent) to 5 (emergency). ` +
    `'dispatch_department' must be one of: 'Cardiology', 'Orthopedics', 'General Practice', 'Neurology', 'Dermatology', or 'Emergency Room'. ` +
    `Example response format: {"specialty":"cardiology","urgency_level":3,"suggested_questions":["When did this start?","Do you have chest pain?"], "dispatch_department": "Cardiology"}. ` +
    `Patient symptoms: ${symptomsText}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful medical triage assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('LLM did not return a valid response.');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    // Attempt to extract JSON object if the model added text before/after it.
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Unable to parse LLM response as JSON: ${content}`);
  }
};

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

const symptomSchema = new mongoose.Schema({
  userId: String,
  description: String,
  extractedSymptoms: [String],
  predictedDisease: String,
  date: { type: Date, default: Date.now },
});
const Symptom = mongoose.model('Symptom', symptomSchema);

const billSchema = new mongoose.Schema({
  userId: String,
  items: [{ name: String, qty: Number, price: Number }],
  total: Number,
  date: { type: Date, default: Date.now },
});
const Bill = mongoose.model('Bill', billSchema);

const achievementSchema = new mongoose.Schema({
  userId: String,
  title: String,
  description: String,
  isComplete: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});
const Achievement = mongoose.model('Achievement', achievementSchema);

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
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
    return res.json({
      specialty: triageResult.specialty || 'general_medicine',
      urgency_level: Number(triageResult.urgency_level) || 3,
      dispatch_department: triageResult.dispatch_department || 'General Practice',
      suggested_questions: Array.isArray(triageResult.suggested_questions)
        ? triageResult.suggested_questions
        : [String(triageResult.suggested_questions || 'Could you clarify more details?')],
    });
  } catch (err) {
    console.error('Symptom triage failed:', err.message || err);
    res.status(500).json({ error: 'Symptom triage failed', details: err.message });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, phone, password: hashedPassword });
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, id: user._id, name: user.name, email: user.email, phone: user.phone });
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

    res.json({
      status: 'analyzed',
      requiresImmediateAttention: redFlags.some(f => f.severity === 'CRITICAL'),
      flags: redFlags
    });
  } catch (err) {
    res.status(500).json({ error: 'CDS Analysis failed' });
  }
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

