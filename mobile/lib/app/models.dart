import 'dart:convert';

enum ActivityLevel { sedentary, light, moderate, high }
enum Goal { cut, maintain, bulk }
enum DietaryPreference { none, vegetarian, vegan, halal, kosher }

enum NutritionDisability {
  none,
  diabetesT1,
  diabetesT2,
  coeliac,
  ibs,
  ckd,
  hypertension,
  pcos,
  eatingDisorderSupport,
  other,
}

class UserProfile {
  final String firstName;
  final String lastName;
  final int age;
  final int heightCm;
  final int weightKg;
  final ActivityLevel activityLevel;
  final Goal goal;
  final DietaryPreference dietaryPreference;
  final List<String> allergies;
  final NutritionDisability nutritionDisability;
  final String disabilityNotes;

  UserProfile({
    required this.firstName,
    required this.lastName,
    required this.age,
    required this.heightCm,
    required this.weightKg,
    required this.activityLevel,
    required this.goal,
    required this.dietaryPreference,
    required this.allergies,
    required this.nutritionDisability,
    required this.disabilityNotes,
  });

  Map<String, dynamic> toJson() => {
        'firstName': firstName,
        'lastName': lastName,
        'age': age,
        'heightCm': heightCm,
        'weightKg': weightKg,
        'activityLevel': activityLevel.name,
        'goal': goal.name,
        'dietaryPreference': dietaryPreference.name,
        'allergies': allergies,
        'nutritionDisability': nutritionDisability.name,
        'disabilityNotes': disabilityNotes,
      };

  static UserProfile fromJson(Map<String, dynamic> j) => UserProfile(
        firstName: j['firstName'],
        lastName: j['lastName'],
        age: j['age'],
        heightCm: j['heightCm'],
        weightKg: j['weightKg'],
        activityLevel: ActivityLevel.values.byName(j['activityLevel']),
        goal: Goal.values.byName(j['goal']),
        dietaryPreference: DietaryPreference.values.byName(j['dietaryPreference']),
        allergies: (j['allergies'] as List).map((e) => e.toString()).toList(),
        nutritionDisability: NutritionDisability.values.byName(j['nutritionDisability']),
        disabilityNotes: (j['disabilityNotes'] ?? '').toString(),
      );

  static String encode(UserProfile p) => jsonEncode(p.toJson());
  static UserProfile decode(String s) => fromJson(jsonDecode(s));
}

class AuthUser {
  final String email;
  final String createdAt;
  final UserProfile? profile;

  AuthUser({
    required this.email,
    required this.createdAt,
    required this.profile,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'createdAt': createdAt,
        'profile': profile?.toJson(),
      };

  static AuthUser fromJson(Map<String, dynamic> j) => AuthUser(
        email: j['email'],
        createdAt: j['createdAt'],
        profile: j['profile'] == null ? null : UserProfile.fromJson(j['profile']),
      );
}

class GroceryItem {
  final String id;
  final String name;
  final String quantity;
  final String category;
  final bool checked;

  GroceryItem({
    required this.id,
    required this.name,
    required this.quantity,
    required this.category,
    required this.checked,
  });

  GroceryItem copyWith({bool? checked}) => GroceryItem(
        id: id,
        name: name,
        quantity: quantity,
        category: category,
        checked: checked ?? this.checked,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'quantity': quantity,
        'category': category,
        'checked': checked,
      };

  static GroceryItem fromJson(Map<String, dynamic> j) => GroceryItem(
        id: j['id'],
        name: j['name'],
        quantity: j['quantity'],
        category: j['category'],
        checked: j['checked'] == true,
      );
}