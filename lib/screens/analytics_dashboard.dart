import 'package:flutter/material.dart';

import '../services/google_fit_service.dart';

class AnalyticsDashboardScreen extends StatefulWidget {
  const AnalyticsDashboardScreen({super.key});

  @override
  State<AnalyticsDashboardScreen> createState() => _AnalyticsDashboardScreenState();
}

class _AnalyticsDashboardScreenState extends State<AnalyticsDashboardScreen> {
  final GoogleFitService _googleFitService = GoogleFitService();
  int? _dailySteps;
  List<HeartRateReading>? _heartRates;
  bool _isLoadingFit = false;
  String? _fitError;

  final List<Map<String, dynamic>> _symptomHistory = [
    {'date': '2024-03-15', 'symptoms': ['fever', 'cough'], 'severity': 3},
    {'date': '2024-03-10', 'symptoms': ['headache'], 'severity': 2},
    {'date': '2024-03-05', 'symptoms': ['fatigue'], 'severity': 1},
    {'date': '2024-02-28', 'symptoms': ['sore throat'], 'severity': 2},
  ];

  final Map<String, int> _symptomFrequency = {
    'fever': 12,
    'cough': 8,
    'headache': 15,
    'fatigue': 20,
    'sore throat': 6,
    'nausea': 3,
  };

  @override
  void initState() {
    super.initState();
    _fetchGoogleFitMetrics();
  }

  Future<void> _fetchGoogleFitMetrics() async {
    setState(() {
      _isLoadingFit = true;
      _fitError = null;
    });

    try {
      final steps = await _googleFitService.fetchDailyStepCount();
      final heartRates = await _googleFitService.fetchLastHeartRateReadings();

      setState(() {
        _dailySteps = steps;
        _heartRates = heartRates;
      });
    } catch (error) {
      setState(() {
        _fitError = error.toString();
        _dailySteps = null;
        _heartRates = null;
      });
    } finally {
      setState(() {
        _isLoadingFit = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Health Analytics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Analytics report shared!')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Health Analytics Dashboard',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.teal,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'AI-powered insights into your health patterns',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 24),

            // Health Score Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    const Text(
                      'Overall Health Score',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 120,
                          height: 120,
                          child: CircularProgressIndicator(
                            value: 0.85,
                            strokeWidth: 12,
                            backgroundColor: Colors.grey[300],
                            valueColor: const AlwaysStoppedAnimation<Color>(Colors.teal),
                          ),
                        ),
                        const Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '85%',
                              style: TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: Colors.teal,
                              ),
                            ),
                            Text(
                              'Excellent',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.teal,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Google Fit Metrics
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Google Fit Metrics',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (_isLoadingFit)
                      const Center(child: CircularProgressIndicator())
                    else if (_fitError != null)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Unable to load Google Fit data.',
                            style: TextStyle(color: Colors.red[700]),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _fitError ?? '',
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ],
                      )
                    else
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Daily steps: ${_dailySteps ?? 'No data'}',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Recent heart rate readings',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 8),
                          if (_heartRates == null || _heartRates!.isEmpty)
                            const Text('No heart rate data available.', style: TextStyle(color: Colors.grey))
                          else
                            Column(
                              children: _heartRates!.map((reading) {
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${reading.bpm.toStringAsFixed(0)} bpm',
                                        style: const TextStyle(fontWeight: FontWeight.w600),
                                      ),
                                      Text(
                                        '${reading.time.hour.toString().padLeft(2, "0")}:${reading.time.minute.toString().padLeft(2, "0")}',
                                        style: const TextStyle(color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                        ],
                      ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton.icon(
                          onPressed: _fetchGoogleFitMetrics,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Refresh'),
                        ),
                        ElevatedButton.icon(
                          onPressed: () => Navigator.pushNamed(context, '/prescriptions'),
                          icon: const Icon(Icons.note_add),
                          label: const Text('Add Prescription'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Symptom Frequency Chart
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Common Symptoms',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ..._symptomFrequency.entries.map((entry) {
                      final maxValue = _symptomFrequency.values.reduce((a, b) => a > b ? a : b);
                      final percentage = entry.value / maxValue;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  entry.key,
                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                ),
                                Text(
                                  '${entry.value} times',
                                  style: const TextStyle(color: Colors.grey),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            LinearProgressIndicator(
                              value: percentage,
                              backgroundColor: Colors.grey[300],
                              valueColor: const AlwaysStoppedAnimation<Color>(Colors.teal),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Recent Consultations
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Recent Symptom Analysis',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ..._symptomHistory.map((record) {
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: _getSeverityColor(record['severity']),
                          child: Text(
                            record['severity'].toString(),
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                        title: Text(
                          record['symptoms'].join(', '),
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                        subtitle: Text(record['date']),
                        trailing: Icon(
                          _getSeverityIcon(record['severity']),
                          color: _getSeverityColor(record['severity']),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // AI Insights
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'AI Health Insights',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildInsightCard(
                      'Pattern Detected',
                      'You tend to experience more symptoms during winter months. Consider boosting your immune system with vitamin C and regular exercise.',
                      Icons.trending_up,
                      Colors.blue,
                    ),
                    const SizedBox(height: 12),
                    _buildInsightCard(
                      'Improvement Trend',
                      'Your symptom frequency has decreased by 30% over the last month. Keep up the healthy habits!',
                      Icons.thumb_up,
                      Colors.green,
                    ),
                    const SizedBox(height: 12),
                    _buildInsightCard(
                      'Preventive Care',
                      'Based on your history, consider scheduling regular check-ups for cardiovascular health.',
                      Icons.health_and_safety,
                      Colors.orange,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Advanced AI Features
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Advanced AI Features',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        _buildFeatureButton(
                          'Skin Lesion Scanner',
                          Icons.camera_alt,
                          Colors.purple,
                          () => Navigator.pushNamed(context, '/skin-lesion'),
                        ),
                        _buildFeatureButton(
                          'Gait Analysis',
                          Icons.directions_walk,
                          Colors.blue,
                          () => Navigator.pushNamed(context, '/gait-analysis'),
                        ),
                        _buildFeatureButton(
                          'Clinical Scribe',
                          Icons.mic,
                          Colors.green,
                          () => Navigator.pushNamed(context, '/clinical-scribe'),
                        ),
                        _buildFeatureButton(
                          'Live Translation',
                          Icons.translate,
                          Colors.orange,
                          () => Navigator.pushNamed(context, '/translation'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor(int severity) {
    switch (severity) {
      case 1:
        return Colors.green;
      case 2:
        return Colors.yellow[700]!;
      case 3:
        return Colors.orange;
      case 4:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getSeverityIcon(int severity) {
    switch (severity) {
      case 1:
        return Icons.sentiment_satisfied;
      case 2:
        return Icons.sentiment_neutral;
      case 3:
        return Icons.sentiment_dissatisfied;
      case 4:
        return Icons.warning;
      default:
        return Icons.help;
    }
  }

  Widget _buildFeatureButton(String title, IconData icon, Color color, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 32),
          const SizedBox(height: 8),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildInsightCard(String title, String description, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}