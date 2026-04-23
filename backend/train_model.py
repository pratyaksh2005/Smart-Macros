import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib

print("INITIALIZING SYNTHETIC DATA GENERATION (n=1000)...")

# 1. GENERATE SYNTHETIC CLINICAL COHORT
np.random.seed(42)
n_samples = 1000

# Features: Age, Condition (0=None, 1=Coeliac, 2=Diabetes_T2), Basket Carbs (g), Basket Fiber (g)
ages = np.random.randint(18, 80, n_samples)
conditions = np.random.choice([0, 1, 2], n_samples, p=[0.5, 0.2, 0.3])
basket_carbs = np.random.uniform(20, 150, n_samples)
basket_fiber = np.random.uniform(0, 30, n_samples)

# Target: Glycemic Spike Risk (1.0 to 10.0)
# The "Ground Truth" formula (hidden from the model, it must learn this)
# More carbs = higher spike. Fiber reduces spike. Diabetics have a 1.5x multiplier on carbs.
base_risk = (basket_carbs * 0.05) - (basket_fiber * 0.1)
diabetic_penalty = np.where(conditions == 2, (basket_carbs * 0.03), 0)
noise = np.random.normal(0, 0.5, n_samples)

# Calculate final risk and clip it between 1.0 and 10.0
glycemic_risk = np.clip(base_risk + diabetic_penalty + noise + 2.0, 1.0, 10.0)

df = pd.DataFrame({
    'age': ages,
    'condition_code': conditions,
    'total_carbs_g': basket_carbs,
    'total_fiber_g': basket_fiber,
    'glycemic_risk': glycemic_risk
})

# 2. TRAIN THE MACHINE LEARNING MODEL
print("TRAINING RANDOM FOREST REGRESSOR...")
X = df[['age', 'condition_code', 'total_carbs_g', 'total_fiber_g']]
y = df['glycemic_risk']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Using Random Forest (A "Glass-box" ensemble model, perfect for clinical explainability)
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# 3. EVALUATE AND EXPORT
predictions = model.predict(X_test)
mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print(f"MODEL TRAINING COMPLETE.")
print(f"📊 ACADEMIC METRICS FOR FYP REPORT:")
print(f"   - Mean Squared Error (MSE): {mse:.4f} (Lower is better)")
print(f"   - R-Squared (R2): {r2:.4f} (Closer to 1.0 is better)")

# Save the trained AI model to the backend folder
joblib.dump(model, "clinical_risk_model.pkl")
print("💾 Model saved to disk as 'clinical_risk_model.pkl'. Ready for API integration.")