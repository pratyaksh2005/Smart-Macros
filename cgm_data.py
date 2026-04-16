import csv
import random
import uuid

conditions = ["Type 2 Diabetes", "Pre-Diabetes", "Healthy Baseline"]

# Meals split between standard unoptimized food and AI-optimized swaps
meals = [
    {"name": "Standard White Pasta Bolognese", "type": "Unoptimized (High GI)", "base_spike": 3.5},
    {"name": "AI-Optimized Chickpea Pasta", "type": "Optimized (Low GI)", "base_spike": 1.2},
    {"name": "White Rice & Sweet & Sour Chicken", "type": "Unoptimized (High GI)", "base_spike": 3.8},
    {"name": "AI-Optimized Quinoa & Grilled Chicken", "type": "Optimized (Low GI)", "base_spike": 1.1},
    {"name": "Standard Breakfast Cereal & Milk", "type": "Unoptimized (High GI)", "base_spike": 3.2},
    {"name": "AI-Optimized Oats & Berries", "type": "Optimized (Low GI)", "base_spike": 0.9}
]

def generate_cgm_profile():
    condition = random.choices(conditions, weights=[40, 30, 30])[0]
    meal = random.choice(meals)
    
    # Set fasting baseline glucose in mmol/L based on UK medical standards
    if condition == "Type 2 Diabetes":
        baseline = round(random.uniform(7.0, 9.5), 1)
        recovery_speed = random.uniform(0.3, 0.5) # Slower recovery
        spike_multiplier = 1.8 # Higher spike
    elif condition == "Pre-Diabetes":
        baseline = round(random.uniform(5.5, 6.9), 1)
        recovery_speed = random.uniform(0.5, 0.7)
        spike_multiplier = 1.4
    else:
        baseline = round(random.uniform(4.0, 5.4), 1)
        recovery_speed = random.uniform(0.8, 1.2) # Fast recovery
        spike_multiplier = 1.0

    # Calculate the 4-hour glucose curve
    spike_amount = meal["base_spike"] * spike_multiplier
    
    hour_0 = baseline
    hour_1 = round(baseline + spike_amount, 1) # Peak usually hits around 1 hour
    hour_2 = round(hour_1 - (spike_amount * recovery_speed * 0.5), 1)
    hour_3 = round(hour_2 - (spike_amount * recovery_speed * 0.3), 1)
    hour_4 = round(max(baseline, hour_3 - (spike_amount * recovery_speed * 0.2)), 1)

    # Flag dangerous clinical spikes (above 10.0 mmol/L is a common clinical alert threshold)
    clinical_alert = "CRITICAL SPIKE" if hour_1 > 10.0 else "Stable"

    return {
        "patient_id": str(uuid.uuid4())[:8],
        "clinical_condition": condition,
        "meal_consumed": meal["name"],
        "meal_classification": meal["type"],
        "fasting_glucose_0h_mmol": hour_0,
        "peak_glucose_1h_mmol": hour_1,
        "glucose_2h_mmol": hour_2,
        "glucose_3h_mmol": hour_3,
        "glucose_4h_mmol": hour_4,
        "cgm_alert_status": clinical_alert
    }

print("Generating 60-patient clinical CGM simulation...")
with open('smart_macros_cgm.csv', mode='w', newline='') as file:
    fieldnames = [
        "patient_id", "clinical_condition", "meal_consumed", "meal_classification", 
        "fasting_glucose_0h_mmol", "peak_glucose_1h_mmol", "glucose_2h_mmol", 
        "glucose_3h_mmol", "glucose_4h_mmol", "cgm_alert_status"
    ]
    
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    
    for _ in range(60):
        writer.writerow(generate_cgm_profile())

print("Data generated: smart_macros_cgm.csv")