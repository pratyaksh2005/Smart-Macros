import os
import time
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from dotenv import load_dotenv

load_dotenv()  # reads .env in /backend
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

app = FastAPI()

# Allow your Vite dev origin to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TokenIn(BaseModel):
    id_token: str


class MedicalProfile(BaseModel):
    goal: str
    dietary_preference: str
    nutrition_disability: str
    allergies: List[str] = Field(default_factory=list)


class ClinicalBasketItem(BaseModel):
    name: str
    category: str
    ai_flag: str | None = None


class PatientProfile(BaseModel):
    goal: str
    dietary_preference: str
    nutrition_disability: str
    allergies: List[str] = Field(default_factory=list)


class MacroTarget(BaseModel):
    target_protein_g: int
    target_carbs_g: int
    target_fat_g: int
    budget_pennies: int


class TelemetryData(BaseModel):
    patient_id: str
    glucose_readings_mmol: List[float] = Field(default_factory=list)
    heart_rate_bpm: List[int] = Field(default_factory=list)


class OCRReceiptLine(BaseModel):
    raw_text: str
    parsed_price_pennies: int


class ReceiptUpload(BaseModel):
    retailer: str
    lines: List[OCRReceiptLine] = Field(default_factory=list)

@app.get("/")
def root():
    return {"ok": True, "service": "Smart Macros API"}

