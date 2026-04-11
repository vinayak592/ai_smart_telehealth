class Symptom {
  final String description;
  final List<String> extractedSymptoms;
  final String? predictedDisease;

  Symptom({required this.description, required this.extractedSymptoms, this.predictedDisease});

  factory Symptom.fromJson(Map<String, dynamic> json) {
    return Symptom(
      description: json['description'],
      extractedSymptoms: List<String>.from(json['extractedSymptoms']),
      predictedDisease: json['predictedDisease'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      'extractedSymptoms': extractedSymptoms,
      'predictedDisease': predictedDisease,
    };
  }
}