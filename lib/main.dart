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
import 'screens/prescription_entry.dart';
import 'screens/real_time_translation.dart';
import 'screens/skin_lesion_scanner.dart';
import 'screens/ambient_clinical_scribe.dart';
import 'screens/gait_mobility_analysis.dart';

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
        useMaterial3: true,
        primaryColor: const Color(0xFF0F62FE),
        scaffoldBackgroundColor: const Color(0xFFF4F7FC),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F62FE),
          primary: const Color(0xFF0F62FE),
          secondary: const Color(0xFF8A3FFC),
          surface: Colors.white,
          background: const Color(0xFFF4F7FC),
        ),
        fontFamily: 'Roboto', // Default clean font
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF161616),
          elevation: 0,
          centerTitle: false,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0F62FE),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            elevation: 0,
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.grey.shade50,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: const BorderSide(color: Color(0xFF0F62FE), width: 2),
            borderRadius: BorderRadius.circular(8),
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
        '/prescriptions': (context) => PrescriptionEntryScreen(),
        '/skin-lesion': (context) => const SkinLesionScannerScreen(),
        '/clinical-scribe': (context) => const AmbientClinicalScribeScreen(),
        '/gait-analysis': (context) => const GaitMobilityAnalysisScreen(),
        '/translation': (context) => RealTimeTranslationScreen(),
      },
    );
  }
}