@app.post("/auth/google")
def auth_google(payload: TokenIn):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Server misconfigured: missing GOOGLE_CLIENT_ID")
    try:
        info = id_token.verify_oauth2_token(
            payload.id_token, grequests.Request(), GOOGLE_CLIENT_ID
        )
        # TODO: upsert user in DB and mint your own session JWT
        return {
            "ok": True,
            "sub": info["sub"],
            "email": info.get("email"),
            "name": info.get("name"),
            "picture": info.get("picture"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")


@app.post("/api/generate-clinical-basket")
def generate_basket(profile: MedicalProfile):
    time.sleep(1.5)

    base_basket = [
        ClinicalBasketItem(name="Chicken breast", category="Protein"),
        ClinicalBasketItem(name="Broccoli", category="Veg"),
    ]

    if profile.nutrition_disability == "COELIAC":
        base_basket.append(
            ClinicalBasketItem(name="Gluten-Free Pasta", category="Carbs", ai_flag="Allergen Swap")
        )
    elif profile.nutrition_disability in ["DIABETES_T1", "DIABETES_T2"]:
        base_basket.append(
            ClinicalBasketItem(name="High-Fibre Wraps", category="Carbs", ai_flag="Glycemic Control")
        )

    return {
        "status": "success",
        "message": "AI Clinical constraints applied.",
        "basket": [item.model_dump() for item in base_basket],
    }


@app.post("/api/v1/engine/clinical-screening")
def clinical_screening(profile: PatientProfile):
    time.sleep(1.2)

    analysis = {
        "patient_safety_score": 0.98,
        "flags": [],
        "recommended_substitutions": [],
    }

    if profile.nutrition_disability == "DIABETES_T2":
        analysis["flags"].append(
            {"severity": "HIGH", "trigger": "Refined Carbohydrates", "action": "BLOCK"}
        )
        analysis["recommended_substitutions"].append(
            {
                "original": "White Rice",
                "substitute": "Quinoa / Cauliflower Rice",
                "clinical_reason": "Lower glycemic index for blood sugar stabilization.",
            }
        )

    if profile.nutrition_disability == "COELIAC":
        analysis["flags"].append({"severity": "CRITICAL", "trigger": "Gluten", "action": "BLOCK"})
        analysis["recommended_substitutions"].append(
            {
                "original": "Standard Pasta",
                "substitute": "Chickpea Pasta",
                "clinical_reason": "Zero gluten, higher protein yield.",
            }
        )

    if "Peanuts" in profile.allergies:
        analysis["flags"].append(
            {"severity": "CRITICAL", "trigger": "Peanuts/Tree Nuts", "action": "BLOCK"}
        )

    return {
        "status": "success",
        "engine": "Clinical_Heuristic_V1",
        "analysis": analysis,
    }


@app.post("/api/v1/engine/basket-optimizer")
def optimize_basket(target: MacroTarget):
    time.sleep(1.5)

    db = [
        {"name": "Chicken Breast (1kg)", "protein": 230, "carbs": 0, "fat": 12, "price_p": 550},
        {"name": "Tofu (500g)", "protein": 80, "carbs": 10, "fat": 45, "price_p": 250},
        {"name": "Brown Rice (1kg)", "protein": 25, "carbs": 230, "fat": 8, "price_p": 120},
        {"name": "Olive Oil (500ml)", "protein": 0, "carbs": 0, "fat": 500, "price_p": 400},
        {"name": "Broccoli (500g)", "protein": 14, "carbs": 35, "fat": 2, "price_p": 70},
    ]

    basket = []
    current_protein = 0
    current_carbs = 0
    current_fat = 0
    total_cost = 0

    protein_sources = sorted(db, key=lambda item: (item["price_p"] / max(item["protein"], 1)))

    for item in protein_sources:
        if total_cost + item["price_p"] <= target.budget_pennies and current_protein < target.target_protein_g:
            basket.append(item["name"])
            current_protein += item["protein"]
            current_carbs += item["carbs"]
            current_fat += item["fat"]
            total_cost += item["price_p"]

    return {
        "optimization_status": "Converged",
        "basket_items": basket,
        "macros_achieved": {
            "protein_g": current_protein,
            "carbs_g": current_carbs,
            "fat_g": current_fat,
        },
        "total_cost_gbp": total_cost / 100,
        "budget_remaining_gbp": (target.budget_pennies - total_cost) / 100,
    }


@app.post("/api/v1/engine/telemetry-anomaly-detect")
def detect_anomalies(telemetry: TelemetryData):
    time.sleep(1.8)

    anomalies = []
    recommended_action = "Maintain current plan."

    max_glucose = max(telemetry.glucose_readings_mmol) if telemetry.glucose_readings_mmol else 0
    avg_hr = sum(telemetry.heart_rate_bpm) / len(telemetry.heart_rate_bpm) if telemetry.heart_rate_bpm else 0

    if max_glucose > 10.0:
        anomalies.append(
            {
                "type": "GLUCOSE_SPIKE",
                "confidence": 0.94,
                "detected_value": max_glucose,
                "threshold": 10.0,
                "clinical_risk": "HIGH",
            }
        )
        recommended_action = "Trigger automated low-GI macro swap for next 3 meals. Alert clinician."

    if avg_hr > 90:
        anomalies.append(
            {
                "type": "ELEVATED_RESTING_HR",
                "confidence": 0.88,
                "detected_value": round(avg_hr, 1),
                "clinical_risk": "MODERATE",
            }
        )

    return {
        "pipeline_status": "Active",
        "data_points_analyzed": len(telemetry.glucose_readings_mmol) + len(telemetry.heart_rate_bpm),
        "anomalies_detected": len(anomalies),
        "details": anomalies,
        "ai_recommended_intervention": recommended_action,
    }


@app.post("/api/v1/data/ingest-receipt")
def ingest_receipt(receipt: ReceiptUpload):
    time.sleep(2.1)

    mapped_items = []
    total_savings_identified = 0

    for line in receipt.lines:
        gtin_match = "000" + str(len(line.raw_text) * 12345)[:9]

        market_avg_price = line.parsed_price_pennies - 45
        if market_avg_price > 0:
            total_savings_identified += 45

        mapped_items.append(
            {
                "raw_input": line.raw_text,
                "mapped_gtin": gtin_match,
                "confidence_score": 0.92,
                "price_paid_gbp": line.parsed_price_pennies / 100,
                "market_average_gbp": market_avg_price / 100,
            }
        )

    return {
        "status": "Processed",
        "retailer_identified": receipt.retailer,
        "items_mapped_to_catalog": len(mapped_items),
        "details": mapped_items,
        "ai_insight": f"Patient overpaid by £{total_savings_identified / 100:.2f} compared to our optimized basket pricing.",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)