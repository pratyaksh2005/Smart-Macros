import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../app/app_state.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final p = state.user?.profile;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: p == null
                ? const Text("No profile found.")
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Profile", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 10),
                      Text("Email: ${state.user!.email}"),
                      Text("Name: ${p.firstName} ${p.lastName}"),
                      Text("Goal: ${p.goal.name}"),
                      Text("Activity: ${p.activityLevel.name}"),
                      Text("Diet: ${p.dietaryPreference.name}"),
                      Text("Allergies: ${p.allergies.isEmpty ? "None" : p.allergies.join(", ")}"),
                      Text("Condition: ${p.nutritionDisability.name}"),
                      if (p.disabilityNotes.isNotEmpty) Text("Notes: ${p.disabilityNotes}"),
                    ],
                  ),
          ),
        ),
      ],
    );
  }
}
