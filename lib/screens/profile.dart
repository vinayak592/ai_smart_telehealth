import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  final List<Map<String, dynamic>> _achievements = [
    {
      'title': 'First Check-up',
      'description': 'Completed your first symptom analysis',
      'icon': '🏥',
      'unlocked': true,
      'date': '2026-03-15'
    },
    {
      'title': 'Health Streak',
      'description': '7 days of consistent health tracking',
      'icon': '🔥',
      'unlocked': true,
      'date': '2026-03-20'
    },
    {
      'title': 'AI Assistant',
      'description': 'Used AI chatbot 10 times',
      'icon': '🤖',
      'unlocked': true,
      'date': '2026-03-18'
    },
    {
      'title': 'Appointment Master',
      'description': 'Booked 5 doctor appointments',
      'icon': '📅',
      'unlocked': false,
      'date': null
    },
    {
      'title': 'Wellness Warrior',
      'description': '30 days of perfect health goals',
      'icon': '⚡',
      'unlocked': false,
      'date': null
    },
  ];

  final Map<String, dynamic> _healthGoals = {
    'dailySteps': {'current': 8432, 'target': 10000, 'unit': 'steps'},
    'waterIntake': {'current': 6, 'target': 8, 'unit': 'glasses'},
    'sleepHours': {'current': 7.2, 'target': 8, 'unit': 'hours'},
    'exerciseMinutes': {'current': 45, 'target': 60, 'unit': 'minutes'},
  };

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

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;

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
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header with Profile Info
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.arrow_back, color: Colors.white),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'My Profile',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Profile Card
                    Container(
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
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Colors.purple, Colors.pink],
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Text(
                                '👤',
                                style: TextStyle(fontSize: 40),
                              ),
                            ),
                          ),
                          const SizedBox(width: 20),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user?.name ?? 'User',
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Text(
                                  user?.email ?? 'user@example.com',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Text(
                                  user?.phone ?? '+1 (555) 123-4567',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.white.withOpacity(0.7),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 30),

                    // Health Goals Section
                    const Text(
                      'Today\'s Health Goals',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 15),

                    ..._healthGoals.entries.map((entry) {
                      final goal = entry.value;
                      final progress = (goal['current'] / goal['target']).clamp(0.0, 1.0);
                      return Container(
                        margin: const EdgeInsets.only(bottom: 15),
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(15),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  entry.key.replaceAllMapped(
                                    RegExp(r'([A-Z])'),
                                    (match) => ' ${match.group(1)}',
                                  ).toLowerCase().replaceFirst('d', 'D').replaceFirst('w', 'W').replaceFirst('s', 'S').replaceFirst('e', 'E'),
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                Text(
                                  '${goal['current']}/${goal['target']} ${goal['unit']}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            LinearProgressIndicator(
                              value: progress,
                              backgroundColor: Colors.white.withOpacity(0.2),
                              valueColor: AlwaysStoppedAnimation<Color>(
                                progress >= 1.0 ? Colors.green : Colors.blue,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),

                    const SizedBox(height: 30),

                    // Achievements Section
                    const Text(
                      'Achievements',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 15),

                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 15,
                        mainAxisSpacing: 15,
                        childAspectRatio: 1.2,
                      ),
                      itemCount: _achievements.length,
                      itemBuilder: (context, index) {
                        final achievement = _achievements[index];
                        return Container(
                          padding: const EdgeInsets.all(15),
                          decoration: BoxDecoration(
                            color: achievement['unlocked']
                                ? Colors.white.withOpacity(0.15)
                                : Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(15),
                            border: Border.all(
                              color: achievement['unlocked']
                                  ? Colors.white.withOpacity(0.3)
                                  : Colors.white.withOpacity(0.1),
                              width: 1,
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                achievement['icon'],
                                style: const TextStyle(fontSize: 30),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                achievement['title'],
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: achievement['unlocked'] ? Colors.white : Colors.white.withOpacity(0.5),
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 5),
                              Text(
                                achievement['description'],
                                style: TextStyle(
                                  fontSize: 10,
                                  color: achievement['unlocked'] ? Colors.white.withOpacity(0.8) : Colors.white.withOpacity(0.3),
                                ),
                                textAlign: TextAlign.center,
                              ),
                              if (achievement['unlocked'] && achievement['date'] != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 5),
                                  child: Text(
                                    achievement['date'],
                                    style: TextStyle(
                                      fontSize: 8,
                                      color: Colors.white.withOpacity(0.6),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 30),

                    // Settings Section
                    const Text(
                      'Settings',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 15),

                    _buildSettingTile(
                      'Notifications',
                      Icons.notifications,
                      true,
                      (value) {
                        // Handle notification toggle
                      },
                    ),
                    _buildSettingTile(
                      'Dark Mode',
                      Icons.dark_mode,
                      false,
                      (value) {
                        // Handle dark mode toggle
                      },
                    ),
                    _buildSettingTile(
                      'Health Reminders',
                      Icons.alarm,
                      true,
                      (value) {
                        // Handle health reminders toggle
                      },
                    ),

                    const SizedBox(height: 30),

                    // Logout Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Provider.of<UserProvider>(context, listen: false).logout();
                          Navigator.pushReplacementNamed(context, '/login');
                        },
                        icon: const Icon(Icons.logout),
                        label: const Text('Logout'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red.withOpacity(0.8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSettingTile(String title, IconData icon, bool initialValue, Function(bool) onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: Colors.white.withOpacity(0.8),
              ),
              const SizedBox(width: 15),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          Switch(
            value: initialValue,
            onChanged: onChanged,
            activeThumbColor: Colors.white,
            activeTrackColor: Colors.white.withOpacity(0.3),
          ),
        ],
      ),
    );
  }
}