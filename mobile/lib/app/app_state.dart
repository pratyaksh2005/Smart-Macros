import 'dart:math';
import 'package:flutter/foundation.dart';
import 'models.dart';
import 'storage.dart';

enum Gate { login, onboarding, medical, app }

class AppState extends ChangeNotifier {
  AuthUser? user;
  List<GroceryItem> grocery = [];
  Gate gate = Gate.login;

  Future<void> init() async {
    user = await Storage.getUser();
    grocery = await Storage.getGrocery();
    _recomputeGate();
  }

  void _recomputeGate() {
    if (user == null) {
      gate = Gate.login;
    } else if (user!.profile == null) {
      gate = Gate.onboarding;
    } else if (user!.profile!.nutritionDisability != NutritionDisability.none &&
        user!.profile!.disabilityNotes.isEmpty) {
      gate = Gate.medical;
    } else {
      gate = Gate.app;
    }
    notifyListeners();
  }

  Future<void> loginMock(String email) async {
    user = AuthUser(
      email: email,
      createdAt: DateTime.now().toIso8601String(),
      profile: user?.profile,
    );
    await Storage.setUser(user!);
    _recomputeGate();
  }

  Future<void> logout() async {
    user = null;
    grocery = [];
    await Storage.clearUser();
    await Storage.setGrocery([]);
    _recomputeGate();
  }

  Future<void> saveProfile(UserProfile profile) async {
    if (user == null) return;
    user = AuthUser(
      email: user!.email,
      createdAt: user!.createdAt,
      profile: profile,
    );
    await Storage.setUser(user!);
    _recomputeGate();
  }

  String _id() => "${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(999999)}";

  void generateStarterList() async {
    final p = user?.profile;
    final goal = p?.goal ?? Goal.maintain;
    final diet = p?.dietaryPreference ?? DietaryPreference.none;

    final items = <GroceryItem>[
      GroceryItem(id: _id(), name: "Chicken breast", quantity: "1 kg", category: "Protein", checked: false),
      GroceryItem(id: _id(), name: "Eggs", quantity: "12", category: "Protein", checked: false),
      GroceryItem(id: _id(), name: "Rice", quantity: "1 kg", category: "Carbs", checked: false),
      GroceryItem(id: _id(), name: "Oats", quantity: "1 pack", category: "Carbs", checked: false),
      GroceryItem(id: _id(), name: "Broccoli", quantity: "2 heads", category: "Veg", checked: false),
      GroceryItem(id: _id(), name: "Bananas", quantity: "6", category: "Fruit", checked: false),
    ];

    if (diet == DietaryPreference.vegan) {
      items.removeWhere((i) => i.name == "Chicken breast" || i.name == "Eggs");
      items.add(GroceryItem(id: _id(), name: "Tofu", quantity: "2 blocks", category: "Protein", checked: false));
    }

    if (goal == Goal.bulk) {
      items.add(GroceryItem(id: _id(), name: "Peanut butter", quantity: "1 jar", category: "Fats", checked: false));
    }

    grocery = items;
    await Storage.setGrocery(grocery);
    notifyListeners();
  }

  void toggleItem(String id) async {
    grocery = grocery
        .map((i) => i.id == id ? i.copyWith(checked: !i.checked) : i)
        .toList();
    await Storage.setGrocery(grocery);
    notifyListeners();
  }

  void addItem(GroceryItem item) async {
    grocery.insert(0, item);
    await Storage.setGrocery(grocery);
    notifyListeners();
  }

  void removeItem(String id) async {
    grocery.removeWhere((i) => i.id == id);
    await Storage.setGrocery(grocery);
    notifyListeners();
  }
}
