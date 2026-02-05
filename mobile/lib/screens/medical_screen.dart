import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app/app_state.dart';
import '../app/models.dart';

class MedicalScreen extends StatefulWidget {
  const MedicalScreen({super.key});

  @override
  State<MedicalScreen> createState() => _MedicalScreenState();
}

class _MedicalScreenState extends State<MedicalScreen> {
  NutritionDisability _dis = NutritionDisability.none;
  final _notes = TextEditingController();

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final profile = state.user?.profile;

    return Scaffold(
      appBar: AppBar(title: const Text("Medical")),
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
                  const Text("Medical & nutrition needs", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text("This helps adapt meal planning and safety rules.", style: TextStyle(color: Colors.grey.shade700)),
                  const SizedBox(height: 12),

                  DropdownButtonFormField<NutritionDisability>(
                    value: _dis,
                    items: const [
                      DropdownMenuItem(value: NutritionDisability.none, child: Text("None")),
                      DropdownMenuItem(value: NutritionDisability.diabetesT1, child: Text("Diabetes (Type 1)")),
                      DropdownMenuItem(value: NutritionDisability.diabetesT2, child: Text("Diabetes (Type 2)")),
                      DropdownMenuItem(value: NutritionDisability.coeliac, child: Text("Coeliac (gluten free)")),
                      DropdownMenuItem(value: NutritionDisability.ibs, child: Text("IBS")),
                      DropdownMenuItem(value: NutritionDisability.ckd, child: Text("Chronic Kidney Disease (CKD)")),
                      DropdownMenuItem(value: NutritionDisability.hypertension, child: Text("Hypertension")),
                      DropdownMenuItem(value: NutritionDisability.pcos, child: Text("PCOS")),
                      DropdownMenuItem(value: NutritionDisability.eatingDisorderSupport, child: Text("Eating disorder support")),
                      DropdownMenuItem(value: NutritionDisability.other, child: Text("Other")),
                    ],
                    onChanged: (v) => setState(() => _dis = v ?? NutritionDisability.none),
                    decoration: const InputDecoration(labelText: "Condition", border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _notes,
                    decoration: const InputDecoration(
                      labelText: "Notes (required if not None)",
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 4,
                  ),

                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () async {
                        if (profile == null) return;

                        if (_dis != NutritionDisability.none && _notes.text.trim().length < 5) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Add a short note so the system can adapt the plan.")),
                          );
                          return;
                        }

                        final updated = UserProfile(
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          age: profile.age,
                          heightCm: profile.heightCm,
                          weightKg: profile.weightKg,
                          activityLevel: profile.activityLevel,
                          goal: profile.goal,
                          dietaryPreference: profile.dietaryPreference,
                          allergies: profile.allergies,
                          nutritionDisability: _dis,
                          disabilityNotes: _notes.text.trim(),
                        );

                        await state.saveProfile(updated);
                      },
                      child: const Text("Save and go to dashboard"),
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
