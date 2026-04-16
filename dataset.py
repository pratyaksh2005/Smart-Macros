import csv
import random
import uuid

# Clinical conditions and baseline metrics
conditions = ["Type 2 Diabetes", "Coeliac", "Hypertension", "PCOS", "IBS", "None"]
diet_prefs = ["NONE", "VEGAN", "VEGETARIAN", "HALAL"]

def generate_patient():
    condition = random.choices(conditions, weights=[30, 10, 25, 15, 10, 10])[0]
    
    # Starting biometrics based on condition
    start_weight = round(random.uniform(70.0, 120.0), 1)
    if condition == "Type 2 Diabetes":
        start_hba1c = round(random.uniform(6.5, 9.5), 1)
        end_hba1c = round(start_hba1c - random.uniform(0.2, 1.5), 1) # Shows improvement
    else:
        start_hba1c = round(random.uniform(4.0, 5.6), 1)
        end_hba1c = start_hba1c

    # Simulation of the Smart Macros Value Prop
    target_budget = random.randint(45, 90)
    actual_spend = round(target_budget * random.uniform(0.85, 0.98), 2) # AI saves them money
    macro_adherence = random.randint(75, 98) # High adherence due to easy basket integration
    cart_conversion = random.randint(60, 100) # Did they checkout the cart?

    return {
        "patient_id": str(uuid.uuid4())[:8], # Simulated anonymized ID
        "clinical_condition": condition,
        "dietary_preference": random.choice(diet_prefs),
        "starting_weight_kg": start_weight,
        "ending_weight_kg": round(start_weight - random.uniform(0.5, 5.0), 1),
        "starting_hba1c": start_hba1c,
        "ending_hba1c": end_hba1c,
        "weekly_budget_gbp": target_budget,
        "actual_ai_basket_cost_gbp": actual_spend,
        "weekly_savings_gbp": round(target_budget - actual_spend, 2),
        "macro_adherence_pct": macro_adherence,
        "cart_conversion_pct": cart_conversion
    }

# Generate 10,000 rows
print("Generating 10,000 Digital Twins...")
with open('smart_macros_cohort.csv', mode='w', newline='') as file:
    fieldnames = ["patient_id", "clinical_condition", "dietary_preference", "starting_weight_kg", 
                  "ending_weight_kg", "starting_hba1c", "ending_hba1c", "weekly_budget_gbp", 
                  "actual_ai_basket_cost_gbp", "weekly_savings_gbp", "macro_adherence_pct", "cart_conversion_pct"]
    
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    
    for _ in range(10000):
        writer.writerow(generate_patient())

print("Data generated: smart_macros_cohort.csv")