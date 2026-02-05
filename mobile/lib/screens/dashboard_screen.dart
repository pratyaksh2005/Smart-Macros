import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app/app_state.dart';
import 'tabs/workout_tab.dart';
import 'tabs/meals_tab.dart';
import 'tabs/grocery_tab.dart';
import 'tabs/profile_tab.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _idx = 0;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    final pages = [
      const WorkoutTab(),
      const MealsTab(),
      const GroceryTab(),
      const ProfileTab(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text("Smart Macros"),
        actions: [
          IconButton(
            onPressed: () => state.logout(),
            icon: const Icon(Icons.logout),
            tooltip: "Logout",
          )
        ],
      ),
      body: pages[_idx],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _idx,
        onDestinationSelected: (i) => setState(() => _idx = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.fitness_center), label: "Workout"),
          NavigationDestination(icon: Icon(Icons.restaurant), label: "Meals"),
          NavigationDestination(icon: Icon(Icons.shopping_basket), label: "Grocery"),
          NavigationDestination(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
