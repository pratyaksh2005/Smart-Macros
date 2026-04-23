from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from pathlib import Path
import joblib
import json
import random
import sqlite3
from datetime import datetime

app = FastAPI(title="Smart Macros Clinical Engine V3 - Distinction Edition")


# --- DATABASE INITIALIZATION ---
# This automatically creates 'clinical_records.db' on your hard drive
def init_db():
    conn = sqlite3.connect("clinical_records.db")
    cursor = conn.cursor()
    # Create a relational table with a Primary Key and Timestamp
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS telemetry_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_email TEXT,
            event_type TEXT,
            event_description TEXT,
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


init_db()  # Run immediately on startup

# --- CORS MIDDLEWARE (10-SECOND FIX) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production this would be your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD AI MODEL & LOCAL DATABASE ---
try:
    risk_model = joblib.load(Path(__file__).with_name("clinical_risk_model_v2.pkl"))
    print("AI Clinical Risk Model V2 loaded.")
except Exception as e:
    risk_model = None
    print(f"Warning: Could not load AI model. Error: {e}")

try:
    with open(Path(__file__).with_name("uk_grocery_db.json"), "r") as f:
        GROCERY_DB = json.load(f)
    print(f"CoFID Database loaded: {len(GROCERY_DB)} gold-standard items available.")
except Exception as e:
    GROCERY_DB = []
    print(f"Warning: Could not load uk_grocery_db.json. Error: {e}")


# --- DATA MODELS ---
class PatientProfile(BaseModel):
    patient_id: str
    condition_code: str  # "DIABETES", "COELIAC", "CVD", "NONE"

class OptimizationRequest(BaseModel):
    patient_profile: PatientProfile
    target_protein_g: Optional[float] = None
    current_symptom: str = "NONE"
    meal_type: str = "ANY" # NEW: Tells the AI what time of day it is

class BasketAnalysisRequest(BaseModel):
    age: int
    condition_code: int  # 0=None, 1=Coeliac, 2=Diabetes_T2
    total_carbs_g: float
    total_fiber_g: float
    total_sodium_mg: float # Required for V2 CVD Math


# --- DATABASE DATA MODEL ---
class TelemetryPayload(BaseModel):
    patient_email: str
    event_type: str
    event_description: str


# --- ENDPOINT: ASYNCHRONOUS AUDIT LOGGER ---
@app.post("/api/v1/db/telemetry")
def log_telemetry(payload: TelemetryPayload):
    """Silently logs frontend events into the relational database."""
    try:
        conn = sqlite3.connect("clinical_records.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO telemetry_logs (patient_email, event_type, event_description) VALUES (?, ?, ?)",
            (payload.patient_email, payload.event_type, payload.event_description)
        )
        conn.commit()
        conn.close()
        return {"status": "success", "db_insertion": "confirmed"}
    except Exception as e:
        # We don't want DB errors to crash the API during a demo
        return {"status": "error", "details": str(e)}


# --- ENDPOINT 1: CLINICAL SCREENING ENGINE ---
@app.post("/api/v1/engine/clinical-screening")
def clinical_screening(profile: PatientProfile):
    """
    Generates strict medical guardrails based on the Golden Trio conditions.
    """
    flags = {
        "block_high_gi": False,
        "require_gluten_free": False,
        "daily_sodium_limit_mg": None 
    }
    
    if profile.condition_code == "DIABETES":
        flags["block_high_gi"] = True
    elif profile.condition_code == "COELIAC":
        flags["require_gluten_free"] = True
    elif profile.condition_code == "CVD":
        # Strict NHS guideline: Max 2000mg sodium per day, we allocate 800mg for this meal/basket
        flags["daily_sodium_limit_mg"] = 800.0 

    return {
        "patient_id": profile.patient_id,
        "screening_status": "COMPLETED",
        "applied_clinical_flags": flags
    }


