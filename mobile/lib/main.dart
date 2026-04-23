import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

void main() {
  runApp(const SmartMacrosApp());
}

class SmartMacrosApp extends StatelessWidget {
  const SmartMacrosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Macros',
      theme: ThemeData(
        primaryColor: const Color(0xFF2563eb),
        scaffoldBackgroundColor: const Color(0xFFf8fafc),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563eb)),
        useMaterial3: true,
      ),
      home: const DemoLoginScreen(),
    );
  }
}

// --- DEMO LOGIN SCREEN ---
class DemoLoginScreen extends StatelessWidget {
  const DemoLoginScreen({super.key});

  Future<void> _loginAsDemoPatient(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();

    // Inject the perfect Diabetic Test Profile
    final demoProfile = {
      "firstName": "Test",
      "lastName": "Patient",
      "age": 45,
      "nutritionDisability": "DIABETES_T2",
    };

    await prefs.setString(
      "sm_user",
      jsonEncode({
        "email": "patient@smartmacros.uk",
        "role": "PATIENT",
        "profile": demoProfile,
      }),
    );

    if (context.mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const CompanionDashboard()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "Smart Macros",
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0f172a),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "Mobile Companion v1.0",
                style: TextStyle(color: Color(0xFF64748b)),
              ),
              const SizedBox(height: 40),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFeff6ff),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF93c5fd)),
                ),
                child: const Text(
                  "VIVA DEMONSTRATION MODE ACTIVE",
                  style: TextStyle(
                    color: Color(0xFF1e3a8a),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563eb),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: () => _loginAsDemoPatient(context),
                  child: const Text(
                    "👤 Launch Mobile Portal",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// --- COMPANION DASHBOARD (Tabs) ---
class CompanionDashboard extends StatefulWidget {
  const CompanionDashboard({super.key});

  @override
  State<CompanionDashboard> createState() => _CompanionDashboardState();
}

class _CompanionDashboardState extends State<CompanionDashboard> {
  int _currentIndex = 0;
  final List<Widget> _screens = [const DietEngineTab(), const TimelineTab()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Smart Macros",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0f172a),
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.redAccent),
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove("sm_user");
              if (context.mounted) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const DemoLoginScreen(),
                  ),
                );
              }
            },
          ),
        ],
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: const Color(0xFF2563eb),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu),
            label: "Diet Engine",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: "Clinical Log",
          ),
        ],
      ),
    );
  }
}

// --- TAB 1: DIET ENGINE ---
class DietEngineTab extends StatefulWidget {
  const DietEngineTab({super.key});

  @override
  State<DietEngineTab> createState() => _DietEngineTabState();
}

class _DietEngineTabState extends State<DietEngineTab> {
  String _mealType = "Breakfast";
  final TextEditingController _proteinController = TextEditingController();
  bool _isGenerating = false;
  List<dynamic>? _generatedMeal;

