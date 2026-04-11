const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

