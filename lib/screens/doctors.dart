import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DoctorsScreen extends StatefulWidget {
  const DoctorsScreen({super.key});

  @override
  _DoctorsScreenState createState() => _DoctorsScreenState();
}

class _DoctorsScreenState extends State<DoctorsScreen> {
  List<Map<String, dynamic>> _doctors = [];
  List<Map<String, dynamic>> _filteredDoctors = [];
  bool _isLoading = true;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadDoctors();
    _searchController.addListener(_filterDoctors);
  }

  void _loadDoctors() async {
    try {
      final doctors = await ApiService().getDoctors();
      setState(() => _doctors = doctors);
    } catch (e) {
      // Fallback to mock doctors
      _doctors = [
        {'name': 'Dr. John Doe', 'specialty': 'General Medicine', 'rating': 4.5, 'experience': '10 years'},
        {'name': 'Dr. Jane Smith', 'specialty': 'Cardiology', 'rating': 4.8, 'experience': '15 years'},
        {'name': 'Dr. Bob Johnson', 'specialty': 'Dermatology', 'rating': 4.2, 'experience': '8 years'},
        {'name': 'Dr. Alice Brown', 'specialty': 'Pediatrics', 'rating': 4.7, 'experience': '12 years'},
      ];
      _filteredDoctors = _doctors;
    }
    setState(() {
      _isLoading = false;
      if (_filteredDoctors.isEmpty) _filteredDoctors = _doctors;
    });
  }

  @override
  void dispose() {
    _searchController.removeListener(_filterDoctors);
    _searchController.dispose();
    super.dispose();
  }

  void _filterDoctors() {
    final query = _searchController.text.toLowerCase().trim();
    setState(() {
      _filteredDoctors = _doctors
          .where((doc) =>
              doc['name'].toString().toLowerCase().contains(query) ||
              doc['specialty'].toString().toLowerCase().contains(query))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Available Doctors')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search doctors by name or specialty',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: _filteredDoctors.isEmpty
                      ? Center(
                          child: Text(
                            'No doctors found. Try another search.',
                            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.only(bottom: 16),
                          itemCount: _filteredDoctors.length,
                          itemBuilder: (context, index) {
                            final doctor = _filteredDoctors[index];
                            return Card(
                              margin: const EdgeInsets.all(8.0),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: Colors.teal,
                                  child: Text(doctor['name'].split(' ')[1][0], style: const TextStyle(color: Colors.white)),
                                ),
                                title: Text(doctor['name']),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(doctor['specialty']),
                                    Row(
                                      children: [
                                        const Icon(Icons.star, color: Colors.amber, size: 16),
                                        const SizedBox(width: 4),
                                        Text('${doctor['rating']} • ${doctor['experience']}'),
                                      ],
                                    ),
                                  ],
                                ),
                                trailing: ElevatedButton(
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Connecting to ${doctor['name']}')));
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.teal,
                                  ),
                                  child: const Text('Connect'),
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
}