  Future<void> _generateMeal() async {
    setState(() => _isGenerating = true);

    // CRITICAL: 10.0.2.2 points to your computer's localhost from the Android Emulator!
    // If using an iOS Simulator, change this to 127.0.0.1
    const String apiUrl = "http://127.0.0.1:8000/api/v1/engine/basket-optimizer";

    final payload = {
      "patient_profile": {
        "patient_id": "demo",
        "condition_code": "DIABETES_T2",
      },
      "target_protein_g": _proteinController.text.isEmpty
          ? null
          : double.tryParse(_proteinController.text),
      "current_symptom": "NONE",
      "meal_type": _mealType,
    };

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() => _generatedMeal = data["basket_items"]);
      } else {
        _showError("AI Engine offline or unreachable.");
      }
    } catch (e) {
      _showError("Network Error. Ensure Uvicorn is running and IP is correct.");
    } finally {
      setState(() => _isGenerating = false);
    }
  }

  Future<void> _logAction(String actionType, String desc) async {
    final prefs = await SharedPreferences.getInstance();
    final String now =
        "${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}";

    List<dynamic> timeline = jsonDecode(
      prefs.getString("sm_mobile_timeline") ?? "[]",
    );

    timeline.add({
      "id": DateTime.now().millisecondsSinceEpoch.toString(),
      "timestamp": now,
      "type": actionType,
      "title": "$_mealType $actionType",
      "description": desc,
      "alert": false,
    });

    await prefs.setString("sm_mobile_timeline", jsonEncode(timeline));

    setState(() {
      _generatedMeal = null;
      // Advance meal logic (simplified for mobile)
      if (_mealType == "Breakfast")
        _mealType = "Lunch";
      else if (_mealType == "Lunch")
        _mealType = "Dinner";
      else
        _mealType = "Breakfast";
    });

    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("$_mealType action logged!")));
    }
  }

  void _showError(String msg) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(msg, style: const TextStyle(color: Colors.white)),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Synthesize Clinical Meal",
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Column(
              children: [
                DropdownButtonFormField<String>(
                  value: _mealType,
                  decoration: const InputDecoration(
                    labelText: "Meal Type",
                    border: OutlineInputBorder(),
                  ),
                  items: ["Breakfast", "Lunch", "Dinner"]
                      .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                      .toList(),
                  onChanged: (v) => setState(() => _mealType = v!),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _proteinController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: "Protein Target (g) [Optional - Auto if blank]",
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563eb),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        onPressed: _isGenerating ? null : _generateMeal,
                        child: Text(
                          _isGenerating
                              ? "Consulting AI..."
                              : "Generate $_mealType",
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFf1f5f9),
                        foregroundColor: const Color(0xFF64748b),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      onPressed: () => _logAction(
                        "Skipped",
                        "Patient opted to skip this meal.",
                      ),
                      child: const Text("Skip"),
                    ),
                  ],
                ),
              ],
            ),
          ),

          if (_generatedMeal != null) ...[
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFeff6ff),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF93c5fd)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Proposed $_mealType",
                    style: const TextStyle(
                      color: Color(0xFF1e3a8a),
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._generatedMeal!.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 4.0),
                      child: Text(
                        "• ${item['name']}",
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0f172a),
                        foregroundColor: Colors.white,
                      ),
                      onPressed: () =>
                          _logAction("Logged", "Consumed AI-generated meal."),
                      child: Text("Log $_mealType to Timeline"),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// --- TAB 2: TIMELINE ---
class TimelineTab extends StatefulWidget {
  const TimelineTab({super.key});

  @override
  State<TimelineTab> createState() => _TimelineTabState();
}

class _TimelineTabState extends State<TimelineTab> {
  List<dynamic> _timeline = [];

  @override
  void initState() {
    super.initState();
    _loadTimeline();
  }

  Future<void> _loadTimeline() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _timeline = jsonDecode(prefs.getString("sm_mobile_timeline") ?? "[]");
      // Sort Morning to Night
      _timeline.sort((a, b) {
        final aTime = a['timestamp'].split(':');
        final bTime = b['timestamp'].split(':');
        return (int.parse(aTime[0]) * 60 + int.parse(aTime[1])).compareTo(
          (int.parse(bTime[0]) * 60 + int.parse(bTime[1])),
        );
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return _timeline.isEmpty
        ? const Center(
            child: Text(
              "No events logged today.",
              style: TextStyle(color: Colors.grey),
            ),
          )
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _timeline.length,
            itemBuilder: (context, index) {
              final event = _timeline[index];
              final isSkip = event['type'] == 'Skipped';
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isSkip
                      ? const Color(0xFFfffbeb)
                      : const Color(0xFFf0fdf4),
                  borderRadius: BorderRadius.circular(8),
                  border: Border(
                    left: BorderSide(
                      color: isSkip ? Colors.orange : Colors.green,
                      width: 4,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      event['timestamp'],
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF64748b),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            event['title'],
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            event['description'],
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF475569),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
  }
}
