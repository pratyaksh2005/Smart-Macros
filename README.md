## 🌐 Live Access
The software is currently deployed and hosted live at: **[https://smartmacros.pratyaksh.net](https://smartmacros.pratyaksh.net)**

---

## 🔐 System Access & Authentication

The platform features a multi-tenant architecture with distinct portals for Patients and Clinicians. 

### 1. The Clinician Portal (EHR Dashboard)
To evaluate the system from a medical professional's perspective, use the following pre-configured credentials:
* **Email:** `clinician@pratyaksh.uk`
* **Password:** `1234`

### 2. The Patient Portal
To evaluate the system as a patient, you can utilize the complete **Sign Up** flow to create a fresh profile:
1. On the login screen, click **Patient Portal**.
2. Click **"Create an account"** at the bottom.
3. Enter a mock email and password.
4. Complete the **Clinical Intake Form** to calibrate your biometric and medical profile (e.g., configuring Type 1/Type 2 Diabetes or Cardiovascular constraints).

*Alternatively, if a pre-seeded test patient is active in your cache, you can log in with:*
* **Email:** `patient@smartmacros.uk`
* **Password:** `password`

---

## 🛠️ How to Use the Patient Diet Engine

Once logged in as a patient, you have access to the full Adaptive Nutrition Engine:

1. **Baseline Schedule:** Use the gear icon (⚙️) to set your baseline meal times or disable meals you permanently skip.
2. **Clinical Meal Synthesis:** Select a meal type and hit **Generate**. The AI will run an Adaptive Metabolic Heuristic to suggest a meal optimized for your specific clinical condition.
3. **Symptom Reporting:** If you experience an adverse event (e.g., a "Glucose Spike"), log it in the Physiological Status pad. The AI will instantly adjust its internal algorithms (e.g., prioritizing Gastric Emptying multipliers like high-fiber foods) for your *next* generated meal.
4. **Calendar & History:** Use the Date Picker at the top right of the Clinical Log to view historical dietary intake and manual off-plan entries.
5. **Secure Inbox:** Navigate to the "Secure Inbox" tab to send direct, simulated messages to your primary care clinician.
"""