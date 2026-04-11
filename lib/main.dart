import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/user_provider.dart';
import 'screens/splash.dart';
import 'screens/auth/login.dart';
import 'screens/home_new.dart';
import 'screens/emergency_sos.dart';
import 'screens/health_metrics.dart';
import 'screens/analytics_dashboard.dart';
import 'screens/medication_tracker.dart';
import 'screens/symptom_input.dart';
import 'screens/chatbot.dart';
import 'screens/doctors.dart';
import 'screens/health_dashboard.dart';
import 'screens/health_tips.dart';
import 'screens/appointments.dart';
import 'screens/hospital_facilities.dart';
import 'screens/billing.dart';
import 'screens/achievements.dart';
import 'screens/bookings.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI Telehealth Assistant',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.teal,
        scaffoldBackgroundColor: Colors.grey[50],
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.teal,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.teal,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        cardTheme: const CardThemeData(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: const BorderSide(color: Colors.teal, width: 2),
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      home: const SplashScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/emergency': (context) => const EmergencySOSScreen(),
        '/metrics': (context) => HealthMetricsScreen(),
        '/analytics': (context) => AnalyticsDashboardScreen(),
        '/medication': (context) => MedicationTrackerScreen(),
        '/symptoms': (context) => SymptomInputScreen(),
        '/chatbot': (context) => ChatbotScreen(),
        '/doctors': (context) => DoctorsScreen(),
        '/dashboard': (context) => HealthDashboardScreen(),
        '/tips': (context) => HealthTipsScreen(),
        '/appointments': (context) => AppointmentsScreen(),
        '/facilities': (context) => const HospitalFacilitiesScreen(),
        '/billing': (context) => const BillingScreen(),
        '/achievements': (context) => const AchievementsScreen(),
        '/bookings': (context) => const BookingsScreen(),
      },
    );
  }
}
