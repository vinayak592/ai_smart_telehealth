import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;

import '../providers/user_provider.dart';
import 'symptom_input.dart';
import 'chatbot.dart';
import 'doctors.dart';
import 'profile.dart';
import 'emergency_sos.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  int _selectedIndex = 0;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  static List<Widget> get _widgetOptions => [
    const HomeContent(),
    const SymptomInputScreen(),
    const ChatbotScreen(),
    const DoctorsScreen(),
    const ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
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
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: _widgetOptions.elementAt(_selectedIndex),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
          ),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          items: const <BottomNavigationBarItem>[
            BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
            BottomNavigationBarItem(
              icon: Icon(Icons.medical_services),
              label: 'Symptoms',
            ),
            BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'AI Chat'),
            BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Doctors'),
            BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
          ],
          currentIndex: _selectedIndex,
          selectedItemColor: Colors.white,
          unselectedItemColor: Colors.white70,
          backgroundColor: Colors.transparent,
          elevation: 0,
          onTap: _onItemTapped,
          type: BottomNavigationBarType.fixed,
        ),
      ),
      floatingActionButton: _selectedIndex == 0
          ? Container(
              height: 70,
              width: 70,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.red, Colors.redAccent],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.red.withOpacity(0.3),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: FloatingActionButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const EmergencySOSScreen(),
                    ),
                  );
                },
                backgroundColor: Colors.transparent,
                elevation: 0,
                child: const Icon(
                  Icons.emergency,
                  size: 30,
                  color: Colors.white,
                ),
              ),
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}

class HomeContent extends StatefulWidget {
  const HomeContent({super.key});

  @override
  _HomeContentState createState() => _HomeContentState();
}

