import requests
import json
import random
import time

print("🛒 INITIALIZING UK GROCERY DATA PIPELINE...")
print("📡 Connecting to Open Food Facts API (UK Region)...")

# Strategic categories to set up our MOO Algorithm "Conflicts"
CATEGORIES = {
    "chicken breast": {"base_price_pennies": 450, "is_processed": False},
    "sausages": {"base_price_pennies": 150, "is_processed": True}, # The CVD Trap (Cheap, High Sodium)
    "bacon": {"base_price_pennies": 180, "is_processed": True},    # The CVD Trap
    "lentils": {"base_price_pennies": 90, "is_processed": False},  # The Holy Grail (Cheap, High Fiber, Low Sodium)
    "kidney beans": {"base_price_pennies": 65, "is_processed": False},
    "salmon": {"base_price_pennies": 500, "is_processed": False},
    "brown rice": {"base_price_pennies": 120, "is_processed": False},
    "white bread": {"base_price_pennies": 80, "is_processed": True}, # High GI
    "oats": {"base_price_pennies": 100, "is_processed": False},      # Low GI
    "cheddar cheese": {"base_price_pennies": 250, "is_processed": False}
}

headers = {
    'User-Agent': 'SmartMacrosFYP - Academic Project - Python'
}

grocery_database = []

for category, meta in CATEGORIES.items():
    print(f"   -> Fetching data for: {category.title()}...")
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={category}&search_simple=1&action=process&json=1&page_size=10&countries=United Kingdom"
    
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        
        for product in data.get('products', []):
            nutriments = product.get('nutriments', {})
            
            # Skip products with missing core data to keep our DB pristine
            if 'proteins_100g' not in nutriments or 'carbohydrates_100g' not in nutriments:
                continue
                
            # Extract Macros (Default to 0 if missing)
            protein = float(nutriments.get('proteins_100g', 0))
            carbs = float(nutriments.get('carbohydrates_100g', 0))
            fiber = float(nutriments.get('fiber_100g', 0))
            fat = float(nutriments.get('fat_100g', 0))
            sat_fat = float(nutriments.get('saturated-fat_100g', 0))
            sodium = float(nutriments.get('sodium_100g', 0)) # Vital for CVD
            energy_kcal = float(nutriments.get('energy-kcal_100g', 0))
            
            # Extract Allergens (Looking for Gluten/Wheat for Coeliac disease)
            allergens = product.get('allergens_tags', [])
            is_gluten_free = not any('gluten' in a.lower() or 'wheat' in a.lower() for a in allergens)

            # Generate a realistic UK price in pennies (Add a little randomness so items aren't identical)
            price_variance = random.randint(-20, 40)
            simulated_price = max(50, meta["base_price_pennies"] + price_variance)
            
            # Determine Glycemic Index (Heuristic based on fiber and carbs)
            if carbs < 5:
                gi_index = "LOW"
            elif fiber > 5 and carbs < 50:
                gi_index = "LOW"
            elif carbs > 50 and fiber < 3:
                gi_index = "HIGH"
            else:
                gi_index = "MEDIUM"

            item = {
                "id": product.get('_id', str(random.randint(10000, 99999))),
                "name": product.get('product_name_en', product.get('product_name', 'Unknown Item')).title(),
                "category": category,
                "is_processed": meta["is_processed"],
                "price_pennies": simulated_price,
                "is_gluten_free": is_gluten_free,
                "gi_index": gi_index,
                "macros_per_100g": {
                    "calories": energy_kcal,
                    "protein_g": protein,
                    "carbs_g": carbs,
                    "fiber_g": fiber,
                    "fat_g": fat,
                    "sat_fat_g": sat_fat,
                    "sodium_g": sodium
                }
            }
            
            # Avoid duplicates
            if not any(existing_item['name'] == item['name'] for existing_item in grocery_database):
                # Clean up empty names
                if item['name'] and item['name'] != 'Unknown Item':
                    grocery_database.append(item)
            
        time.sleep(1) # Be polite to the API to avoid rate limits
        
    except Exception as e:
        print(f"⚠️ Error fetching {category}: {e}")

print(f"\n✅ PIPELINE COMPLETE. Successfully extracted {len(grocery_database)} clinical-grade food items.")

# Save to local JSON database
with open("uk_grocery_db.json", "w") as f:
    json.dump(grocery_database, f, indent=4)

print("💾 Database saved to 'uk_grocery_db.json'. Ready for MOO Engine ingestion.")