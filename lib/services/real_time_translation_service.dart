import 'dart:convert';

import 'package:http/http.dart' as http;

class RealTimeTranslationService {
  static const _translateUrl = 'https://translation.googleapis.com/language/translate/v2';

  Future<String> translateText(String text, String targetLanguage, {required String googleApiKey}) async {
    if (googleApiKey.isEmpty) {
      throw ArgumentError('Google API key is required.');
    }

    final response = await http.post(
      Uri.parse('$_translateUrl?key=$googleApiKey'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'q': text,
        'target': targetLanguage,
        'format': 'text',
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Translation API request failed: ${response.statusCode} ${response.body}');
    }

    final data = jsonDecode(response.body);
    return data['data']['translations'][0]['translatedText'] as String;
  }

  // For real-time, this would be integrated with speech recognition and video stream
  // Placeholder for live translation during calls
  Future<String> translateSpeech(String speechText, String targetLanguage, {required String googleApiKey}) async {
    return await translateText(speechText, targetLanguage, googleApiKey: googleApiKey);
  }
}
