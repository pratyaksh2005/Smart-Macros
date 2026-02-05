import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../app/app_state.dart';
import '../../app/models.dart';

class MealsTab extends StatelessWidget {
  const MealsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final pref = state.user?.profile?.dietaryPreference ?? DietaryPreference.none;

    final meals = pref == DietaryPreference.vegan
        ? ["Breakfast: Oats + berries", "Lunch: Lentil bowl", "Dinner: Tofu stir-fry"]
        : pref == DietaryPreference.vegetarian
            ? ["Breakfast: Greek yogurt + fruit", "Lunch: Paneer wrap", "Dinner: Veg chilli"]
            : ["Breakfast: Eggs + toast", "Lunch: Chicken rice bowl", "Dinner: Salmon + veg"];

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
                const Text("Meal plan", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 10),
                ...meals.asMap().entries.map((e) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text("${e.key + 1}. ${e.value}"),
                    )),
                const SizedBox(height: 10),
                Text(
                  "Template plan for prototype. Later becomes AI-generated and clinician-aware.",
                  style: TextStyle(color: Colors.grey.shade700),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
