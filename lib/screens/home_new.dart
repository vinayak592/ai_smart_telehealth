import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Smart Telehealth Assistant'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Welcome to your Health Assistant! 🎉',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Tap a feature to explore medical facilities or generate invoice quickly.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1,
                children: [
                  _ActionCard(
                    icon: Icons.local_hospital,
                    label: 'Emergency SOS',
                    color: Colors.redAccent,
                    onTap: () => Navigator.pushNamed(context, '/emergency'),
                  ),
                  _ActionCard(
                    icon: Icons.engineering,
                    label: 'Facilities',
                    color: Colors.blueAccent,
                    onTap: () => Navigator.pushNamed(context, '/facilities'),
                  ),
                  _ActionCard(
                    icon: Icons.receipt,
                    label: 'Billing',
                    color: Colors.teal,
                    onTap: () => Navigator.pushNamed(context, '/billing'),
                  ),
                  _ActionCard(
                    icon: Icons.chat,
                    label: 'AI Chat',
                    color: Colors.purple,
                    onTap: () => Navigator.pushNamed(context, '/chatbot'),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        color: color.withOpacity(0.14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 42, color: color),
              const SizedBox(height: 12),
              Text(label,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: color, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}
