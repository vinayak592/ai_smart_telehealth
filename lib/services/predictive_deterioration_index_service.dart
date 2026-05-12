import '../services/google_fit_service.dart';

class PredictiveDeteriorationIndexService {
  final GoogleFitService _fitService = GoogleFitService();

  Future<Map<String, dynamic>> calculateDeteriorationIndex() async {
    try {
      final heartRates = await _fitService.fetchLastHeartRateReadings();
      final steps = await _fitService.fetchDailyStepCount();

      if (heartRates.isEmpty) {
        return {'index': 0.0, 'message': 'Insufficient data for analysis.'};
      }

      // Simple trend analysis: Average heart rate over last readings
      final avgHeartRate = heartRates.map((r) => r.bpm).reduce((a, b) => a + b) / heartRates.length;

      // If heart rate > 80 and steps < 5000, flag as potential deterioration
      double index = 0.0;
      String message = 'Your health metrics look stable.';

      if (avgHeartRate > 80) {
        index += 0.5;
      }
      if (steps < 5000) {
        index += 0.3;
      }

      if (index > 0.6) {
        message = 'Your data suggests high stress or early illness. Consider a rest day.';
      } else if (index > 0.3) {
        message = 'Monitor your activity levels.';
      }

      return {
        'index': index.clamp(0.0, 1.0),
        'message': message,
        'avgHeartRate': avgHeartRate,
        'dailySteps': steps,
      };
    } catch (e) {
      return {'index': 0.0, 'message': 'Unable to analyze data: $e'};
    }
  }
}