# --- ENDPOINT 2: DYNAMIC SYMPTOM & MEAL-AWARE OPTIMIZER ---
@app.post("/api/v1/engine/basket-optimizer")
def optimize_basket(request: OptimizationRequest):
    if not GROCERY_DB:
        raise HTTPException(status_code=500, detail="Database offline.")

    # Print flashy colored logs to your computer terminal!
    print(f"\n\033[94m[AI ENGINE] Request received for {request.patient_profile.patient_id}\033[0m")
    print(f"\033[93m[TELEMETRY] Condition: {request.patient_profile.condition_code} | Symptom: {request.current_symptom}\033[0m")
    print(f"\033[92m[MATH] Executing Adaptive Metabolic Heuristic Algorithm...\033[0m")

    # --- AUTONOMOUS AI PROTEIN DETERMINATION ---
    target_protein = request.target_protein_g
    if not target_protein: # If the user left it blank
        if request.meal_type == "Breakfast": target_protein = 30.0
        elif request.meal_type == "Lunch": target_protein = 40.0
        elif request.meal_type == "Dinner": target_protein = 45.0
        else: target_protein = 35.0

    flags = {
        "block_high_gi": False,
        "require_gluten_free": False,
        "daily_sodium_limit_mg": None,
        "block_fiber": False,
        "prioritize_fast_carbs": False
    }

    if request.patient_profile.condition_code == "DIABETES": flags["block_high_gi"] = True
    elif request.patient_profile.condition_code == "COELIAC":
        flags["require_gluten_free"] = True
    elif request.patient_profile.condition_code == "CVD":
        flags["daily_sodium_limit_mg"] = 800.0 

    if request.current_symptom == "GLUCOSE_SPIKE": flags["block_high_gi"] = True
    elif request.current_symptom == "BLOATING":
        flags["block_fiber"] = True
    elif request.current_symptom == "FATIGUE": flags["prioritize_fast_carbs"] = True

    valid_foods = []
    for item in GROCERY_DB:
        if flags["require_gluten_free"] and not item["is_gluten_free"]: continue
        if flags["block_high_gi"] and item["gi_index"] == "HIGH": continue
        if flags["block_fiber"] and item["macros_per_100g"]["fiber_g"] > 5.0: continue
        valid_foods.append(item)

    # --- THE MEAL HEURISTIC ENGINE ---
    breakfast_keywords = ["Oats", "Yogurt", "Eggs", "Banana", "Berries", "Almonds", "Bread"]

    # --- THE ADAPTIVE METABOLIC HEURISTIC ENGINE (YOUR NOVEL ALGORITHM) ---
    def get_algorithmic_score(food):
        # 1. Base Objective: Maximize Protein Density
        score = food["macros_per_100g"]["protein_g"]
        name = food["name"]

        # Safe extractions
        carbs = food["macros_per_100g"]["carbs_g"]
        fiber = food["macros_per_100g"]["fiber_g"]
        fat = food["macros_per_100g"].get("fat_g", 0.0) # Using .get() for safety

        # ----------------------------------------------------------------
        # NOVELTY A: The "Gastric Emptying" Post-Spike Stabilizer
        # ----------------------------------------------------------------
        # If the patient just spiked, we don't just ban sugar. We actively
        # heavily weight foods with Fiber and Fats, as these macro-nutrients
        # physically slow down digestion, creating a stabilizing glycemic floor.
        if request.current_symptom == "GLUCOSE_SPIKE":
            stabilization_factor = fiber + (fat * 0.5)
            score += (stabilization_factor * 15.0) # Massive algorithmic priority

        # ----------------------------------------------------------------
        # NOVELTY B: Type 1 vs Type 2 Metabolic Pathing
        # ----------------------------------------------------------------
        if request.patient_profile.condition_code == "DIABETES_T1":
            # T1D requires manual insulin dosing. High, unpredictable carb loads are dangerous.
            # We strictly penalize single items with >30g of carbs to force a balanced basket.
            if carbs > 30.0:
                score -= 50.0

        elif request.patient_profile.condition_code == "DIABETES_T2":
            # T2D is driven by insulin resistance. The algorithm hunts for the highest
            # Fiber-to-Carbohydrate ratio to ensure a slow, blunted metabolic response.
            if carbs > 0:
                ratio = fiber / carbs
                score += (ratio * 25.0) # Rewards foods where fiber makes up a large % of carbs

        # ----------------------------------------------------------------
        # Standard Meal-Time & Energy Routing
        # ----------------------------------------------------------------
        if flags["prioritize_fast_carbs"]:
            # For sudden fatigue/faintness, hunt for fast-absorbing energy
            score += (carbs / max(fiber, 0.1)) * 5.0

        is_breakfast_food = any(b in name for b in ["Oats", "Yogurt", "Eggs", "Banana", "Berries", "Almonds", "Bread"])
        if request.meal_type == "Breakfast" and is_breakfast_food:
            score += 50.0
        elif request.meal_type in ["Lunch", "Dinner"] and not is_breakfast_food:
            score += 20.0

        import random
        score += random.uniform(0.0, 5.0) # Stochastic variance to prevent repetitive menus
        return score

    sorted_foods = sorted(valid_foods, key=get_algorithmic_score, reverse=True)

    basket = []
    current_protein = 0.0
    current_sodium = 0.0

    for food in sorted_foods:
        if flags["daily_sodium_limit_mg"] is not None:
            if current_sodium + food["macros_per_100g"]["sodium_mg"] > flags["daily_sodium_limit_mg"]:
                continue 

        basket.append({"name": food["name"], "category": food.get("category", "Other")})
        current_protein += food["macros_per_100g"]["protein_g"]
        current_sodium += food["macros_per_100g"]["sodium_mg"]

        if current_protein >= target_protein: break

    return {
        "optimization_status": "CONVERGED" if current_protein >= target_protein else "PARTIAL",
        "patient_condition": request.patient_profile.condition_code,
        "symptom_adapted": request.current_symptom,
        "basket_items": basket,
        "macros_achieved": {"protein_g": round(current_protein, 1), "sodium_mg": round(current_sodium, 1)},
        # NEW: EXPOSE THE MATH TO THE FRONTEND
        "reasoning_log": [
            f"Detected {request.patient_profile.condition_code}. Adapting metabolic heuristic.",
            f"Symptom override: {request.current_symptom}. Adjusting macronutrient vectors.",
            "Hunting for optimal Fiber-to-Fat stabilization ratio." if request.current_symptom == "GLUCOSE_SPIKE" else "Optimizing for high-density protein yield.",
            f"Basket Converged. Yield: {round(current_protein, 1)}g Protein."
        ]
    }


