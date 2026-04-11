import 'package:flutter/material.dart';

class HospitalFacilitiesScreen extends StatelessWidget {
  const HospitalFacilitiesScreen({super.key});

  static final Map<String, Map<String, dynamic>> _facilities = {
    'General Ward': {
      'beds': 78,
      'ventilators': 6,
      'icu': 8,
      'doctors': 12,
      'nurses': 24,
    },
    'ICU': {
      'beds': 12,
      'ventilators': 9,
      'icu': 12,
      'doctors': 8,
      'nurses': 16,
    },
    'Maternity': {
      'beds': 30,
      'ventilators': 2,
      'icu': 2,
      'doctors': 6,
      'nurses': 12,
    },
    'Pediatrics': {
      'beds': 25,
      'ventilators': 3,
      'icu': 1,
      'doctors': 5,
      'nurses': 10,
    },
    'Cardiology': {
      'beds': 20,
      'ventilators': 4,
      'icu': 3,
      'doctors': 7,
      'nurses': 8,
    },
    'Neurology': {
      'beds': 18,
      'ventilators': 2,
      'icu': 2,
      'doctors': 6,
      'nurses': 7,
    },
    'Emergency': {
      'beds': 40,
      'ventilators': 8,
      'icu': 5,
      'doctors': 15,
      'nurses': 20,
    },
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hospital Facilities'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(14),
        children: _facilities.entries.map((entry) {
          final name = entry.key;
          final data = entry.value;
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(_getDepartmentIcon(name), color: _getDepartmentColor(name), size: 28),
                      const SizedBox(width: 10),
                      Text(
                        name,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 16,
                    runSpacing: 12,
                    children: [
                      _FacilityStat(label: 'Available Beds', value: data['beds'], icon: Icons.hotel),
                      _FacilityStat(label: 'Ventilators', value: data['ventilators'], icon: Icons.air),
                      _FacilityStat(label: 'ICU Points', value: data['icu'], icon: Icons.monitor_heart),
                      _FacilityStat(label: 'Doctors', value: data['doctors'], icon: Icons.medical_services),
                      _FacilityStat(label: 'Nurses', value: data['nurses'], icon: Icons.person),
                    ],
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  IconData _getDepartmentIcon(String dept) {
    switch (dept) {
      case 'Cardiology':
        return Icons.favorite;
      case 'Neurology':
        return Icons.psychology;
      case 'Maternity':
        return Icons.pregnant_woman;
      case 'Pediatrics':
        return Icons.child_friendly;
      case 'Emergency':
        return Icons.emergency;
      case 'ICU':
        return Icons.monitor_heart;
      default:
        return Icons.local_hospital;
    }
  }

  Color _getDepartmentColor(String dept) {
    switch (dept) {
      case 'Cardiology':
        return Colors.red;
      case 'Neurology':
        return Colors.purple;
      case 'Maternity':
        return Colors.pink;
      case 'Pediatrics':
        return Colors.orange;
      case 'Emergency':
        return Colors.redAccent;
      case 'ICU':
        return Colors.blue;
      default:
        return Colors.teal;
    }
  }
}

class _FacilityStat extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;

  const _FacilityStat({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: Colors.grey[600]),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        const SizedBox(height: 4),
        Text('$value', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
