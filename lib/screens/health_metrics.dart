import 'package:flutter/material.dart';

class HealthMetricsScreen extends StatefulWidget {
  const HealthMetricsScreen({super.key});

  @override
  State<HealthMetricsScreen> createState() => _HealthMetricsScreenState();
}

class _HealthMetricsScreenState extends State<HealthMetricsScreen> {
  final Map<String, double> _metrics = {
    'Heart Rate': 72.0,
    'Blood Pressure Systolic': 120.0,
    'Blood Pressure Diastolic': 80.0,
    'Temperature': 98.6,
    'Oxygen Saturation': 98.0,
    'Weight': 70.0,
    'Height': 170.0,
  };

  final Map<String, String> _units = {
    'Heart Rate': 'BPM',
    'Blood Pressure Systolic': 'mmHg',
    'Blood Pressure Diastolic': 'mmHg',
    'Temperature': '°F',
    'Oxygen Saturation': '%',
    'Weight': 'kg',
    'Height': 'cm',
  };

  void _updateMetric(String key, double value) {
    setState(() {
      _metrics[key] = value;
    });
  }

  Color _getMetricColor(String key, double value) {
    switch (key) {
      case 'Heart Rate':
        return (value >= 60 && value <= 100) ? Colors.green : Colors.red;
      case 'Blood Pressure Systolic':
        return (value >= 90 && value <= 140) ? Colors.green : Colors.red;
      case 'Blood Pressure Diastolic':
        return (value >= 60 && value <= 90) ? Colors.green : Colors.red;
      case 'Temperature':
        return (value >= 97 && value <= 99) ? Colors.green : Colors.red;
      case 'Oxygen Saturation':
        return value >= 95 ? Colors.green : Colors.red;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Health Metrics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              // Simulate updating metrics
              setState(() {
                _metrics['Heart Rate'] = 65 + (10 * (DateTime.now().second % 5));
                _metrics['Temperature'] = 97.5 + (1.5 * (DateTime.now().second % 3));
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Metrics updated!')),
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
              'Real-time Health Monitoring',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.teal,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Track your vital signs and health metrics',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 24),

            // BMI Calculator
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'BMI Calculator',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'BMI: ${(703 * _metrics['Weight']! / (_metrics['Height']! * _metrics['Height']!)).toStringAsFixed(1)}',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.teal,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            'Normal',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Vital Signs Grid
            const Text(
              'Vital Signs',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: _metrics.entries.map((entry) {
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          entry.key,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${entry.value.toStringAsFixed(1)} ${_units[entry.key]}',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: _getMetricColor(entry.key, entry.value),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Slider(
                          value: entry.value,
                          min: entry.key.contains('Blood Pressure') ? 60 : 50,
                          max: entry.key.contains('Blood Pressure') ? 200 : 150,
                          onChanged: (value) => _updateMetric(entry.key, value),
                          activeColor: _getMetricColor(entry.key, entry.value),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 24),

            // Health Insights
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
                    _buildInsight(
                      'Cardiovascular Health',
                      'Your heart rate and blood pressure are within normal ranges.',
                      Icons.favorite,
                      Colors.red,
                    ),
                    const SizedBox(height: 12),
                    _buildInsight(
                      'Temperature',
                      'Body temperature is normal. No signs of fever.',
                      Icons.thermostat,
                      Colors.orange,
                    ),
                    const SizedBox(height: 12),
                    _buildInsight(
                      'Respiratory Health',
                      'Oxygen saturation levels are excellent.',
                      Icons.air,
                      Colors.blue,
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

  Widget _buildInsight(String title, String description, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              Text(
                description,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}