import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app/app_state.dart';
import 'screens/login_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/medical_screen.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(const SmartMacrosApp());
}

class SmartMacrosApp extends StatelessWidget {
  const SmartMacrosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState()..init(),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Smart Macros',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
          useMaterial3: true,
        ),
        home: const GateRouter(),
      ),
    );
  }
}

class GateRouter extends StatelessWidget {
  const GateRouter({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    switch (state.gate) {
      case Gate.login:
        return const LoginScreen();
      case Gate.onboarding:
        return const OnboardingScreen();
      case Gate.medical:
        return const MedicalScreen();
      case Gate.app:
        return const DashboardScreen();
    }
  }
}
