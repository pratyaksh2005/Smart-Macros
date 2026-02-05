import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';

class Storage {
  static const _userKey = 'sm_user';
  static const _groceryKey = 'sm_grocery';

  static Future<AuthUser?> getUser() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_userKey);
    if (raw == null) return null;
    final j = jsonDecode(raw) as Map<String, dynamic>;
    return AuthUser.fromJson(j);
  }

  static Future<void> setUser(AuthUser user) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_userKey, jsonEncode(user.toJson()));
  }

  static Future<void> clearUser() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_userKey);
  }

  static Future<List<GroceryItem>> getGrocery() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_groceryKey);
    if (raw == null) return [];
    final list = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
    return list.map(GroceryItem.fromJson).toList();
  }

  static Future<void> setGrocery(List<GroceryItem> items) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_groceryKey, jsonEncode(items.map((e) => e.toJson()).toList()));
  }
}