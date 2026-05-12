import 'package:image_picker/image_picker.dart';

class SkinLesionAnalysisResult {
  final String riskLevel;
  final double confidence;
  final String recommendation;

  SkinLesionAnalysisResult({
    required this.riskLevel,
    required this.confidence,
    required this.recommendation,
  });
}

class SkinLesionScannerService {
  Future<void> loadModel() async {
    // No real model is loaded for the web demo.
    // This method is kept for compatibility with the screen lifecycle.
    await Future<void>.delayed(const Duration(milliseconds: 200));
  }

  Future<SkinLesionAnalysisResult> analyzeImage(XFile imageFile) async {
    await Future.delayed(const Duration(seconds: 2));

    final results = [
      SkinLesionAnalysisResult(
        riskLevel: 'Low Risk',
        confidence: 0.85,
        recommendation: 'Monitor the lesion. No urgent action needed, but consult a dermatologist if the lesion changes.',
      ),
      SkinLesionAnalysisResult(
        riskLevel: 'Medium Risk',
        confidence: 0.72,
        recommendation: 'Schedule a dermatologist review within a few weeks for a closer evaluation.',
      ),
      SkinLesionAnalysisResult(
        riskLevel: 'High Risk',
        confidence: 0.91,
        recommendation: 'Seek medical attention promptly. The lesion shows signs that should be reviewed immediately.',
      ),
    ];

    final randomIndex = DateTime.now().millisecondsSinceEpoch % results.length;
    return results[randomIndex];
  }

  void dispose() {}
}