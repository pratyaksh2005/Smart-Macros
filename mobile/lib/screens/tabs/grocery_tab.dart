import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../app/app_state.dart';
import '../../app/models.dart';

class GroceryTab extends StatefulWidget {
  const GroceryTab({super.key});

  @override
  State<GroceryTab> createState() => _GroceryTabState();
}

class _GroceryTabState extends State<GroceryTab> {
  final _name = TextEditingController();
  final _qty = TextEditingController();
  String _category = "Other";

  @override
  void dispose() {
    _name.dispose();
    _qty.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final items = state.grocery;

    final done = items.where((i) => i.checked).length;
    final remaining = items.length - done;

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
                const Text("Grocery list", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text("Total ${items.length} · Remaining $remaining · Done $done",
                    style: TextStyle(color: Colors.grey.shade700)),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: FilledButton(
                        onPressed: () => state.generateStarterList(),
                        child: const Text("Generate starter list"),
                      ),
                    ),
                    const SizedBox(width: 10),
                    IconButton(
                      onPressed: items.isEmpty
                          ? null
                          : () {
                              for (final i in List<GroceryItem>.from(items)) {
                                if (i.checked) {
                                  state.removeItem(i.id);
                                }
                              }
                            },
                      icon: const Icon(Icons.cleaning_services),
                      tooltip: "Clear checked",
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 12),

        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Add item", style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 10),

                TextField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: "Item", border: OutlineInputBorder()),
                ),
                const SizedBox(height: 10),

                TextField(
                  controller: _qty,
                  decoration: const InputDecoration(labelText: "Quantity", border: OutlineInputBorder()),
                ),
                const SizedBox(height: 10),

                DropdownButtonFormField<String>(
                  value: _category,
                  decoration: const InputDecoration(labelText: "Category", border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: "Protein", child: Text("Protein")),
                    DropdownMenuItem(value: "Carbs", child: Text("Carbs")),
                    DropdownMenuItem(value: "Fats", child: Text("Fats")),
                    DropdownMenuItem(value: "Veg", child: Text("Veg")),
                    DropdownMenuItem(value: "Fruit", child: Text("Fruit")),
                    DropdownMenuItem(value: "Dairy", child: Text("Dairy")),
                    DropdownMenuItem(value: "Other", child: Text("Other")),
                  ],
                  onChanged: (v) => setState(() => _category = v ?? "Other"),
                ),
                const SizedBox(height: 12),

                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () {
                      final name = _name.text.trim();
                      if (name.isEmpty) return;

                      final qty = _qty.text.trim().isEmpty ? "1" : _qty.text.trim();

                      state.addItem(
                        GroceryItem(
                          id: DateTime.now().millisecondsSinceEpoch.toString(),
                          name: name,
                          quantity: qty,
                          category: _category,
                          checked: false,
                        ),
                      );

                      _name.clear();
                      _qty.clear();
                      setState(() => _category = "Other");
                    },
                    child: const Text("Add item"),
                  ),
                )
              ],
            ),
          ),
        ),

        const SizedBox(height: 12),

        if (items.isEmpty)
          Text("No items yet. Generate a starter list or add your own.",
              style: TextStyle(color: Colors.grey.shade700))
        else
          ...items.map((i) => Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                child: ListTile(
                  leading: Checkbox(
                    value: i.checked,
                    onChanged: (_) => state.toggleItem(i.id),
                  ),
                  title: Text(i.name),
                  subtitle: Text("${i.quantity} · ${i.category}"),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () => state.removeItem(i.id),
                  ),
                ),
              )),
      ],
    );
  }
}