class _HomeContentState extends State<HomeContent>
    with TickerProviderStateMixin {
  late AnimationController _cardAnimationController;
  late Animation<double> _cardAnimation;
  late Timer _healthUpdateTimer;
  bool _isOnline = false;
  final Random _random = Random();

  Map<String, Map<String, dynamic>> _healthData = {
    'Heart Rate': {
      'value': '72 BPM',
      'icon': Icons.favorite,
      'color': Colors.red,
    },
    'Steps Today': {
      'value': '8,432 steps',
      'icon': Icons.directions_walk,
      'color': Colors.green,
    },
    'Sleep Hours': {
      'value': '7.2 h',
      'icon': Icons.nightlight_round,
      'color': Colors.blue,
    },
    'Water Intake': {
      'value': '6/8 glasses',
      'icon': Icons.local_drink,
      'color': Colors.cyan,
    },
  };

  @override
  void initState() {
    super.initState();
    _cardAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _cardAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _cardAnimationController,
        curve: Curves.elasticOut,
      ),
    );
    _cardAnimationController.forward();
    _checkInternetConnectivity();
    _updateHealthData();
    _healthUpdateTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _updateHealthData();
    });
  }

  @override
  void dispose() {
    _healthUpdateTimer.cancel();
    _cardAnimationController.dispose();
    super.dispose();
  }

  void _updateHealthData() {
    final steps = 3000 + _random.nextInt(7000);
    final sleepHours = (5 + _random.nextDouble() * 3).toStringAsFixed(1);
    final waterGlasses = 4 + _random.nextInt(5);
    final heartRate = 60 + _random.nextInt(45);

    setState(() {
      _healthData = {
        'Heart Rate': {
          'value': '$heartRate BPM',
          'icon': Icons.favorite,
          'color': Colors.red,
        },
        'Steps Today': {
          'value': '$steps steps',
          'icon': Icons.directions_walk,
          'color': Colors.green,
        },
        'Sleep Hours': {
          'value': '$sleepHours h',
          'icon': Icons.nightlight_round,
          'color': Colors.blue,
        },
        'Water Intake': {
          'value': '$waterGlasses/8 glasses',
          'icon': Icons.local_drink,
          'color': Colors.cyan,
        },
      };
    });

    if (!_isOnline) {
      _checkInternetConnectivity();
    }
  }

  Future<void> _checkInternetConnectivity() async {
    try {
      final response = await http
          .get(Uri.parse('https://jsonplaceholder.typicode.com/posts/1'))
          .timeout(const Duration(seconds: 4));
      setState(() {
        _isOnline = response.statusCode == 200;
      });
    } catch (_) {
      setState(() {
        _isOnline = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;

    return SafeArea(
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hello, ${user?.name ?? 'User'}! 👋',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        'How are you feeling today?',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(
                      Icons.notifications,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 30),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Live Health Dashboard',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  _buildConnectivityChip(),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                height: 130,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  children: _healthData.entries.map((entry) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 15),
                      child: AnimatedBuilder(
                        animation: _cardAnimation,
                        builder: (context, child) {
                          return Transform.translate(
                            offset: Offset(0, (1 - _cardAnimation.value) * 20),
                            child: Opacity(
                              opacity: _cardAnimation.value,
                              child: _buildHealthStatCard(
                                entry.key,
                                entry.value['value'] as String,
                                entry.value['icon'] as IconData,
                                entry.value['color'] as Color,
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 25),
              Text(
                'Quick Actions',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Access services, book appointments, and manage your care in one place.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.8),
                ),
              ),
              const SizedBox(height: 20),
              GridView.count(
                shrinkWrap: true,
                crossAxisCount: 2,
                crossAxisSpacing: 15,
                mainAxisSpacing: 15,
                childAspectRatio: 0.95,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildQuickActionButton(
                    context,
                    'Symptom Check',
                    Icons.medical_services,
                    Colors.teal,
                    () => Navigator.pushNamed(context, '/symptoms'),
                  ),
                  _buildQuickActionButton(
                    context,
                    'AI Chatbot',
                    Icons.chat_bubble,
                    Colors.purple,
                    () => Navigator.pushNamed(context, '/chatbot'),
                  ),
                  _buildQuickActionButton(
                    context,
                    'Find Doctor',
                    Icons.people,
                    Colors.orange,
                    () => Navigator.pushNamed(context, '/doctors'),
                  ),
                  _buildQuickActionButton(
                    context,
                    'Health Dashboard',
                    Icons.dashboard,
                    Colors.blue,
                    () => Navigator.pushNamed(context, '/dashboard'),
                  ),
                  _buildQuickActionButton(
                    context,
                    'Hospital Facilities',
                    Icons.local_hospital,
                    Colors.green,
                    () => Navigator.pushNamed(context, '/facilities'),
                  ),
                  _buildQuickActionButton(
                    context,
                    'Generate Bill',
                    Icons.receipt,
                    Colors.amber,
                    () => Navigator.pushNamed(context, '/billing'),
                  ),
                  _buildQuickActionButton(
                    context,
                    'Achievements',
                    Icons.emoji_events,
                    Colors.indigo,
                    () => Navigator.pushNamed(context, '/achievements'),
                  ),
                  _buildQuickActionButton(
                    context,
                    'Book Bed',
                    Icons.hotel,
                    Colors.cyan,
                    () => Navigator.pushNamed(context, '/bookings'),
                  ),
                ],
              ),

              const SizedBox(height: 25),
              Text(
                'Hospital Snapshot',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatusChip('Beds', '42', Colors.pinkAccent),
                  _buildStatusChip('ICU', '8', Colors.deepPurpleAccent),
                  _buildStatusChip('Ventilators', '14', Colors.lightBlueAccent),
                  _buildStatusChip('Ambulance', '3', Colors.lime),
                ],
              ),

              const SizedBox(height: 30),

              // Daily Health Tip
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.2),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: const Icon(
                        Icons.lightbulb,
                        color: Colors.amber,
                        size: 30,
                      ),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Daily Health Tip',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            'Stay hydrated! Drink at least 8 glasses of water daily for optimal health.',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConnectivityChip() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
      decoration: BoxDecoration(
        color: _isOnline
            ? Colors.green.withOpacity(0.2)
            : Colors.red.withOpacity(0.2),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Icon(
            _isOnline ? Icons.wifi : Icons.wifi_off,
            color: _isOnline ? Colors.greenAccent : Colors.redAccent,
            size: 18,
          ),
          const SizedBox(width: 8),
          Text(
            _isOnline ? 'Online' : 'Offline',
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHealthStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      width: 140,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color.withOpacity(0.95), color.withOpacity(0.6)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.22),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.18),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.85),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionButton(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return AnimatedBuilder(
      animation: _cardAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _cardAnimation.value,
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: color.withOpacity(0.18),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Colors.white.withOpacity(0.15),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.2),
                    blurRadius: 12,
                    offset: const Offset(0, 7),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 42,
                    width: 42,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.95),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(icon, size: 24, color: Colors.white),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      const Text(
                        'Open',
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                      const SizedBox(width: 6),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 14,
                        color: Colors.white.withOpacity(0.85),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusChip(String title, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 14),
        margin: const EdgeInsets.only(right: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.2),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withOpacity(0.15), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
