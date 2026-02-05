import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../app/app_state.dart';
import '../../app/models.dart';

class WorkoutTab extends StatelessWidget {
  const WorkoutTab({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final goal = state.user?.profile?.goal ?? Goal.maintain;

    final plan = goal == Goal.cut
        ? ["Mon: Upper (light)", "Wed: Lower (light)", "Fri: Full body", "2x Zone 2 cardio"]
        : goal == Goal.bulk
            ? ["Mon: Push", "Tue: Pull", "Thu: Legs", "Sat: Upper", "Optional cardio 1x"]
            : ["Mon: Upper", "Wed: Lower", "Fri: Full body", "1–2x cardio"];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Workout plan", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 10),
                ...plan.map((p) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle_outline, size: 18),
                          const SizedBox(width: 10),
                          Expanded(child: Text(p)),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
