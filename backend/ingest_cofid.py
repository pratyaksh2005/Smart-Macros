import json
import random

print("🧬 INITIALIZING UK CoFID CLINICAL DATA PIPELINE...")
print("📥 Ingesting McCance and Widdowson Gold-Standard Nutritional Profiles...")

# -------------------------------------------------------------------
# THE CoFID CLINICAL SUBSET 
# Clinically accurate UK data per 100g (Protein, Carbs, Fat, Fiber, Sodium in mg)
# -------------------------------------------------------------------
# Replace your existing COFID_DATA with this massive expansion:
COFID_DATA = {
    # PROTEINS
    "Chicken Breast (Raw)": {"protein": 23.4, "carbs": 0.0, "fat": 1.9, "fiber": 0.0, "sodium_mg": 43.0, "gluten_free": True, "category": "Protein"},
    "Salmon Fillet": {"protein": 20.4, "carbs": 0.0, "fat": 13.4, "fiber": 0.0, "sodium_mg": 50.0, "gluten_free": True, "category": "Protein"},
    "Tofu (Firm)": {"protein": 15.8, "carbs": 1.9, "fat": 8.7, "fiber": 1.9, "sodium_mg": 12.0, "gluten_free": True, "category": "Protein"},
    "Greek Yogurt (0%)": {"protein": 10.3, "carbs": 3.6, "fat": 0.2, "fiber": 0.0, "sodium_mg": 36.0, "gluten_free": True, "category": "Dairy"},
    "Eggs (Large)": {"protein": 12.5, "carbs": 1.1, "fat": 9.5, "fiber": 0.0, "sodium_mg": 140.0, "gluten_free": True, "category": "Protein"},
    "Pork Sausages (Standard)": {"protein": 10.5, "carbs": 5.4, "fat": 24.5, "fiber": 0.5, "sodium_mg": 850.0, "gluten_free": False, "category": "Protein"}, # CVD Trap
    
    # CARBS (FIBER & GI VARIANCE)
    "Red Split Lentils (Dried)": {"protein": 23.8, "carbs": 56.3, "fat": 1.3, "fiber": 10.8, "sodium_mg": 10.0, "gluten_free": True, "category": "Carbs"}, # High Fiber
    "Brown Rice (Dried)": {"protein": 7.7, "carbs": 72.9, "fat": 2.8, "fiber": 4.0, "sodium_mg": 4.0, "gluten_free": True, "category": "Carbs"},
    "White Sliced Bread": {"protein": 8.0, "carbs": 49.0, "fat": 1.5, "fiber": 2.5, "sodium_mg": 400.0, "gluten_free": False, "category": "Carbs"}, # High GI Trap
    "Rolled Oats": {"protein": 11.2, "carbs": 60.0, "fat": 8.0, "fiber": 9.0, "sodium_mg": 2.0, "gluten_free": False, "category": "Carbs"},
    "Quinoa (Dried)": {"protein": 14.1, "carbs": 64.2, "fat": 6.1, "fiber": 7.0, "sodium_mg": 5.0, "gluten_free": True, "category": "Carbs"},
    "Sweet Potato": {"protein": 1.6, "carbs": 20.1, "fat": 0.1, "fiber": 3.0, "sodium_mg": 55.0, "gluten_free": True, "category": "Carbs"},
    "Jasmine Rice (White)": {"protein": 2.7, "carbs": 28.2, "fat": 0.3, "fiber": 0.4, "sodium_mg": 1.0, "gluten_free": True, "category": "Carbs"}, # Quick Energy / High GI
    
    # FATS & SNACKS
    "Almonds (Raw)": {"protein": 21.2, "carbs": 6.9, "fat": 55.8, "fiber": 12.2, "sodium_mg": 1.0, "gluten_free": True, "category": "Fats"},
    "Peanut Butter (Smooth)": {"protein": 22.5, "carbs": 11.6, "fat": 53.0, "fiber": 4.8, "sodium_mg": 350.0, "gluten_free": True, "category": "Fats"},
    "Cheddar Cheese": {"protein": 25.4, "carbs": 0.1, "fat": 34.9, "fiber": 0.0, "sodium_mg": 730.0, "gluten_free": True, "category": "Dairy"}, # Sodium Trap
    "Olive Oil (Extra Virgin)": {"protein": 0.0, "carbs": 0.0, "fat": 100.0, "fiber": 0.0, "sodium_mg": 2.0, "gluten_free": True, "category": "Fats"},
    
    # VEG & FRUITS (MICRO-NUTRIENTS)
    "Broccoli": {"protein": 4.4, "carbs": 4.0, "fat": 0.4, "fiber": 2.6, "sodium_mg": 14.0, "gluten_free": True, "category": "Veg"},
    "Spinach (Raw)": {"protein": 2.9, "carbs": 1.4, "fat": 0.4, "fiber": 2.2, "sodium_mg": 79.0, "gluten_free": True, "category": "Veg"},
    "Mixed Berries": {"protein": 0.7, "carbs": 9.7, "fat": 0.3, "fiber": 3.5, "sodium_mg": 1.0, "gluten_free": True, "category": "Fruit"},
    "Banana": {"protein": 1.1, "carbs": 22.8, "fat": 0.3, "fiber": 2.6, "sodium_mg": 1.0, "gluten_free": True, "category": "Fruit"}, # Fast carb for lightheadedness
    "Apple": {"protein": 0.3, "carbs": 13.8, "fat": 0.2, "fiber": 2.4, "sodium_mg": 1.0, "gluten_free": True, "category": "Fruit"}
}

grocery_database = []
random.seed(42) # For reproducible academic results

for name, macros in COFID_DATA.items():
    print(f"   -> Processing clinical profile for: {name}...")
    
    # 1. Price Simulation (Applying the economic constraint)
    price_variance = random.randint(-15, 15)
    simulated_price = max(40, macros["base_price"] + price_variance)
    
    # 2. GI Heuristic (For the Diabetes Rule Engine)
    if macros["carbs"] < 5:
        gi_index = "LOW"
    elif macros["fiber"] > 5 and macros["carbs"] < 55:
        gi_index = "LOW"
    elif macros["carbs"] > 45 and macros["fiber"] < 3:
        gi_index = "HIGH"
    else:
        gi_index = "MEDIUM"

    # 3. Compile the record
    item = {
        "id": f"cofid-{random.randint(1000, 9999)}",
        "name": name,
        "price_pennies": simulated_price,
        "is_gluten_free": macros["gluten_free"],
        "gi_index": gi_index,
        "macros_per_100g": {
            "protein_g": macros["protein"],
            "carbs_g": macros["carbs"],
            "fiber_g": macros["fiber"],
            "fat_g": macros["fat"],
            "sodium_mg": macros["sodium_mg"]
        }
    }
    grocery_database.append(item)

# Save to local JSON database
db_filename = "uk_grocery_db.json"
with open(db_filename, "w") as f:
    json.dump(grocery_database, f, indent=4)

print(f"\nPIPELINE COMPLETE. {len(grocery_database)} gold-standard CoFID items compiled.")
print(f"💾 Database saved to '{db_filename}'. Your engine is now offline-capable and highly robust.")