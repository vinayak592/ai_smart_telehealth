import 'package:flutter/material.dart';

import '../services/prescription_ocr_service.dart';

class PrescriptionEntryScreen extends StatefulWidget {
  const PrescriptionEntryScreen({super.key});

  @override
  State<PrescriptionEntryScreen> createState() => _PrescriptionEntryScreenState();
}

class _PrescriptionEntryScreenState extends State<PrescriptionEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _drugController = TextEditingController();
  final _dosageController = TextEditingController();
  final _frequencyController = TextEditingController();
  final PrescriptionOcrService _ocrService = PrescriptionOcrService();
  bool _isSaving = false;
  String? _error;
  List<PrescriptionRecord> _records = [];

  @override
  void initState() {
    super.initState();
    _loadRecords();
  }

  @override
  void dispose() {
    _drugController.dispose();
    _dosageController.dispose();
    _frequencyController.dispose();
    super.dispose();
  }

  Future<void> _loadRecords() async {
    try {
      final records = await _ocrService.getAllPrescriptions();
      setState(() => _records = records);
    } catch (error) {
      setState(() => _error = error.toString());
    }
  }

  Future<void> _savePrescription() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSaving = true;
      _error = null;
    });

    try {
      final record = PrescriptionRecord(
        drugName: _drugController.text.trim(),
        dosage: _dosageController.text.trim(),
        frequency: _frequencyController.text.trim(),
      );
      await _ocrService.savePrescription(record);
      await _loadRecords();
      _drugController.clear();
      _dosageController.clear();
      _frequencyController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Prescription saved.')),
        );
      }
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Prescription Entry'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Capture Prescription Details',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const Text(
              'Enter the drug name, dosage, and frequency to save the prescription locally.',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _drugController,
                    decoration: const InputDecoration(labelText: 'Drug Name'),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Enter the drug name.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _dosageController,
                    decoration: const InputDecoration(labelText: 'Dosage'),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Enter the dosage.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _frequencyController,
                    decoration: const InputDecoration(labelText: 'Frequency'),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Enter the frequency.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _savePrescription,
                      child: _isSaving
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Save Prescription'),
                    ),
                  ),
                ],
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red),
              ),
            ],
            const SizedBox(height: 32),
            const Text(
              'Saved Prescriptions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (_records.isEmpty)
              const Text('No saved prescriptions yet.', style: TextStyle(color: Colors.grey))
            else
              Column(
                children: _records.map((record) {
                  return Card(
                    child: ListTile(
                      title: Text(record.drugName),
                      subtitle: Text('${record.dosage} • ${record.frequency}'),
                      trailing: Text(
                        record.createdAt.toLocal().toString().split(' ')[0],
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }
}
