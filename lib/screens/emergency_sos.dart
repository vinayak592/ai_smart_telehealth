import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class EmergencySOSScreen extends StatefulWidget {
  const EmergencySOSScreen({super.key});

  @override
  State<EmergencySOSScreen> createState() => _EmergencySOSScreenState();
}

class _EmergencySOSScreenState extends State<EmergencySOSScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _callEmergency() async {
    final Uri emergencyUri = Uri(scheme: 'tel', path: '911');
    if (await canLaunchUrl(emergencyUri)) {
      await launchUrl(emergencyUri);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to call emergency services')),
      );
    }
  }

  Future<void> _sendEmergencyAlert() async {
    // In a real app, this would send location and user data to emergency contacts
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Emergency alert sent to emergency contacts!'),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency SOS'),
        backgroundColor: Colors.red,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.red, Colors.redAccent],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _pulseAnimation.value,
                    child: Container(
                      width: 200,
                      height: 200,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                      ),
                      child: const Icon(
                        Icons.warning,
                        size: 100,
                        color: Colors.red,
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 40),
              const Text(
                'EMERGENCY',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Tap the button below in case of emergency',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 60),
              ElevatedButton.icon(
                onPressed: _callEmergency,
                icon: const Icon(Icons.call, size: 30),
                label: const Text(
                  'CALL 911',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              OutlinedButton.icon(
                onPressed: _sendEmergencyAlert,
                icon: const Icon(Icons.location_on),
                label: const Text('SEND EMERGENCY ALERT'),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white, width: 2),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
              ),
              const SizedBox(height: 40),
              Container(
                padding: const EdgeInsets.all(20),
                margin: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Emergency Information',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      '• Your location will be shared with emergency services\n'
                      '• Emergency contacts will be notified\n'
                      '• Medical history will be accessible to responders',
                      style: TextStyle(fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}