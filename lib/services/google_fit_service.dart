import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class GoogleFitTokenExpiredException implements Exception {
  final String message;
  GoogleFitTokenExpiredException([this.message = 'Google Fit access token has expired or is invalid.']);

  @override
  String toString() => 'GoogleFitTokenExpiredException: $message';
}

class GoogleFitNoDataException implements Exception {
  final String message;
  GoogleFitNoDataException([this.message = 'No data available from Google Fit.']);

  @override
  String toString() => 'GoogleFitNoDataException: $message';
}

class GoogleFitException implements Exception {
  final String message;
  GoogleFitException([this.message = 'Google Fit API request failed.']);

  @override
  String toString() => 'GoogleFitException: $message';
}

class HeartRateReading {
  final double bpm;
  final DateTime time;

  HeartRateReading({required this.bpm, required this.time});

  Map<String, dynamic> toJson() => {
        'bpm': bpm,
        'time': time.toIso8601String(),
      };
}

class GoogleFitService {
  static const _baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';
  static const _stepDataType = 'com.google.step_count.delta';
  static const _heartRateDataSource = 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm';
  static const _googleFitTokenKey = 'google_fit_access_token';
  static const _googleFitRefreshTokenKey = 'google_fit_refresh_token';
  static const _googleFitClientIdKey = 'google_fit_client_id';
  static const _googleFitClientSecretKey = 'google_fit_client_secret';
  static const _tokenEndpoint = 'https://oauth2.googleapis.com/token';

