from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from pathlib import Path
import joblib
import json

app = FastAPI(title="Smart Macros Clinical Engine V3 - Distinction Edition")

# --- LOAD AI MODEL & LOCAL DATABASE ---
try:
    risk_model = joblib.load(Path(__file__).with_name("clinical_risk_model.pkl"))
    print("✅ AI Clinical Risk Model loaded.")
except Exception as e:
    risk_model = None
    print(f"⚠️ Warning: Could not load AI model. Error: {e}")

try:
    with open(Path(__file__).with_name("uk_grocery_db.json"), "r") as f:
        GROCERY_DB = json.load(f)
    print(f"✅ CoFID Database loaded: {len(GROCERY_DB)} gold-standard items available.")
except Exception as e:
    GROCERY_DB = []
    print(f"⚠️ Warning: Could not load uk_grocery_db.json. Error: {e}")


# --- DATA MODELS ---
class PatientProfile(BaseModel):
    patient_id: str
    condition_code: str  # "DIABETES", "COELIAC", "CVD", "NONE"

class OptimizationRequest(BaseModel):
    patient_profile: PatientProfile
    target_protein_g: float
    budget_pennies: int

class BasketAnalysisRequest(BaseModel):
    age: int
    condition_code: int  # 0=None, 1=Coeliac, 2=Diabetes_T2
    total_carbs_g: float
    total_fiber_g: float


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


# --- ENDPOINT 2: MULTI-OBJECTIVE OPTIMIZER (CONSTRAINED GREEDY) ---
@app.post("/api/v1/engine/basket-optimizer")
def optimize_basket(request: OptimizationRequest):
    """
    Solves the conflicting constraints: Maximize Protein, Minimize Cost, Respect Medical Guardrails.
    """
    if not GROCERY_DB:
        raise HTTPException(status_code=500, detail="Database offline.")

    # 1. Run the patient through the screening engine first
    screening = clinical_screening(request.patient_profile)
    flags = screening["applied_clinical_flags"]

    # 2. Filter the database (Hard Constraints)
    valid_foods = []
    for item in GROCERY_DB:
        # Check Coeliac Guardrail
        if flags["require_gluten_free"] and not item["is_gluten_free"]:
            continue
        # Check Diabetes Guardrail
        if flags["block_high_gi"] and item["gi_index"] == "HIGH":
            continue
        valid_foods.append(item)

    # 3. Sort by Protein-to-Penny Ratio (The Maximization Objective)
    sorted_foods = sorted(
        valid_foods, 
        key=lambda x: (x["macros_per_100g"]["protein_g"] / max(x["price_pennies"], 1)), 
        reverse=True
    )

    # 4. Pack the Knapsack (Evaluate Rolling Constraints like Budget and Sodium)
    basket = []
    current_protein = 0.0
    total_cost = 0
    current_sodium = 0.0

    for food in sorted_foods:
        # Check if we can afford it
        if total_cost + food["price_pennies"] > request.budget_pennies:
            continue
            
        # Check CVD Sodium Guardrail dynamically
        if flags["daily_sodium_limit_mg"] is not None:
            if current_sodium + food["macros_per_100g"]["sodium_mg"] > flags["daily_sodium_limit_mg"]:
                continue # Skip this item to save the patient's heart (e.g., skips sausages)

        # Add to basket
        basket.append(food["name"])
        current_protein += food["macros_per_100g"]["protein_g"]
        total_cost += food["price_pennies"]
        current_sodium += food["macros_per_100g"]["sodium_mg"]

        # Stop if we hit our protein goal
        if current_protein >= request.target_protein_g:
            break

    return {
        "optimization_status": "CONVERGED" if current_protein >= request.target_protein_g else "PARTIAL_CONVERGENCE",
        "patient_condition": request.patient_profile.condition_code,
        "basket_items": basket,
        "macros_achieved": {
            "protein_g": round(current_protein, 1),
            "sodium_mg": round(current_sodium, 1)
        },
        "financials": {
            "total_cost_gbp": round(total_cost / 100, 2),
            "budget_remaining_gbp": round((request.budget_pennies - total_cost) / 100, 2)
        }
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

    features = [[request.age, request.condition_code, request.total_carbs_g, request.total_fiber_g]]
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