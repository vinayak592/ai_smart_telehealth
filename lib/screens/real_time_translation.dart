import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../services/real_time_translation_service.dart';

class RealTimeTranslationScreen extends StatefulWidget {
  const RealTimeTranslationScreen({super.key});

  @override
  State<RealTimeTranslationScreen> createState() => _RealTimeTranslationScreenState();
}

class _RealTimeTranslationScreenState extends State<RealTimeTranslationScreen> {
  final RealTimeTranslationService _translationService = RealTimeTranslationService();
  final TextEditingController _textController = TextEditingController();
  String _translatedText = '';
  String _targetLanguage = 'es'; // Default to Spanish
  bool _isTranslating = false;

  final List<String> _languages = [
    'es', // Spanish
    'fr', // French
    'de', // German
    'it', // Italian
    'pt', // Portuguese
    'zh', // Chinese
    'ja', // Japanese
    'ko', // Korean
  ];

  Future<void> _translate() async {
    if (_textController.text.isEmpty) return;

    setState(() {
      _isTranslating = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final apiKey = prefs.getString('google_api_key') ?? '';

      final translated = await _translationService.translateText(
        _textController.text,
        _targetLanguage,
        googleApiKey: apiKey,
      );
      setState(() {
        _translatedText = translated;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Translation failed: $e')),
      );
    } finally {
      setState(() {
        _isTranslating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Real-time Multi-Language Consultation'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            DropdownButton<String>(
              value: _targetLanguage,
              items: _languages.map((lang) {
                return DropdownMenuItem(
                  value: lang,
                  child: Text(lang.toUpperCase()),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _targetLanguage = value!;
                });
              },
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _textController,
              decoration: const InputDecoration(
                labelText: 'Enter text to translate',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isTranslating ? null : _translate,
              child: _isTranslating ? const CircularProgressIndicator() : const Text('Translate'),
            ),
            const SizedBox(height: 16),
            if (_translatedText.isNotEmpty) ...[
              const Text('Translated Text:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(_translatedText, style: const TextStyle(fontSize: 16)),
            ],
          ],
        ),
      ),
    );
  }
}
