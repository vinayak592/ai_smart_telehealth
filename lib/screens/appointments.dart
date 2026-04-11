import 'package:flutter/material.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  _AppointmentsScreenState createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> with TickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _upcomingAppointments = [
    {
      'doctor': 'Dr. Sarah Johnson',
      'specialty': 'Cardiologist',
      'date': '2026-03-25',
      'time': '10:00 AM',
      'type': 'Consultation',
      'status': 'confirmed',
      'image': '👩‍⚕️'
    },
    {
      'doctor': 'Dr. Michael Chen',
      'specialty': 'Dermatologist',
      'date': '2026-03-28',
      'time': '2:30 PM',
      'type': 'Follow-up',
      'status': 'confirmed',
      'image': '👨‍⚕️'
    },
  ];

  final List<Map<String, dynamic>> _pastAppointments = [
    {
      'doctor': 'Dr. Emily Davis',
      'specialty': 'General Physician',
      'date': '2026-03-15',
      'time': '11:00 AM',
      'type': 'Check-up',
      'status': 'completed',
      'image': '👩‍⚕️'
    },
    {
      'doctor': 'Dr. Robert Wilson',
      'specialty': 'Orthopedic',
      'date': '2026-03-10',
      'time': '3:00 PM',
      'type': 'Consultation',
      'status': 'completed',
      'image': '👨‍⚕️'
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _bookNewAppointment() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AppointmentBookingSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF667EEA),
              Color(0xFF764BA2),
              Color(0xFFF093FB),
              Color(0xFFF5576C),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.arrow_back, color: Colors.white),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'My Appointments',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Text(
                        '${_upcomingAppointments.length}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Tab Bar
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: Colors.white70,
                  tabs: const [
                    Tab(text: 'Upcoming'),
                    Tab(text: 'History'),
                  ],
                ),
              ),

              // Tab Content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildAppointmentsList(_upcomingAppointments, true),
                    _buildAppointmentsList(_pastAppointments, false),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: Container(
        height: 60,
        width: 60,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
          ),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 10,
              spreadRadius: 2,
            ),
          ],
        ),
        child: FloatingActionButton(
          onPressed: _bookNewAppointment,
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: const Icon(
            Icons.add,
            size: 30,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildAppointmentsList(List<Map<String, dynamic>> appointments, bool isUpcoming) {
    if (appointments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isUpcoming ? Icons.calendar_today : Icons.history,
              size: 80,
              color: Colors.white.withOpacity(0.5),
            ),
            const SizedBox(height: 20),
            Text(
              isUpcoming ? 'No upcoming appointments' : 'No appointment history',
              style: TextStyle(
                fontSize: 18,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
            if (isUpcoming) ...[
              const SizedBox(height: 10),
              Text(
                'Book your first appointment!',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.5),
                ),
              ),
            ],
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: appointments.length,
      itemBuilder: (context, index) {
        final appointment = appointments[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 15),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: isUpcoming ? Colors.green.withOpacity(0.2) : Colors.grey.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Text(
                  appointment['image'],
                  style: const TextStyle(fontSize: 30),
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      appointment['doctor'],
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      appointment['specialty'],
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          size: 16,
                          color: Colors.white.withOpacity(0.7),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          '${appointment['date']} at ${appointment['time']}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isUpcoming ? Colors.green.withOpacity(0.3) : Colors.blue.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            appointment['type'],
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isUpcoming ? Colors.orange.withOpacity(0.3) : Colors.grey.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            appointment['status'],
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (isUpcoming)
                PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'reschedule') {
                      // Handle reschedule
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Reschedule feature coming soon!')),
                      );
                    } else if (value == 'cancel') {
                      setState(() {
                        appointments.removeAt(index);
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Appointment cancelled')),
                      );
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'reschedule',
                      child: Text('Reschedule'),
                    ),
                    const PopupMenuItem(
                      value: 'cancel',
                      child: Text('Cancel'),
                    ),
                  ],
                  icon: const Icon(
                    Icons.more_vert,
                    color: Colors.white,
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class AppointmentBookingSheet extends StatefulWidget {
  const AppointmentBookingSheet({super.key});

  @override
  _AppointmentBookingSheetState createState() => _AppointmentBookingSheetState();
}

class _AppointmentBookingSheetState extends State<AppointmentBookingSheet> {
  String? selectedSpecialty;
  String? selectedDoctor;
  DateTime? selectedDate;
  String? selectedTime;

  final List<String> specialties = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Orthopedic',
    'Dentist',
    'Ophthalmologist',
  ];

  final Map<String, List<String>> doctors = {
    'General Physician': ['Dr. Sarah Johnson', 'Dr. Michael Chen'],
    'Cardiologist': ['Dr. Emily Davis', 'Dr. Robert Wilson'],
    'Dermatologist': ['Dr. Lisa Brown', 'Dr. David Lee'],
    'Orthopedic': ['Dr. James Miller', 'Dr. Anna Garcia'],
    'Dentist': ['Dr. Thomas Anderson', 'Dr. Maria Rodriguez'],
    'Ophthalmologist': ['Dr. Kevin White', 'Dr. Sophia Martinez'],
  };

  final List<String> timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(25),
          topRight: Radius.circular(25),
        ),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
              ),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(25),
                topRight: Radius.circular(25),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Book Appointment',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white),
                ),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Specialty Selection
                  const Text(
                    'Select Specialty',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF667EEA),
                    ),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: selectedSpecialty,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                    items: specialties.map((specialty) {
                      return DropdownMenuItem(
                        value: specialty,
                        child: Text(specialty),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        selectedSpecialty = value;
                        selectedDoctor = null; // Reset doctor selection
                      });
                    },
                  ),

                  const SizedBox(height: 20),

                  // Doctor Selection
                  if (selectedSpecialty != null) ...[
                    const Text(
                      'Select Doctor',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF667EEA),
                      ),
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      initialValue: selectedDoctor,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                        filled: true,
                        fillColor: Colors.grey[100],
                      ),
                      items: doctors[selectedSpecialty!]!.map((doctor) {
                        return DropdownMenuItem(
                          value: doctor,
                          child: Text(doctor),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          selectedDoctor = value;
                        });
                      },
                    ),
                  ],

                  const SizedBox(height: 20),

                  // Date Selection
                  const Text(
                    'Select Date',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF667EEA),
                    ),
                  ),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now().add(const Duration(days: 1)),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 30)),
                      );
                      if (date != null) {
                        setState(() {
                          selectedDate = date;
                        });
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(15),
                        color: Colors.grey[100],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today, color: Color(0xFF667EEA)),
                          const SizedBox(width: 10),
                          Text(
                            selectedDate != null
                                ? '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}'
                                : 'Select a date',
                            style: TextStyle(
                              color: selectedDate != null ? Colors.black : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Time Selection
                  const Text(
                    'Select Time',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF667EEA),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: timeSlots.map((time) {
                      final isSelected = selectedTime == time;
                      return InkWell(
                        onTap: () {
                          setState(() {
                            selectedTime = time;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF667EEA) : Colors.grey[100],
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF667EEA) : Colors.grey,
                            ),
                          ),
                          child: Text(
                            time,
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.black,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 30),

                  // Book Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: (selectedSpecialty != null && selectedDoctor != null && selectedDate != null && selectedTime != null)
                          ? () {
                              // Here you would typically send the booking request to your backend
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Appointment booked with $selectedDoctor on ${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year} at $selectedTime'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF667EEA),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                      ),
                      child: const Text(
                        'Book Appointment',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}