import 'package:flutter/material.dart';
import '../services/ambient_clinical_scribe_service.dart';

class AmbientClinicalScribeScreen extends StatefulWidget {
  const AmbientClinicalScribeScreen({super.key});

  @override
  State<AmbientClinicalScribeScreen> createState() => _AmbientClinicalScribeScreenState();
}

class _AmbientClinicalScribeScreenState extends State<AmbientClinicalScribeScreen> {
  final AmbientClinicalScribeService _scribeService = AmbientClinicalScribeService();
  final TextEditingController _transcriptionController = TextEditingController();
  String _soapNotes = '';
  String _patientSummary = '';
  bool _isProcessing = false;
  bool _showPatientSummary = false;

  @override
  void dispose() {
    _transcriptionController.dispose();
    super.dispose();
  }

  Future<void> _generateNotes() async {
    if (_transcriptionController.text.trim().isEmpty) return;

    setState(() {
      _isProcessing = true;
      _soapNotes = '';
    });

    await Future.delayed(const Duration(milliseconds: 400));
    final notes = _scribeService.generateSOAPNotes(_transcriptionController.text.trim());
    final summary = _scribeService.generatePatientSummary(notes);

    setState(() {
      _soapNotes = notes;
      _patientSummary = summary;
      _isProcessing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ambient Clinical Scribe'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'AI-Powered Medical Scribe',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Describe the consultation below. The AI will turn it into professional SOAP notes.',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _transcriptionController,
                maxLines: 8,
                decoration: const InputDecoration(
                  labelText: 'Consultation transcript',
                  alignLabelWithHint: true,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _generateNotes,
                  child: _isProcessing
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Generate SOAP Notes'),
                ),
              ),
              if (_soapNotes.isNotEmpty) ...[
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Generated Notes:',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    Row(
                      children: [
                        const Text('SOAP'),
                        Switch(
                          value: _showPatientSummary,
                          onChanged: (val) {
                            setState(() {
                              _showPatientSummary = val;
                            });
                          },
                        ),
                        const Text('Patient Summary'),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _showPatientSummary ? Colors.green.shade50 : Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _showPatientSummary ? Colors.green.shade200 : Colors.blue.shade200),
                  ),
                  child: Text(_showPatientSummary ? _patientSummary : _soapNotes),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('SOAP notes saved!')),
                          );
                        },
                        child: const Text('Save Notes'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          setState(() {
                            _transcriptionController.clear();
                            _soapNotes = '';
                            _patientSummary = '';
                          });
                        },
                        child: const Text('Clear'),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '📝 About SOAP Notes',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.amber,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'SOAP stands for Subjective, Objective, Assessment, Plan. It\'s the standard format for medical documentation used by healthcare professionals worldwide.',
                      style: TextStyle(fontSize: 14, color: Colors.amber),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
