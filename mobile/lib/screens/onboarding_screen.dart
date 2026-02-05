import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app/app_state.dart';
import '../app/models.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _age = TextEditingController(text: "20");
  final _height = TextEditingController(text: "170");
  final _weight = TextEditingController(text: "70");
  final _allergies = TextEditingController();

  ActivityLevel _activity = ActivityLevel.moderate;
  Goal _goal = Goal.maintain;
  DietaryPreference _diet = DietaryPreference.none;

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _age.dispose();
    _height.dispose();
    _weight.dispose();
    _allergies.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      appBar: AppBar(title: const Text("Onboarding")),
      body: ListView(
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
                  const Text("Tell us about you", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _first,
                          decoration: const InputDecoration(labelText: "First name", border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _last,
                          decoration: const InputDecoration(labelText: "Last name", border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _age,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: "Age", border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _height,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: "Height (cm)", border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _weight,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: "Weight (kg)", border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  DropdownButtonFormField<ActivityLevel>(
                    value: _activity,
                    items: const [
                      DropdownMenuItem(value: ActivityLevel.sedentary, child: Text("Sedentary")),
                      DropdownMenuItem(value: ActivityLevel.light, child: Text("Light")),
                      DropdownMenuItem(value: ActivityLevel.moderate, child: Text("Moderate")),
                      DropdownMenuItem(value: ActivityLevel.high, child: Text("High")),
                    ],
                    onChanged: (v) => setState(() => _activity = v ?? ActivityLevel.moderate),
                    decoration: const InputDecoration(labelText: "Activity level", border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 12),

                  DropdownButtonFormField<Goal>(
                    value: _goal,
                    items: const [
                      DropdownMenuItem(value: Goal.cut, child: Text("Cut")),
                      DropdownMenuItem(value: Goal.maintain, child: Text("Maintain")),
                      DropdownMenuItem(value: Goal.bulk, child: Text("Bulk")),
                    ],
                    onChanged: (v) => setState(() => _goal = v ?? Goal.maintain),
                    decoration: const InputDecoration(labelText: "Goal", border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 12),

                  DropdownButtonFormField<DietaryPreference>(
                    value: _diet,
                    items: const [
                      DropdownMenuItem(value: DietaryPreference.none, child: Text("None")),
                      DropdownMenuItem(value: DietaryPreference.vegetarian, child: Text("Vegetarian")),
                      DropdownMenuItem(value: DietaryPreference.vegan, child: Text("Vegan")),
                      DropdownMenuItem(value: DietaryPreference.halal, child: Text("Halal")),
                      DropdownMenuItem(value: DietaryPreference.kosher, child: Text("Kosher")),
                    ],
                    onChanged: (v) => setState(() => _diet = v ?? DietaryPreference.none),
                    decoration: const InputDecoration(labelText: "Dietary preference", border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _allergies,
                    decoration: const InputDecoration(
                      labelText: "Allergies (comma separated)",
                      border: OutlineInputBorder(),
                    ),
                  ),

                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () async {
                        final first = _first.text.trim();
                        final last = _last.text.trim();
                        if (first.isEmpty || last.isEmpty) return;

                        final age = int.tryParse(_age.text.trim()) ?? 20;
                        final height = int.tryParse(_height.text.trim()) ?? 170;
                        final weight = int.tryParse(_weight.text.trim()) ?? 70;

                        final allergies = _allergies.text
                            .split(',')
                            .map((s) => s.trim())
                            .where((s) => s.isNotEmpty)
                            .toList();

                        final profile = UserProfile(
                          firstName: first,
                          lastName: last,
                          age: age,
                          heightCm: height,
                          weightKg: weight,
                          activityLevel: _activity,
                          goal: _goal,
                          dietaryPreference: _diet,
                          allergies: allergies,
                          nutritionDisability: NutritionDisability.none,
                          disabilityNotes: "",
                        );

                        await state.saveProfile(profile);
                      },
                      child: const Text("Save and continue"),
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
