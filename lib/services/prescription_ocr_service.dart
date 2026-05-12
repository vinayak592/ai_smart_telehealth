import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class PrescriptionRecord {
  final int? id;
  final String drugName;
  final String dosage;
  final String frequency;
  final DateTime createdAt;

  PrescriptionRecord({
    this.id,
    required this.drugName,
    required this.dosage,
    required this.frequency,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'drug_name': drugName,
      'dosage': dosage,
      'frequency': frequency,
      'created_at': createdAt.toIso8601String(),
    };
  }

  factory PrescriptionRecord.fromMap(Map<String, dynamic> map) {
    return PrescriptionRecord(
      id: map['id'] as int?,
      drugName: map['drug_name'] as String,
      dosage: map['dosage'] as String,
      frequency: map['frequency'] as String,
      createdAt: DateTime.parse(map['created_at'] as String),
    );
  }
}

class PrescriptionOcrService {
  static const _storageKey = 'prescriptions';
  static const _googleVisionUrl = 'https://vision.googleapis.com/v1/images:annotate';

  Future<SharedPreferences> _getPrefs() async {
    return await SharedPreferences.getInstance();
  }

  Future<void> closeDatabase() async {
    // No-op for shared_preferences
  }

  Future<PrescriptionRecord> savePrescription(PrescriptionRecord record) async {
    final prefs = await _getPrefs();
    final records = await getAllPrescriptions();
    final id = records.isNotEmpty ? records.map((r) => r.id ?? 0).reduce((a, b) => a > b ? a : b) + 1 : 1;
    final newRecord = PrescriptionRecord(
      id: id,
      drugName: record.drugName,
      dosage: record.dosage,
      frequency: record.frequency,
      createdAt: record.createdAt,
    );
    records.add(newRecord);
    final jsonList = records.map((r) => r.toMap()).toList();
    await prefs.setString(_storageKey, jsonEncode(jsonList));
    return newRecord;
  }

  Future<List<PrescriptionRecord>> getAllPrescriptions() async {
    final prefs = await _getPrefs();
    final jsonString = prefs.getString(_storageKey);
    if (jsonString == null) return [];
    final jsonList = jsonDecode(jsonString) as List<dynamic>;
    return jsonList.map((json) => PrescriptionRecord.fromMap(json)).toList();
  }

  Map<String, String> _parsePrescriptionText(String text) {
    final normalizedText = text.replaceAll('\r', '\n');

    final drugName = _extractField(
      normalizedText,
      patterns: [
        r'(?mi)drug\s*name\s*[:\-]?\s*(.+)',
        r'(?mi)medicine\s*[:\-]?\s*(.+)',
        r'(?mi)^\s*([A-Za-z0-9]+(?:[\s-][A-Za-z0-9]+){0,5})\s*(?=\n|\r|$)',
      ],
    );

    final dosage = _extractField(
      normalizedText,
      patterns: [
        r'(?mi)(?:dosage|dose|strength)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg|ml|mcg|g|iu|tablet|capsule)s?)',
        r'(?mi)take\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg|ml|mcg|g|iu|tablet|capsule))',
        r'(?mi)([0-9]+(?:\.[0-9]+)?\s*(?:mg|ml|mcg|g|iu))',
      ],
    );

    final frequency = _extractField(
      normalizedText,
      patterns: [
        r'(?mi)(?:frequency|schedule|sig)\s*[:\-]?\s*(.+)',
        r'(?mi)(?:once daily|twice daily|three times daily|four times daily|every \d+ hours|bid|tid|qid|as needed|prn|daily|morning|night)',
      ],
    );

    return {
      'drug_name': drugName.isNotEmpty ? drugName : 'Unknown Drug',
      'dosage': dosage.isNotEmpty ? dosage : 'Unknown Dosage',
      'frequency': frequency.isNotEmpty ? frequency : 'Unknown Frequency',
    };
  }

  String _extractField(String text, {required List<String> patterns}) {
    for (final pattern in patterns) {
      final regex = RegExp(pattern, multiLine: true);
      final match = regex.firstMatch(text);
      if (match != null && match.groupCount >= 1) {
        return match.group(1)?.trim() ?? '';
      }
    }
    return '';
  }
}
