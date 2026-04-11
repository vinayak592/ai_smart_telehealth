import 'package:flutter/material.dart';

class MedicationTrackerScreen extends StatefulWidget {
  const MedicationTrackerScreen({super.key});

  @override
  State<MedicationTrackerScreen> createState() => _MedicationTrackerScreenState();
}

class _MedicationTrackerScreenState extends State<MedicationTrackerScreen> {
  final List<Map<String, dynamic>> _medications = [];
  final _nameController = TextEditingController();
  final _dosageController = TextEditingController();
  final _frequencyController = TextEditingController();

  void _addMedication() {
    if (_nameController.text.isEmpty || _dosageController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in medication name and dosage')),
      );
      return;
    }

    setState(() {
      _medications.add({
        'name': _nameController.text,
        'dosage': _dosageController.text,
        'frequency': _frequencyController.text.isEmpty ? 'As needed' : _frequencyController.text,
        'nextDose': DateTime.now().add(const Duration(hours: 8)),
        'taken': false,
      });
    });

    _nameController.clear();
    _dosageController.clear();
    _frequencyController.clear();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Medication added successfully!')),
    );
  }

  void _markAsTaken(int index) {
    setState(() {
      _medications[index]['taken'] = !_medications[index]['taken'];
      if (_medications[index]['taken']) {
        _medications[index]['nextDose'] = DateTime.now().add(const Duration(hours: 8));
      }
    });
  }

  void _deleteMedication(int index) {
    setState(() {
      _medications.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Medication Tracker'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Reminder notifications coming soon!')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Add Medication Form
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Add New Medication',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Medication Name',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _dosageController,
                    decoration: const InputDecoration(
                      labelText: 'Dosage (e.g., 500mg)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _frequencyController,
                    decoration: const InputDecoration(
                      labelText: 'Frequency (e.g., Twice daily)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _addMedication,
                      icon: const Icon(Icons.add),
                      label: const Text('Add Medication'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Medications List
          Expanded(
            child: _medications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.medical_services, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'No medications added yet',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                        Text(
                          'Add your first medication above',
                          style: TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _medications.length,
                    itemBuilder: (context, index) {
                      final med = _medications[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: med['taken'] ? Colors.green : Colors.teal,
                            child: Icon(
                              med['taken'] ? Icons.check : Icons.medication,
                              color: Colors.white,
                            ),
                          ),
                          title: Text(
                            med['name'],
                            style: TextStyle(
                              decoration: med['taken'] ? TextDecoration.lineThrough : null,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${med['dosage']} • ${med['frequency']}'),
                              Text(
                                'Next dose: ${_formatDateTime(med['nextDose'])}',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: Icon(
                                  med['taken'] ? Icons.undo : Icons.check_circle,
                                  color: med['taken'] ? Colors.grey : Colors.green,
                                ),
                                onPressed: () => _markAsTaken(index),
                                tooltip: med['taken'] ? 'Mark as not taken' : 'Mark as taken',
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _deleteMedication(index),
                                tooltip: 'Delete medication',
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = dateTime.difference(now);

    if (difference.isNegative) {
      return 'Overdue';
    } else if (difference.inHours < 1) {
      return 'In ${difference.inMinutes} minutes';
    } else if (difference.inHours < 24) {
      return 'In ${difference.inHours} hours';
    } else {
      return '${dateTime.day}/${dateTime.month} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
    }
  }
}