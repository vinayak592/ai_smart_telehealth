import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _notesController = TextEditingController();

  String _selectedDepartment = 'General Ward';
  final departments = ['General Ward', 'ICU', 'Maternity', 'Pediatrics', 'Cardiology', 'Neurology', 'Emergency'];
  List<Map<String, dynamic>> _bookings = [];

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    final prefs = await SharedPreferences.getInstance();
    final bookingsJson = prefs.getStringList('bookings') ?? [];
    setState(() {
      _bookings = bookingsJson
          .map((booking) => jsonDecode(booking) as Map<String, dynamic>)
          .toList();
    });
  }

  Future<void> _saveBooking() async {
    if (_nameController.text.isEmpty || _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    final booking = {
      'name': _nameController.text,
      'phone': _phoneController.text,
      'department': _selectedDepartment,
      'notes': _notesController.text,
      'date': DateTime.now().toString(),
      'status': 'Pending',
    };

    final prefs = await SharedPreferences.getInstance();
    final bookings = prefs.getStringList('bookings') ?? [];
    bookings.add(jsonEncode(booking));
    await prefs.setStringList('bookings', bookings);

    _nameController.clear();
    _phoneController.clear();
    _notesController.clear();

    _loadBookings();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Booking saved successfully!'), backgroundColor: Colors.green),
    );
  }

  Future<void> _deleteBooking(int index) async {
    final prefs = await SharedPreferences.getInstance();
    final bookings = prefs.getStringList('bookings') ?? [];
    bookings.removeAt(index);
    await prefs.setStringList('bookings', bookings);
    _loadBookings();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Hospital Bookings'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'New Booking'),
              Tab(text: 'My Bookings'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // New Booking Tab
            SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Patient Name', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      hintText: 'Enter your full name',
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Phone Number', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _phoneController,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      hintText: 'Enter phone number',
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Select Department', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  DropdownButton<String>(
                    value: _selectedDepartment,
                    isExpanded: true,
                    items: departments.map((dept) {
                      return DropdownMenuItem(value: dept, child: Text(dept));
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedDepartment = value ?? 'General Ward';
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  const Text('Additional Notes', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _notesController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      hintText: 'Any special requests or medical conditions',
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _saveBooking,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: Colors.teal,
                      ),
                      child: const Text('Confirm Booking', style: TextStyle(fontSize: 16, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
            // My Bookings Tab
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _bookings.length,
              itemBuilder: (context, index) {
                final booking = _bookings[_bookings.length - 1 - index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(booking['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                Text(booking['department'], style: const TextStyle(color: Colors.grey)),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.orange[100],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                booking['status'],
                                style: TextStyle(color: Colors.orange[700], fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Phone: ${booking['phone']}', style: const TextStyle(fontSize: 12)),
                        if (booking['notes'].isNotEmpty)
                          Text('Notes: ${booking['notes']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                        Text('Booked: ${booking['date'].toString().split('.')[0]}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () => _deleteBooking(_bookings.length - 1 - index),
                            child: const Text('Cancel Booking', style: TextStyle(color: Colors.red)),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
