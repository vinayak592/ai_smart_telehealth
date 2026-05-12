import 'package:flutter/material.dart';
import '../services/gait_mobility_analysis_service.dart';

class GaitMobilityAnalysisScreen extends StatefulWidget {
  const GaitMobilityAnalysisScreen({super.key});

  @override
  State<GaitMobilityAnalysisScreen> createState() => _GaitMobilityAnalysisScreenState();
}

class _GaitMobilityAnalysisScreenState extends State<GaitMobilityAnalysisScreen> {
  final GaitMobilityAnalysisService _analysisService = GaitMobilityAnalysisService();
  bool _isInitialized = false;
  bool _isAnalyzing = false;
  GaitAnalysisResult? _analysisResult;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initializeService();
  }

  @override
  void dispose() {
    _analysisService.dispose();
    super.dispose();
  }

  Future<void> _initializeService() async {
    try {
      await _analysisService.initialize();
      setState(() => _isInitialized = true);
    } catch (e) {
      setState(() => _error = 'Service initialization failed: $e');
    }
  }

  Future<void> _startAnalysis() async {
    setState(() {
      _isAnalyzing = true;
      _analysisResult = null;
      _error = null;
    });

    try {
      final result = await _analysisService.analyzeMovement();
      setState(() => _analysisResult = result);
    } catch (e) {
      setState(() => _error = 'Analysis failed: $e');
    } finally {
      setState(() => _isAnalyzing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gait & Mobility Analysis'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'AI Movement Analysis',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Position yourself in front of the camera and perform a simple movement (walk in place or squat). The AI will analyze your posture and mobility.',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _error!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            if (_isInitialized) ...[
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey),
                ),
                child: const Center(
                  child: Text(
                    'Web preview unavailable. The analysis is simulated for demonstration.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isAnalyzing ? null : _startAnalysis,
                  child: _isAnalyzing
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Start Simulation'),
                ),
              ),
            ] else ...[
              const Center(
                child: Column(
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Initializing movement analysis...'),
                  ],
                ),
              ),
            ],
            if (_analysisResult != null) ...[
              const SizedBox(height: 24),
              const Text(
                'Analysis Result:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.accessibility, color: Colors.teal),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Posture: ${_analysisResult!.postureAssessment}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.score, color: Colors.orange),
                          const SizedBox(width: 8),
                          Text(
                            'Mobility Score: ${_analysisResult!.mobilityScore}',
                            style: const TextStyle(fontSize: 16),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Recommendations:',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ..._analysisResult!.recommendations.map(
                        (rec) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('• ', style: TextStyle(fontSize: 16)),
                              Expanded(
                                child: Text(rec, style: const TextStyle(fontSize: 16)),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🏃 About Movement Analysis',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'This AI uses computer vision to analyze your movement patterns, posture, and gait. It can help identify potential mobility issues early and provide personalized recommendations.',
                    style: TextStyle(fontSize: 14, color: Colors.green),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}