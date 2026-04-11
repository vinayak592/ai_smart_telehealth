import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AchievementsScreen extends StatefulWidget {
  const AchievementsScreen({super.key});

  @override
  State<AchievementsScreen> createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends State<AchievementsScreen> {
  final List<_Achievement> _achievements = [
    _Achievement(title: 'First Login', description: 'Logged in successfully for the first time', isComplete: false),
    _Achievement(title: 'Profile Completed', description: 'Completed your profile information', isComplete: false),
    _Achievement(title: 'Daily Check-in', description: 'Opened app 7 days in a row', isComplete: false),
    _Achievement(title: 'Symptom Tracker', description: 'Used symptom checker once', isComplete: false),
    _Achievement(title: 'Health Dashboard Viewed', description: 'Visited the health dashboard', isComplete: false),
  ];

  @override
  void initState() {
    super.initState();
    _loadAchievements();
  }

  Future<void> _loadAchievements() async {
    try {
      final achievements = await ApiService().getAchievements();
      setState(() {
        for (final ach in achievements) {
          final index = _achievements.indexWhere((a) => a.title == ach['title']);
          if (index != -1) {
            _achievements[index].isComplete = ach['isComplete'] ?? false;
          }
        }
      });
    } catch (e) {
      // Fallback to local state if backend fails
    }
  }

  Future<void> _saveAchievement(_Achievement achievement) async {
    try {
      await ApiService().saveAchievement(achievement.title, achievement.description, achievement.isComplete);
    } catch (e) {
      // Fallback if backend fails
    }
  }

  void _markAllComplete() {
    setState(() {
      for (final item in _achievements) {
        item.isComplete = true;
        _saveAchievement(item);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('All achievements marked complete!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Achievements'),
        actions: [
          TextButton(
            onPressed: _markAllComplete,
            child: const Text('Complete All', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _achievements.length,
        itemBuilder: (context, index) {
          final achievement = _achievements[index];
          return Card(
            color: achievement.isComplete ? Colors.green[50] : Colors.white,
            child: ListTile(
              leading: Icon(
                achievement.isComplete ? Icons.check_circle : Icons.lock,
                color: achievement.isComplete ? Colors.green : Colors.grey,
              ),
              title: Text(achievement.title),
              subtitle: Text(achievement.description),
              trailing: TextButton(
                onPressed: () {
                  setState(() {
                    achievement.isComplete = true;
                  });
                  _saveAchievement(achievement);
                },
                child: Text(
                  achievement.isComplete ? 'Done' : 'Complete',
                  style: TextStyle(
                    color: achievement.isComplete ? Colors.grey : Colors.teal,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _Achievement {
  final String title;
  final String description;
  bool isComplete;

  _Achievement({required this.title, required this.description, required this.isComplete});
}
