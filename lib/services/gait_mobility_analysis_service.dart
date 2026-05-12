class GaitAnalysisResult {
  final String postureAssessment;
  final String mobilityScore;
  final List<String> recommendations;

  GaitAnalysisResult({
    required this.postureAssessment,
    required this.mobilityScore,
    required this.recommendations,
  });
}

class GaitMobilityAnalysisService {
  Future<void> initialize() async {
    await Future.delayed(const Duration(milliseconds: 100));
  }

  Future<GaitAnalysisResult> analyzeMovement() async {
    await Future.delayed(const Duration(seconds: 2));

    final mockResults = [
      GaitAnalysisResult(
        postureAssessment: 'Good posture maintained',
        mobilityScore: '8/10',
        recommendations: [
          'Continue current exercise routine',
          'Consider adding balance exercises',
        ],
      ),
      GaitAnalysisResult(
        postureAssessment: 'Slight forward lean detected',
        mobilityScore: '6/10',
        recommendations: [
          'Work on core strengthening exercises',
          'Practice standing with proper alignment',
          'Consider physical therapy consultation',
        ],
      ),
      GaitAnalysisResult(
        postureAssessment: 'Limp detected in right leg',
        mobilityScore: '4/10',
        recommendations: [
          'Immediate medical evaluation recommended',
          'Avoid weight-bearing activities',
          'Use assistive device if needed',
        ],
      ),
    ];

    final randomIndex = DateTime.now().millisecondsSinceEpoch % mockResults.length;
    return mockResults[randomIndex];
  }

  void dispose() {}
}