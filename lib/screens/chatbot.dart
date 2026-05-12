import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/message.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  _ChatbotScreenState createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final _messageController = TextEditingController();
  final List<Message> _messages = [];
  bool _isLoading = false;
  String _emotionalState = 'Calm / Neutral';
  Color _emotionalColor = Colors.green;

  String _correctTypos(String text) {
    // Simple typo correction
    Map<String, String> corrections = {
      'headach': 'headache',
      'fevr': 'fever',
      'cogh': 'cough',
      'pain': 'pain',
      'stomach': 'stomach',
      'throat': 'throat',
      'nausea': 'nausea',
      'dizziness': 'dizziness',
      'fatigue': 'fatigue',
      'symptom': 'symptom',
      'doctor': 'doctor',
      'appointment': 'appointment',
      'medicine': 'medicine',
      'health': 'health',
      'diet': 'diet',
      'exercise': 'exercise',
      'sleep': 'sleep',
      'water': 'water',
      'stress': 'stress',
    };
    String corrected = text.toLowerCase();
    corrections.forEach((key, value) {
      corrected = corrected.replaceAll(key, value);
    });
    return corrected;
  }

  // Kannada word detection and translation
  final Map<String, String> _kannadaTranslations = {
    // Common Kannada medical terms
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

    // If Kannada words were detected, add a note
    if (detectedKannadaWords.isNotEmpty) {
      processedText += " [Detected Kannada words: ${detectedKannadaWords.join(', ')}]";
    }

    return processedText;
  }

  bool _containsKannadaScript(String text) {
    // Check if text contains Kannada Unicode characters (U+0C80 to U+0CFF)
    return text.runes.any((rune) => rune >= 0x0C80 && rune <= 0x0CFF);
  }

  void _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    String processedText = _detectAndTranslateKannada(text);
    bool hasKannada = _containsKannadaScript(text);

    setState(() {
      _messages.add(Message(text: text, isUser: true, timestamp: DateTime.now()));
      _isLoading = true;
      _emotionalState = 'Analyzing voice/text biometrics...';
      _emotionalColor = Colors.grey;
    });
    _messageController.clear();

    // Simulate Emotional Biofeedback Analysis
    await Future.delayed(const Duration(milliseconds: 600));
    final lowerText = text.toLowerCase();
    setState(() {
      if (lowerText.contains('worry') || lowerText.contains('anxious') || lowerText.contains('stress') || lowerText.contains('scared')) {
        _emotionalState = 'High Anxiety Detected - Switching to Supportive Tone';
        _emotionalColor = Colors.orange;
        processedText = '[EMOTIONAL_STATE: ANXIOUS] ' + processedText;
      } else if (lowerText.contains('sad') || lowerText.contains('depress') || lowerText.contains('cry')) {
        _emotionalState = 'Depressive State Detected - Switching to Empathetic Tone';
        _emotionalColor = Colors.blueGrey;
        processedText = '[EMOTIONAL_STATE: SAD] ' + processedText;
      } else {
        _emotionalState = 'Calm / Neutral';
        _emotionalColor = Colors.green;
      }
    });

    try {
      final response = await ApiService().chatWithBot(processedText);
      setState(() {
        _messages.add(Message(text: response, isUser: false, timestamp: DateTime.now()));
      });
    } catch (e) {
      // Enhanced fallback with Kannada support
      String response = _generateLocalResponse(processedText, hasKannada);
      setState(() {
        _messages.add(Message(text: response, isUser: false, timestamp: DateTime.now()));
      });
    }
    setState(() => _isLoading = false);
  }

  String _generateLocalResponse(String text, bool hasKannada) {
    String lower = text.toLowerCase();

    // Add Kannada acknowledgment if detected
    String kannadaNote = hasKannada ? " (I detected and translated Kannada words in your message! 🇮🇳)" : "";
    
    // Add Empathetic prefix if needed based on emotional state
    String empathyPrefix = "";
    if (lower.contains('[emotional_state: anxious]')) {
      empathyPrefix = "I hear that you're feeling anxious, and it's completely normal to feel that way. Let's work through this together. ";
    } else if (lower.contains('[emotional_state: sad]')) {
      empathyPrefix = "I'm really sorry you're feeling down. I'm here to listen and help however I can. ";
    }

    if (lower.contains('headache') || lower.contains('pain') || lower.contains('ತಲೆನೋವು') || lower.contains('ನೋವು')) {
      return 'Headaches can be caused by stress, dehydration, or lack of sleep. Try resting and staying hydrated. If severe, consult a doctor.$kannadaNote';
    } else if (lower.contains('fever') || lower.contains('ಜ್ವರ')) {
      return 'A fever is often a sign your body is fighting an infection. Rest and monitor your temperature. If it\'s high, see a doctor.$kannadaNote';
    } else if (lower.contains('cough') || lower.contains('ಕೆಮ್ಮು')) {
      return 'Coughs can be due to colds, allergies, or irritants. Stay hydrated and get rest. If persistent, consult a doctor.$kannadaNote';
    } else if (lower.contains('stomach') || lower.contains('ಹೊಟ್ಟೆ')) {
      return 'Stomach issues might be from diet, stress, or infection. Eat bland foods and stay hydrated. If severe, see a doctor.$kannadaNote';
    } else if (lower.contains('appointment') || lower.contains('ನೇಮಕಾತಿ')) {
      return 'To schedule an appointment, you can use the Appointments section or contact your doctor directly. Would you like help with that?$kannadaNote';
    } else if (lower.contains('health') || lower.contains('tip') || lower.contains('ಆರೋಗ್ಯ')) {
      return 'For health tips, check the Health Tips section. Remember to eat balanced meals, exercise regularly, and get enough sleep!$kannadaNote';
    } else if (lower.contains('symptom') || lower.contains('ಲಕ್ಷಣ')) {
      return 'If you\'re experiencing symptoms, please describe them in the Symptoms section for analysis, or consult a doctor.$kannadaNote';
    } else if (lower.contains('doctor') || lower.contains('ವೈದ್ಯ')) {
      return 'You can find doctors in the Doctors section. We have specialists in various fields ready to help.$kannadaNote';
    } else if (lower.contains('medicine') || lower.contains('ಔಷಧಿ')) {
      return '$empathyPrefix For medication management, check the Medication Tracker. Always follow your doctor\'s prescription.$kannadaNote';
    }
    return '$empathyPrefix I am here to help with health questions in English and Kannada! Please describe your symptoms or ask about health topics. ನಾನು ಆರೋಗ್ಯ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ!$kannadaNote';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Chat & Triage')),
      body: SafeArea(
        child: Column(
          children: [
            // Biofeedback Indicator
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              color: _emotionalColor.withOpacity(0.1),
              child: Row(
                children: [
                  Icon(Icons.favorite, color: _emotionalColor, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    'Emotional Biofeedback: $_emotionalState',
                    style: TextStyle(color: _emotionalColor, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _messages.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.smart_toy, size: 64, color: Colors.teal),
                          SizedBox(height: 16),
                          Text('Start a conversation about your symptoms',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 16, color: Colors.grey)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        final message = _messages[index];
                        return Align(
                          alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                            decoration: BoxDecoration(
                              color: message.isUser ? Colors.teal.shade300 : Colors.grey.shade200,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  message.text,
                                  style: TextStyle(color: message.isUser ? Colors.white : Colors.black87),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _formatTime(message.timestamp),
                                  style: TextStyle(fontSize: 10, color: message.isUser ? Colors.white70 : Colors.grey[600]),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
            if (_isLoading) const LinearProgressIndicator(),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      textInputAction: TextInputAction.send,
                      decoration: InputDecoration(
                        hintText: 'Ask a health question',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: Colors.teal,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white),
                      onPressed: _sendMessage,
                      tooltip: 'Send message',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final hour = dateTime.hour.toString().padLeft(2, '0');
    final minute = dateTime.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}