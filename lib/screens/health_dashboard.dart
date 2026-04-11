import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class HealthDashboardScreen extends StatefulWidget {
  const HealthDashboardScreen({super.key});

  @override
  _HealthDashboardScreenState createState() => _HealthDashboardScreenState();
}

class _HealthDashboardScreenState extends State<HealthDashboardScreen> with TickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _weeklyData = [
    {'day': 'Mon', 'steps': 8500, 'heartRate': 72, 'sleep': 7.5},
    {'day': 'Tue', 'steps': 9200, 'heartRate': 75, 'sleep': 8.0},
    {'day': 'Wed', 'steps': 7800, 'heartRate': 70, 'sleep': 6.8},
    {'day': 'Thu', 'steps': 10100, 'heartRate': 73, 'sleep': 7.2},
    {'day': 'Fri', 'steps': 8900, 'heartRate': 71, 'sleep': 7.8},
    {'day': 'Sat', 'steps': 12000, 'heartRate': 74, 'sleep': 8.5},
    {'day': 'Sun', 'steps': 9500, 'heartRate': 72, 'sleep': 8.2},
  ];

  final List<Map<String, dynamic>> _healthInsights = [
    {
      'title': 'Excellent Sleep Quality',
      'description': 'Your average sleep duration has improved by 15% this week.',
      'icon': '😴',
      'color': Colors.blue,
      'trend': 'up'
    },
    {
      'title': 'Heart Rate Stable',
      'description': 'Your resting heart rate is within the healthy range.',
      'icon': '❤️',
      'color': Colors.red,
      'trend': 'stable'
    },
    {
      'title': 'Step Goal Progress',
      'description': 'You\'re 84% towards your weekly step goal. Keep it up!',
      'icon': '🚶',
      'color': Colors.green,
      'trend': 'up'
    },
    {
      'title': 'Hydration Reminder',
      'description': 'You\'ve consumed 6 out of 8 recommended water glasses today.',
      'icon': '💧',
      'color': Colors.cyan,
      'trend': 'neutral'
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
                      'Health Dashboard',
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
                    Tab(text: 'Overview'),
                    Tab(text: 'Trends'),
                    Tab(text: 'Insights'),
                  ],
                ),
              ),

              // Tab Content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildOverviewTab(),
                    _buildTrendsTab(),
                    _buildInsightsTab(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Today's Summary
          const Text(
            'Today\'s Summary',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 15),

          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  'Steps',
                  '8,432',
                  '10,000 goal',
                  Icons.directions_walk,
                  Colors.green,
                  0.84,
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: _buildMetricCard(
                  'Heart Rate',
                  '72 BPM',
                  'Resting',
                  Icons.favorite,
                  Colors.red,
                  0.72,
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  'Sleep',
                  '7.2h',
                  '8h goal',
                  Icons.nightlight_round,
                  Colors.blue,
                  0.9,
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: _buildMetricCard(
                  'Water',
                  '6/8',
                  'glasses',
                  Icons.local_drink,
                  Colors.cyan,
                  0.75,
                ),
              ),
            ],
          ),

          const SizedBox(height: 30),

          // Weekly Progress
          const Text(
            'Weekly Progress',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 15),

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
            child: Column(
              children: [
                SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: FlGridData(show: false),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                              if (value.toInt() >= 0 && value.toInt() < days.length) {
                                return Text(
                                  days[value.toInt()],
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                  ),
                                );
                              }
                              return const Text('');
                            },
                          ),
                        ),
                        topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      ),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: _weeklyData.asMap().entries.map((entry) {
                            return FlSpot(entry.key.toDouble(), entry.value['steps'] / 1000);
                          }).toList(),
                          isCurved: true,
                          color: Colors.white,
                          barWidth: 3,
                          dotData: FlDotData(show: true),
                          belowBarData: BarAreaData(
                            show: true,
                            color: Colors.white.withOpacity(0.1),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Daily Steps (in thousands)',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrendsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Health Trends',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),

          // Heart Rate Trend
          _buildTrendCard(
            'Heart Rate Trend',
            'Last 7 days',
            Icons.favorite,
            Colors.red,
            '+2 BPM',
            'Improving',
          ),

          const SizedBox(height: 15),

          // Sleep Quality Trend
          _buildTrendCard(
            'Sleep Quality',
            'Last 7 days',
            Icons.nightlight_round,
            Colors.blue,
            '+0.3h',
            'Better rest',
          ),

          const SizedBox(height: 15),

          // Activity Level Trend
          _buildTrendCard(
            'Activity Level',
            'Last 7 days',
            Icons.directions_run,
            Colors.green,
            '+12%',
            'More active',
          ),

          const SizedBox(height: 30),

          // Detailed Charts
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Sleep Duration Trend',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 150,
                  child: BarChart(
                    BarChartData(
                      alignment: BarChartAlignment.spaceAround,
                      maxY: 10,
                      barGroups: _weeklyData.asMap().entries.map((entry) {
                        return BarChartGroupData(
                          x: entry.key,
                          barRods: [
                            BarChartRodData(
                              toY: entry.value['sleep'],
                              color: Colors.blue,
                              width: 20,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ],
                        );
                      }).toList(),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                              if (value.toInt() >= 0 && value.toInt() < days.length) {
                                return Text(
                                  days[value.toInt()],
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                  ),
                                );
                              }
                              return const Text('');
                            },
                          ),
                        ),
                        topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      ),
                      gridData: FlGridData(show: false),
                      borderData: FlBorderData(show: false),
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

  Widget _buildInsightsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'AI Health Insights',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),

          ..._healthInsights.map((insight) => Container(
            margin: const EdgeInsets.only(bottom: 15),
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
                    color: insight['color'].withOpacity(0.2),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Text(
                    insight['icon'],
                    style: const TextStyle(fontSize: 30),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            insight['title'],
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: _getTrendColor(insight['trend']).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              _getTrendIcon(insight['trend']),
                              style: TextStyle(
                                fontSize: 12,
                                color: _getTrendColor(insight['trend']),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        insight['description'],
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
          )),

          const SizedBox(height: 30),

          // Recommendations
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Personalized Recommendations',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 15),
                _buildRecommendation(
                  'Increase daily water intake by 2 glasses',
                  'Based on your hydration patterns',
                  Icons.local_drink,
                  Colors.cyan,
                ),
                const SizedBox(height: 12),
                _buildRecommendation(
                  'Try to get 8 hours of sleep tonight',
                  'Your sleep quality will improve',
                  Icons.nightlight_round,
                  Colors.blue,
                ),
                const SizedBox(height: 12),
                _buildRecommendation(
                  'Take a 10-minute walk after dinner',
                  'Boost your metabolism and mood',
                  Icons.directions_walk,
                  Colors.green,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, String subtitle, IconData icon, Color color, double progress) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 30),
              SizedBox(
                width: 40,
                height: 40,
                child: CircularProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.white.withOpacity(0.2),
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                  strokeWidth: 4,
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrendCard(String title, String period, IconData icon, Color color, String change, String status) {
    return Container(
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
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Icon(icon, color: color, size: 30),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  period,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                change,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.green,
                ),
              ),
              Text(
                status,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withOpacity(0.6),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendation(String recommendation, String reason, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                recommendation,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                reason,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withOpacity(0.6),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _getTrendColor(String trend) {
    switch (trend) {
      case 'up':
        return Colors.green;
      case 'down':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  String _getTrendIcon(String trend) {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  }
}