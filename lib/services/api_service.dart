import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/symptom.dart';

class ApiService {
  // Use localhost for web, 10.0.2.2 for Android emulator, or your machine IP for physical devices
  static const String baseUrl = 'http://localhost:5001';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<User> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _saveToken(data['token']);
      return User(
        id: data['id'],
        name: data['name'],
        email: data['email'],
        phone: data['phone'],
      );
    } else {
      throw Exception('Failed to login: ${response.body}');
    }
  }

  Future<User> register(String name, String email, String phone, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _saveToken(data['token']);
      return User(
        id: data['id'],
        name: data['name'],
        email: data['email'],
        phone: data['phone'],
      );
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  Future<Symptom> analyzeSymptoms(String description, List<String> extractedSymptoms, String predictedDisease) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/analyze_symptoms'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'description': description,
        'extractedSymptoms': extractedSymptoms,
        'predictedDisease': predictedDisease,
      }),
    );

    if (response.statusCode == 200) {
      return Symptom.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to analyze symptoms: ${response.body}');
    }
  }

  Future<String> chatWithBot(String message) async {
    final response = await http.post(
      Uri.parse('$baseUrl/chat'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'message': message}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['response'];
    } else {
      throw Exception('Failed to chat: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> getDoctors() async {
    final response = await http.get(Uri.parse('$baseUrl/doctors'));

    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get doctors: ${response.body}');
    }
  }

  Future<void> saveBill(List<Map<String, dynamic>> items, double total) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/save-bill'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'items': items, 'total': total}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to save bill: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> getBills() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/bills'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get bills: ${response.body}');
    }
  }

  Future<void> saveAchievement(String title, String description, bool isComplete) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/save-achievement'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'title': title, 'description': description, 'isComplete': isComplete}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to save achievement: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> getAchievements() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/achievements'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get achievements: ${response.body}');
    }
  }
}