  Future<String> _getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_googleFitTokenKey);
    if (token == null || token.isEmpty) {
      throw GoogleFitTokenExpiredException('No Google Fit access token found.');
    }
    return token;
  }

  Future<String?> _getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_googleFitRefreshTokenKey);
  }

  Future<String?> _getClientId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_googleFitClientIdKey);
  }

  Future<String?> _getClientSecret() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_googleFitClientSecretKey);
  }

  Future<void> saveAccessToken(String accessToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_googleFitTokenKey, accessToken);
  }

  Future<void> saveRefreshToken(String refreshToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_googleFitRefreshTokenKey, refreshToken);
  }

  Future<void> saveClientCredentials(String clientId, {String? clientSecret}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_googleFitClientIdKey, clientId);
    if (clientSecret != null && clientSecret.isNotEmpty) {
      await prefs.setString(_googleFitClientSecretKey, clientSecret);
    }
  }

  Future<String> refreshAccessToken({String? clientId, String? clientSecret}) async {
    final refreshToken = await _getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      throw GoogleFitTokenExpiredException('No refresh token available for Google Fit.');
    }

    final resolvedClientId = clientId ?? await _getClientId();
    if (resolvedClientId == null || resolvedClientId.isEmpty) {
      throw GoogleFitException('Google Fit client ID is required to refresh the access token.');
    }

    final resolvedClientSecret = clientSecret ?? await _getClientSecret();
    final response = await http.post(
      Uri.parse(_tokenEndpoint),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken,
        'client_id': resolvedClientId,
        if (resolvedClientSecret != null && resolvedClientSecret.isNotEmpty)
          'client_secret': resolvedClientSecret,
      },
    );

    final body = jsonDecode(response.body);
    if (response.statusCode == 401 || response.statusCode == 400) {
      throw GoogleFitTokenExpiredException(body['error_description'] ?? 'Refresh token expired or invalid.');
    }

    if (response.statusCode != 200 || body['access_token'] == null) {
      throw GoogleFitException('Failed to refresh Google Fit access token: ${response.body}');
    }

    final accessToken = body['access_token'] as String;
    await saveAccessToken(accessToken);

    if (body['refresh_token'] != null && (body['refresh_token'] as String).isNotEmpty) {
      await saveRefreshToken(body['refresh_token'] as String);
    }

    return accessToken;
  }

  Future<T> _runWithRetryOnExpiredToken<T>(
    Future<T> Function(String token) operation, {
    String? clientId,
    String? clientSecret,
  }) async {
    final token = await _getAccessToken();
    try {
      return await operation(token);
    } on GoogleFitTokenExpiredException {
      final newToken = await refreshAccessToken(clientId: clientId, clientSecret: clientSecret);
      return await operation(newToken);
    }
  }

  Future<int> fetchDailyStepCount({String? accessToken, String? clientId, String? clientSecret}) async {
    if (accessToken != null) {
      return _fetchDailyStepCount(accessToken);
    }
    return _runWithRetryOnExpiredToken(_fetchDailyStepCount, clientId: clientId, clientSecret: clientSecret);
  }

  Future<int> _fetchDailyStepCount(String token) async {
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day);
    final requestBody = {
      'aggregateBy': [
        {'dataTypeName': _stepDataType}
      ],
      'bucketByTime': {'durationMillis': 86400000},
      'startTimeMillis': startOfDay.millisecondsSinceEpoch,
      'endTimeMillis': now.millisecondsSinceEpoch,
    };

    final response = await http.post(
      Uri.parse('$_baseUrl/dataset:aggregate'),
      headers: _buildHeaders(token),
      body: jsonEncode(requestBody),
    );

    if (response.statusCode == 401 || response.statusCode == 403) {
      throw GoogleFitTokenExpiredException();
    }

    if (response.statusCode != 200) {
      throw GoogleFitException('Failed to fetch daily step count: ${response.body}');
    }

    final data = jsonDecode(response.body);
    final buckets = data['bucket'] as List<dynamic>?;
    if (buckets == null || buckets.isEmpty) {
      throw GoogleFitNoDataException('No step count data available for today.');
    }

    final stepCount = buckets
        .expand((bucket) => (bucket['dataset'] as List<dynamic>?) ?? [])
        .expand((dataset) => (dataset['point'] as List<dynamic>?) ?? [])
        .map<int>((point) {
          final value = point['value'] as List<dynamic>?;
          if (value == null || value.isEmpty) return 0;
          return value.first['intVal'] as int? ?? (value.first['fpVal'] as num?)?.toInt() ?? 0;
        })
        .fold<int>(0, (sum, item) => sum + item);

    if (stepCount == 0) {
      throw GoogleFitNoDataException('No step count readings were found for today.');
    }

    return stepCount;
  }

  Future<List<HeartRateReading>> fetchLastHeartRateReadings({String? accessToken, String? clientId, String? clientSecret}) async {
    if (accessToken != null) {
      return _fetchLastHeartRateReadings(accessToken);
    }
    return _runWithRetryOnExpiredToken(_fetchLastHeartRateReadings, clientId: clientId, clientSecret: clientSecret);
  }

  Future<List<HeartRateReading>> _fetchLastHeartRateReadings(String token) async {
    final now = DateTime.now().toUtc();
    final sevenDaysAgo = now.subtract(const Duration(days: 7));
    final dataSetId = '${sevenDaysAgo.millisecondsSinceEpoch * 1000000}-${now.millisecondsSinceEpoch * 1000000}';
    final url = '$_baseUrl/dataSources/$_heartRateDataSource/datasets/$dataSetId';

    final response = await http.get(Uri.parse(url), headers: _buildHeaders(token));

    if (response.statusCode == 401 || response.statusCode == 403) {
      throw GoogleFitTokenExpiredException();
    }

    if (response.statusCode != 200) {
      throw GoogleFitException('Failed to fetch heart rate readings: ${response.body}');
    }

    final data = jsonDecode(response.body);
    final points = (data['point'] as List<dynamic>?) ?? [];
    if (points.isEmpty) {
      throw GoogleFitNoDataException('No heart rate readings found in the selected timeframe.');
    }

    final readings = points.map<HeartRateReading>((rawPoint) {
      final timestampNanos = int.tryParse(rawPoint['startTimeNanos']?.toString() ?? '') ?? 0;
      final valueList = rawPoint['value'] as List<dynamic>?;
      final bpm = (valueList != null && valueList.isNotEmpty)
          ? (valueList.first['fpVal'] as num?)?.toDouble() ?? (valueList.first['intVal'] as int?)?.toDouble() ?? 0.0
          : 0.0;
      return HeartRateReading(
        bpm: bpm,
        time: DateTime.fromMillisecondsSinceEpoch((timestampNanos / 1000000).round(), isUtc: true).toLocal(),
      );
    }).where((reading) => reading.bpm > 0).toList();

    if (readings.isEmpty) {
      throw GoogleFitNoDataException('Heart rate data exists, but no valid BPM values were returned.');
    }

    readings.sort((a, b) => b.time.compareTo(a.time));
    return readings.take(10).toList();
  }

  Map<String, String> _buildHeaders(String token) => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
}
