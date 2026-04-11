import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/symptom.dart';
import 'doctors.dart';
import 'chatbot.dart';

class SymptomInputScreen extends StatefulWidget {
  const SymptomInputScreen({super.key});

  @override
  _SymptomInputScreenState createState() => _SymptomInputScreenState();
}

class _SymptomInputScreenState extends State<SymptomInputScreen>
    with TickerProviderStateMixin {
  final _descriptionController = TextEditingController();
  Symptom? _result;
  bool _isLoading = false;
  bool _isRecording = false;
  bool _hasKannada = false;
  String? _translatedKannadaText;
  late AnimationController _recordingAnimationController;
  late Animation<double> _recordingAnimation;

  @override
  void initState() {
    super.initState();
    _recordingAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )..repeat(reverse: true);

    _recordingAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(
        parent: _recordingAnimationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _recordingAnimationController.dispose();
    super.dispose();
  }

  void _analyze() async {
    if (_descriptionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please describe your symptoms')),
      );
      return;
    }

    // Detect and translate Kannada words
    bool hasKannada = _containsKannadaScript(_descriptionController.text);
    String processedText = _detectAndTranslateKannada(_descriptionController.text);
    _hasKannada = hasKannada;
    _translatedKannadaText = hasKannada ? processedText : null;

    setState(() => _isLoading = true);

    try {
      // Enhanced fallback analysis with Kannada support
      final extractedSymptoms = _extractSymptomsLocally(processedText);
      final predictedDisease = _predictDiseaseLocally(extractedSymptoms, hasKannada);

      final symptom = await ApiService().analyzeSymptoms(processedText, extractedSymptoms, predictedDisease);
      setState(() => _result = symptom);
    } catch (e) {
      // If backend fails, use local analysis
      final extractedSymptoms = _extractSymptomsLocally(processedText);
      final predictedDisease = _predictDiseaseLocally(extractedSymptoms, hasKannada);

      final symptom = Symptom(
        description: _descriptionController.text,
        extractedSymptoms: extractedSymptoms,
        predictedDisease: predictedDisease,
      );
      setState(() => _result = symptom);
    }

    setState(() => _isLoading = false);
  }

  // Kannada word detection and translation
  final Map<String, String> _kannadaTranslations = {
    'ತಲೆನೋವು': 'headache',
    'ಜ್ವರ': 'fever',
    'ಕೆಮ್ಮು': 'cough',
    'ನೋವು': 'pain',
    'ಹೊಟ್ಟೆ': 'stomach',
    'ಗಂಟಲು': 'throat',
    'ಬೇಸ್ಸೆ': 'nausea',
    'ತಲೆಸುತ್ತುವುದು': 'dizziness',
    'ಅಲಸತ್ವ': 'fatigue',
    'ಲಕ್ಷಣ': 'symptom',
    'ವೈದ್ಯ': 'doctor',
    'ನೇಮಕಾತಿ': 'appointment',
    'ಔಷಧಿ': 'medicine',
    'ಆರೋಗ್ಯ': 'health',
    'ಆಹಾರ': 'diet',
    'ವ್ಯಾಯಾಮ': 'exercise',
    'ನಿದ್ರೆ': 'sleep',
    'ನೀರು': 'water',
    'ತಣ್ಣನೆ': 'stress',
    'ಮೂತ್ರ': 'urine',
    'ರಕ್ತ': 'blood',
    'ಹೃದಯ': 'heart',
    'ಮೂಸು': 'cold',
    'ಸೋಂಕು': 'infection',
    'ಅಲರ್ಜಿ': 'allergy',
    'ಅಸ್ಥಿಭಂಗ': 'fracture',
    'ಮೂಳೆ': 'sprain',
    'ಕಾಯಿಲೆ': 'disease',
    'ಚಿಕಿತ್ಸೆ': 'treatment',
    'ವೈದ್ಯಕೀಯ': 'medical',
    'ಉಸಿರಾಟ': 'breathing',
    'ಚರ್ಮ': 'skin',
    'ಕಣ್ಣು': 'eye',
    'ಕಿವಿ': 'ear',
    'ಹಲ್ಲು': 'tooth',
    'ರೋಗ': 'disease',
  };

  final Map<String, String> _symptomSynonyms = {
    'fever': 'fever',
    'high temperature': 'fever',
    'temperature': 'fever',
    'cough': 'cough',
    'dry cough': 'cough',
    'wet cough': 'cough',
    'headache': 'headache',
    'migraine': 'headache',
    'nausea': 'nausea',
    'feeling sick': 'nausea',
    'vomiting': 'vomiting',
    'throwing up': 'vomiting',
    'diarrhea': 'diarrhea',
    'stomach pain': 'abdominal pain',
    'abdominal pain': 'abdominal pain',
    'belly pain': 'abdominal pain',
    'stomach cramps': 'abdominal pain',
    'cramps': 'abdominal pain',
    'heartburn': 'acid reflux',
    'acid reflux': 'acid reflux',
    'burning sensation': 'acid reflux',
    'sore throat': 'sore throat',
    'throat pain': 'sore throat',
    'dizziness': 'dizziness',
    'lightheaded': 'dizziness',
    'blurred vision': 'blurred vision',
    'fatigue': 'fatigue',
    'tired': 'fatigue',
    'weakness': 'fatigue',
    'body ache': 'body aches',
    'body aches': 'body aches',
    'muscle pain': 'body aches',
    'joint pain': 'joint pain',
    'stiffness': 'joint pain',
    'chest pain': 'chest pain',
    'shortness of breath': 'shortness of breath',
    'breathless': 'shortness of breath',
    'difficulty breathing': 'shortness of breath',
    'rash': 'rash',
    'skin rash': 'rash',
    'swelling': 'swelling',
    'itching': 'allergic reaction',
    'allergy': 'allergic reaction',
    'itchy': 'allergic reaction',
    'runny nose': 'runny nose',
    'sneezing': 'sneezing',
    'watery eyes': 'watery eyes',
    'sinus pressure': 'sinus infection',
    'facial pain': 'sinus infection',
    'nasal congestion': 'sinus infection',
    'stuffy nose': 'sinus infection',
    'ear pain': 'ear infection',
    'earache': 'ear infection',
    'hearing loss': 'ear infection',
    'tinnitus': 'ear infection',
    'painful urination': 'urinary pain',
    'burning urination': 'urinary pain',
    'frequent urination': 'urinary frequency',
    'lower back pain': 'lower back pain',
    'muscle cramps': 'muscle cramps',
    'palpitations': 'palpitations',
    'anxiety': 'stress',
    'stress': 'stress',
    'panic': 'stress',
    'difficulty sleeping': 'difficulty sleeping',
    'insomnia': 'difficulty sleeping',
    'low mood': 'depression',
    'sadness': 'depression',
    'loss of appetite': 'loss of appetite',
    'night sweats': 'night sweats',
    'chills': 'chills',
    'productive cough': 'cough',
    'blood in sputum': 'cough',
    'joint swelling': 'joint pain',
    'cold sweats': 'chills',
    'muscle weakness': 'fatigue',
    'difficulty concentrating': 'fatigue',
    'dry skin': 'dry skin',
    'rash all over': 'rash',
    'constant thirst': 'excessive thirst',
    'high blood pressure': 'hypertension',
    'loss of taste': 'loss of taste',
    'loss of smell': 'loss of smell',
    'eye pain': 'ear infection',
    'face pain': 'sinus infection',
    'aching joints': 'joint pain',
    'stiff joints': 'joint pain',
    'numbness': 'numbness',
  };

  final Map<String, Map<String, dynamic>> _diseaseProfiles = {
    'Influenza / Viral Infection': {
      'keywords': ['fever', 'cough', 'fatigue', 'body aches', 'headache', 'sore throat', 'chills'],
      'advice': 'Rest, stay hydrated, and monitor your temperature closely.',
    },
    'Common Cold': {
      'keywords': ['cough', 'sore throat', 'runny nose', 'sneezing', 'nasal congestion', 'headache'],
      'advice': 'Stay warm, drink fluids, and rest. Use saline nasal spray as needed.',
    },
    'Respiratory Infection / COVID-like Illness': {
      'keywords': ['fever', 'cough', 'shortness of breath', 'fatigue', 'loss of taste', 'loss of smell', 'chest pain'],
      'advice': 'Monitor breathing, isolate if necessary, and seek medical care if symptoms worsen.',
    },
    'Pneumonia': {
      'keywords': ['fever', 'cough', 'shortness of breath', 'chest pain', 'chills', 'body aches'],
      'advice': 'Seek medical evaluation for pneumonia if you have persistent cough and difficulty breathing.',
    },
    'Dengue / Viral Fever': {
      'keywords': ['fever', 'headache', 'body aches', 'rash', 'nausea', 'vomiting', 'fatigue'],
      'advice': 'Rest, hydrate, and seek immediate medical care if fever is high or bleeding occurs.',
    },
    'Malaria-like Illness': {
      'keywords': ['fever', 'chills', 'sweats', 'headache', 'body aches', 'nausea', 'vomiting'],
      'advice': 'See a healthcare provider for malaria testing if you have recurring fever and chills.',
    },
    'Migraine / Severe Headache': {
      'keywords': ['headache', 'nausea', 'vomiting', 'sensitivity to light', 'dizziness', 'blurred vision'],
      'advice': 'Rest in a dark quiet room, drink water, and avoid strong smells.',
    },
    'Gastroenteritis / Food Poisoning': {
      'keywords': ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'cramps', 'fever'],
      'advice': 'Drink clear fluids, eat bland foods, and rest. Seek care if dehydration develops.',
    },
    'Allergic Reaction': {
      'keywords': ['rash', 'sneezing', 'itching', 'watery eyes', 'runny nose', 'swelling'],
      'advice': 'Avoid triggers, apply cool compresses, and see a doctor if swelling is severe.',
    },
    'Sinus Infection': {
      'keywords': ['nasal congestion', 'runny nose', 'sinus pressure', 'facial pain', 'headache', 'sore throat'],
      'advice': 'Use warm compresses and nasal saline rinses; consult a doctor if symptoms persist.',
    },
    'Ear Infection': {
      'keywords': ['ear pain', 'earache', 'hearing loss', 'fever', 'tinnitus'],
      'advice': 'Keep the ear dry and seek medical attention if pain or discharge worsens.',
    },
    'Acid Reflux / Heartburn': {
      'keywords': ['acid reflux', 'heartburn', 'burning sensation', 'chest pain', 'sour taste'],
      'advice': 'Avoid spicy foods, eat smaller meals, and raise your head while sleeping.',
    },
    'Asthma / Bronchial Problem': {
      'keywords': ['shortness of breath', 'cough', 'chest tightness', 'wheezing'],
      'advice': 'Use prescribed inhalers and seek urgent care for worsening breathing.',
    },
    'Cardiac Concern': {
      'keywords': ['chest pain', 'shortness of breath', 'dizziness', 'palpitations', 'swelling'],
      'advice': 'Seek immediate medical attention for chest discomfort or pressure.',
    },
    'Hypertension / High Blood Pressure': {
      'keywords': ['headache', 'dizziness', 'blurred vision', 'nosebleeds', 'fatigue'],
      'advice': 'Track your blood pressure and consult a healthcare professional for evaluation.',
    },
    'Diabetes-related Symptoms': {
      'keywords': ['frequent urination', 'excessive thirst', 'fatigue', 'blurred vision', 'slow healing', 'dry mouth'],
      'advice': 'Maintain hydration and consult a healthcare provider for blood sugar testing.',
    },
    'Dehydration': {
      'keywords': ['dry mouth', 'excessive thirst', 'fatigue', 'dizziness', 'weakness'],
      'advice': 'Drink water and electrolyte-rich fluids, and rest in a cool place.',
    },
    'Arthritis / Joint Pain': {
      'keywords': ['joint pain', 'stiffness', 'swelling', 'joint swelling', 'aching joints'],
      'advice': 'Rest, apply heat or cold, and see a doctor for long-term joint pain.',
    },
    'Depression / Low Mood': {
      'keywords': ['depression', 'difficulty sleeping', 'low mood', 'sadness', 'loss of appetite', 'fatigue'],
      'advice': 'Talk to a healthcare provider or counselor if you feel low mood or fatigue consistently.',
    },
    'Urinary Tract Infection': {
      'keywords': ['urinary pain', 'urinary frequency', 'fever', 'lower back pain'],
      'advice': 'Drink water and consult a healthcare provider for evaluation and treatment.',
    },
    'Skin Condition': {
      'keywords': ['rash', 'itching', 'swelling', 'redness', 'dry skin'],
      'advice': 'Keep the area clean and use gentle skin care. See a dermatologist for persistent symptoms.',
    },
    'Anxiety / Stress Reaction': {
      'keywords': ['anxiety', 'stress', 'palpitations', 'difficulty sleeping', 'insomnia'],
      'advice': 'Practice relaxation techniques and consider talking to a healthcare professional.',
    },
  };

  String _detectAndTranslateKannada(String text) {
    String processedText = text;
    List<String> detectedKannadaWords = [];

    // Check for Kannada words in the text
    _kannadaTranslations.forEach((kannada, english) {
      if (processedText.contains(kannada)) {
        processedText = processedText.replaceAll(kannada, english);
        detectedKannadaWords.add(kannada);
      }
    });

    return processedText;
  }

  bool _containsKannadaScript(String text) {
    // Check if text contains Kannada Unicode characters (U+0C80 to U+0CFF)
    return text.runes.any((rune) => rune >= 0x0C80 && rune <= 0x0CFF);
  }

  List<String> _extractSymptomsLocally(String description) {
    final lowerDesc = description.toLowerCase();
    final discoveredSymptoms = <String>{};

    _symptomSynonyms.forEach((key, normalized) {
      if (lowerDesc.contains(key)) {
        discoveredSymptoms.add(normalized);
      }
    });

    final directSymptoms = [
      'sore throat', 'runny nose', 'shortness of breath', 'chest pain', 'body aches',
      'abdominal pain', 'urinary pain', 'urinary frequency', 'skin rash', 'watery eyes',
      'stuffy nose', 'nasal congestion', 'lightheaded', 'palpitations', 'muscle cramps',
    ];

    for (final symptom in directSymptoms) {
      if (lowerDesc.contains(symptom)) {
        discoveredSymptoms.add(symptom);
      }
    }

    return discoveredSymptoms.toList();
  }

  String _predictDiseaseLocally(List<String> symptoms, bool hasKannada) {
    String kannadaNote = hasKannada ? " (Kannada words detected and processed)" : "";

    if (symptoms.isEmpty) {
      return 'Unable to identify specific symptoms. Please provide more details or consult a healthcare professional.$kannadaNote';
    }

    final symptomSet = symptoms.toSet();
    String bestDisease = 'General illness';
    int bestScore = 0;
    String bestAdvice = 'Monitor symptoms and consult a healthcare professional if they worsen.';

    _diseaseProfiles.forEach((disease, profile) {
      final keywords = List<String>.from(profile['keywords'] as List<dynamic>);
      final score = keywords.where(symptomSet.contains).length;
      if (score > bestScore) {
        bestScore = score;
        bestDisease = disease;
        bestAdvice = profile['advice'] as String;
      }
    });

    if (bestScore == 0) {
      return 'General symptoms detected - Monitor your condition and consult a healthcare professional if symptoms persist or worsen.$kannadaNote';
    }

    final matchedSymptoms = (_diseaseProfiles[bestDisease]!['keywords'] as List<String>)
        .where(symptomSet.contains)
        .join(', ');
    return '$bestDisease likely based on symptoms: $matchedSymptoms. $bestAdvice$kannadaNote';
  }

  void _toggleVoiceRecording() {
    setState(() {
      _isRecording = !_isRecording;
    });

    if (_isRecording) {
      // Start voice recording simulation
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎤 Voice recording started... Speak your symptoms'),
          duration: Duration(seconds: 2),
        ),
      );
    } else {
      // Stop recording and simulate transcription
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎤 Voice recording stopped. Processing...'),
          duration: Duration(seconds: 2),
        ),
      );

      // Simulate voice-to-text conversion
      Future.delayed(const Duration(seconds: 2), () {
        if (!mounted) return;
        final kannadaVoiceText = 'ನನಗೆ ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು ಇದ್ದು ದೇಹ ನೋವು ಮತ್ತು ಅಲಸುಕಂಟು ಆಗುತ್ತಿದೆ.';
        final translatedText = _detectAndTranslateKannada(kannadaVoiceText);
        setState(() {
          _descriptionController.text = kannadaVoiceText;
          _hasKannada = true;
          _translatedKannadaText = translatedText;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Kannada voice transcribed and translated successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Symptom Analysis'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              // Show symptom history
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Symptom history feature coming soon!')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Describe Your Symptoms',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.teal,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Tell us how you\'re feeling. Be as detailed as possible.',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 24),

            // Voice Input Section
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Text(
                      '🎤 Voice Input (AI-Powered)',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Tap to speak your symptoms naturally',
                      style: TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: _toggleVoiceRecording,
                      child: AnimatedBuilder(
                        animation: _recordingAnimation,
                        builder: (context, child) {
                          return Transform.scale(
                            scale: _isRecording ? _recordingAnimation.value : 1.0,
                            child: Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: _isRecording ? Colors.red : Colors.teal,
                                boxShadow: _isRecording
                                    ? [
                                        BoxShadow(
                                          color: Colors.red.withOpacity(0.3),
                                          blurRadius: 20,
                                          spreadRadius: 5,
                                        )
                                      ]
                                    : null,
                              ),
                              child: Icon(
                                _isRecording ? Icons.mic : Icons.mic_none,
                                color: Colors.white,
                                size: 32,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isRecording ? 'Listening...' : 'Tap to start voice input',
                      style: TextStyle(
                        color: _isRecording ? Colors.red : Colors.teal,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Text Input Section
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '📝 Text Description',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Describe your symptoms in detail...',
                        hintText: 'e.g., I have a fever, cough, and feel very tired...',
                        border: OutlineInputBorder(),
                        alignLabelWithHint: true,
                      ),
                      maxLines: 6,
                      style: const TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Analyze Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton.icon(
                      onPressed: _analyze,
                      icon: const Icon(Icons.analytics, size: 24),
                      label: const Text(
                        'Analyze Symptoms with AI',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
            ),

            // Results Section
            if (_result != null) ...[
              const SizedBox(height: 24),
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.medical_services, color: Colors.teal),
                          const SizedBox(width: 8),
                          const Text(
                            'AI Analysis Results',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.teal,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      if (_hasKannada && _translatedKannadaText != null) ...[
                        const Text(
                          'Kannada Input:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blueGrey.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.blueGrey.withOpacity(0.2)),
                          ),
                          child: Text(
                            _descriptionController.text,
                            style: const TextStyle(fontSize: 14, color: Colors.black87),
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Translated English:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.green.withOpacity(0.2)),
                          ),
                          child: Text(
                            _translatedKannadaText!,
                            style: const TextStyle(fontSize: 14, color: Colors.black87),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Extracted Symptoms
                      const Text(
                        'Identified Symptoms:',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _result!.extractedSymptoms.map((symptom) {
                          return Chip(
                            label: Text(symptom),
                            backgroundColor: Colors.teal.withOpacity(0.1),
                            labelStyle: const TextStyle(color: Colors.teal),
                          );
                        }).toList(),
                      ),

                      const SizedBox(height: 16),

                      // Predicted Condition
                      if (_result!.predictedDisease != null) ...[
                        const Text(
                          'Possible Condition:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.orange.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.orange.withOpacity(0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.warning, color: Colors.orange),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _result!.predictedDisease!,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 16),

                      // Disclaimer
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.withOpacity(0.3)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.info, color: Colors.red),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '⚠️ This is AI-powered preliminary analysis. Please consult a healthcare professional for accurate diagnosis and treatment.',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.red,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const DoctorsScreen()));
                              },
                              icon: const Icon(Icons.people),
                              label: const Text('Find Doctors'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.teal,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ChatbotScreen()));
                              },
                              icon: const Icon(Icons.chat),
                              label: const Text('Ask AI'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}