# --- ENDPOINT 3: HL7 FHIR INTEROPERABILITY ---
@app.get("/api/v1/export/fhir/CarePlan/{patient_id}")
def export_fhir_careplan(patient_id: str):
    return {
        "resourceType": "CarePlan",
        "id": f"sm-{patient_id}-2026",
        "status": "active",
        "intent": "order",
        "category": [{"text": "Dietary Nutrition Plan"}],
        "subject": {"reference": f"Patient/{patient_id}"},
        "activity": [{"detail": {"kind": "NutritionOrder", "status": "in-progress"}}]
    }


# --- ENDPOINT 4: AI GLYCEMIC RISK PREDICTION ---
@app.post("/api/v1/engine/ai-risk-validation")
def validate_basket_with_ai(request: BasketAnalysisRequest):
    if risk_model is None:
        raise HTTPException(status_code=503, detail="AI model offline.")

    features = [[request.age, request.condition_code, request.total_carbs_g, request.total_fiber_g, request.total_sodium_mg]]
    predicted_risk = risk_model.predict(features)[0]

    if predicted_risk >= 8.0:
        safety_status = "CRITICAL_RISK: REJECT BASKET"
    elif predicted_risk >= 6.0:
        safety_status = "MODERATE_RISK: REQUIRE CLINICIAN APPROVAL"
    else:
        safety_status = "SAFE: AUTO-APPROVE"

    return {
        "prediction_status": "SUCCESS",
        "ai_analysis": {
            "predicted_glycemic_spike_1_to_10": round(predicted_risk, 2),
            "clinical_guardrail": safety_status
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)