import 'package:flutter/material.dart';

class HealthTipsScreen extends StatefulWidget {
  const HealthTipsScreen({super.key});

  @override
  _HealthTipsScreenState createState() => _HealthTipsScreenState();
}

class _HealthTipsScreenState extends State<HealthTipsScreen> with TickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _nutritionTips = [
    {
      'title': 'Hydration Hero',
      'description': 'Drink at least 8 glasses of water daily. Add lemon or cucumber for flavor!',
      'icon': Icons.local_drink,
      'color': Colors.blue,
      'image': '💧'
    },
    {
      'title': 'Balanced Plate',
      'description': 'Fill half your plate with vegetables, quarter with protein, quarter with grains.',
      'icon': Icons.restaurant,
      'color': Colors.green,
      'image': '🥗'
    },
    {
      'title': 'Super Foods',
      'description': 'Incorporate berries, nuts, leafy greens, and fatty fish into your diet.',
      'icon': Icons.grass,
      'color': Colors.lightGreen,
      'image': '🫐'
    },
  ];

  final List<Map<String, dynamic>> _fitnessTips = [
    {
      'title': 'Daily Movement',
      'description': 'Aim for 10,000 steps daily. Take the stairs, walk during breaks!',
      'icon': Icons.directions_walk,
      'color': Colors.orange,
      'image': '🚶'
    },
    {
      'title': 'Strength Training',
      'description': 'Build muscle with bodyweight exercises like push-ups, squats, and planks.',
      'icon': Icons.fitness_center,
      'color': Colors.red,
      'image': '💪'
    },
    {
      'title': 'Flexibility Focus',
      'description': 'Stretch daily to improve flexibility and reduce injury risk.',
      'icon': Icons.accessibility,
      'color': Colors.purple,
      'image': '🧘'
    },
  ];

  final List<Map<String, dynamic>> _mentalHealthTips = [
    {
      'title': 'Mindful Moments',
      'description': 'Practice 5 minutes of deep breathing daily to reduce stress.',
      'icon': Icons.self_improvement,
      'color': Colors.indigo,
      'image': '🧠'
    },
    {
      'title': 'Quality Sleep',
      'description': 'Maintain consistent sleep schedule and create a relaxing bedtime routine.',
      'icon': Icons.nightlight_round,
      'color': Colors.blueGrey,
      'image': '😴'
    },
    {
      'title': 'Social Connection',
      'description': 'Stay connected with loved ones. Social support is crucial for mental health.',
      'icon': Icons.people,
      'color': Colors.pink,
      'image': '👥'
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Health Tips & Wellness',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
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
                    Tab(text: 'Nutrition'),
                    Tab(text: 'Fitness'),
                    Tab(text: 'Mental Health'),
                  ],
                ),
              ),

              // Tab Content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTipsList(_nutritionTips),
                    _buildTipsList(_fitnessTips),
                    _buildTipsList(_mentalHealthTips),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTipsList(List<Map<String, dynamic>> tips) {
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: tips.length,
      itemBuilder: (context, index) {
        final tip = tips[index];
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
                  color: tip['color'].withOpacity(0.2),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Text(
                  tip['image'],
                  style: const TextStyle(fontSize: 30),
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tip['title'],
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      tip['description'],
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.8),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}