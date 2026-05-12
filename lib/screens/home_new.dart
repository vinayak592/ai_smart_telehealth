import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    // Desktop/Web layout with Sidebar
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FC), // Soft web background
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 250,
            color: Colors.white,
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 32.0, horizontal: 16.0),
                  child: Row(
                    children: [
                      Icon(Icons.health_and_safety, color: Color(0xFF0F62FE), size: 32),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Aura Health',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF161616),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                _buildNavItem(Icons.dashboard, 'Home', 0),
                _buildNavItem(Icons.analytics, 'Health Dashboard', 1, route: '/dashboard'),
                _buildNavItem(Icons.chat, 'AI Triage & Chat', 2, route: '/chatbot'),
                _buildNavItem(Icons.medication, 'Medication Vault', 3, route: '/medication'),
                _buildNavItem(Icons.camera_alt, 'AR Scanner', 4, route: '/skin-lesion'),
                _buildNavItem(Icons.mic, 'Clinical Scribe', 5, route: '/clinical-scribe'),
                _buildNavItem(Icons.monitor_heart, 'Vitals & CDS', 6, route: '/metrics'),
                _buildNavItem(Icons.receipt, 'Billing & Copilot', 7, route: '/billing'),
                const Spacer(),
                const Divider(),
                _buildNavItem(Icons.emergency, 'Emergency SOS', 8, color: Colors.redAccent, route: '/emergency'),
                const SizedBox(height: 16),
              ],
            ),
          ),
          // Main Content
          Expanded(
            child: Column(
              children: [
                // Top Bar
                Container(
                  height: 80,
                  padding: const EdgeInsets.symmetric(horizontal: 32.0),
                  color: Colors.white,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Patient Dashboard',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF161616)),
                      ),
                      Row(
                        children: [
                          IconButton(icon: const Icon(Icons.notifications_none), onPressed: () {}),
                          const SizedBox(width: 16),
                          const CircleAvatar(
                            backgroundColor: Color(0xFF0F62FE),
                            child: Text('JD', style: TextStyle(color: Colors.white)),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
                // Dashboard Content
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Predictive Weather Widget
                        _buildWeatherWidget(),
                        const SizedBox(height: 32),
                        const Text('Quick Access', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        GridView.count(
                          shrinkWrap: true,
                          crossAxisCount: MediaQuery.of(context).size.width > 1200 ? 4 : 2,
                          mainAxisSpacing: 24,
                          crossAxisSpacing: 24,
                          childAspectRatio: 1.5,
                          physics: const NeverScrollableScrollPhysics(),
                          children: [
                            _ActionCard(
                              icon: Icons.analytics,
                              label: 'Health Dashboard',
                              desc: 'View all your health data',
                              color: const Color(0xFF007D79),
                              onTap: () => Navigator.pushNamed(context, '/dashboard'),
                            ),
                            _ActionCard(
                              icon: Icons.chat,
                              label: 'AI Chat & Triage',
                              desc: 'Emotional Biofeedback enabled',
                              color: const Color(0xFF0F62FE),
                              onTap: () => Navigator.pushNamed(context, '/chatbot'),
                            ),
                            _ActionCard(
                              icon: Icons.medication,
                              label: 'Smart Med Vault',
                              desc: 'OCR & Interaction Checks',
                              color: const Color(0xFF8A3FFC),
                              onTap: () => Navigator.pushNamed(context, '/medication'),
                            ),
                            _ActionCard(
                              icon: Icons.camera,
                              label: 'AR Symptom Scanner',
                              desc: 'Visual progression tracking',
                              color: const Color(0xFF198038),
                              onTap: () => Navigator.pushNamed(context, '/skin-lesion'),
                            ),
                            _ActionCard(
                              icon: Icons.mic,
                              label: 'Clinical Scribe',
                              desc: 'Patient-friendly summaries',
                              color: const Color(0xFFFA4D56),
                              onTap: () => Navigator.pushNamed(context, '/clinical-scribe'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String title, int index, {Color? color, String? route}) {
    final isSelected = _selectedIndex == index;
    return InkWell(
      onTap: () {
        if (index == 0) {
          setState(() => _selectedIndex = index);
        } else if (route != null) {
          Navigator.pushNamed(context, route);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE5F0FF) : Colors.transparent,
          border: Border(
            left: BorderSide(
              color: isSelected ? const Color(0xFF0F62FE) : Colors.transparent,
              width: 4,
            ),
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: color ?? (isSelected ? const Color(0xFF0F62FE) : const Color(0xFF525252))),
            const SizedBox(width: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 15,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: color ?? (isSelected ? const Color(0xFF0F62FE) : const Color(0xFF525252)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeatherWidget() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F62FE), Color(0xFF003A6D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F62FE).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.wb_sunny, color: Colors.orangeAccent),
                    SizedBox(width: 8),
                    Text(
                      'Predictive Health Weather',
                      style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'High Pollen Alert Today',
                  style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Based on your history of allergic rhinitis, consider taking your antihistamine today. Air quality is moderate (AQI 65).',
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
              ],
            ),
          ),
          const SizedBox(width: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Column(
              children: [
                Text('Flare Risk', style: TextStyle(color: Colors.white)),
                SizedBox(height: 8),
                Text('75%', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String desc;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.desc,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(color: Colors.grey.shade100),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 32, color: color),
              ),
              const Spacer(),
              Text(label, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF161616))),
              const SizedBox(height: 4),
              Text(desc, style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
            ],
          ),
        ),
      ),
    );
  }
}
