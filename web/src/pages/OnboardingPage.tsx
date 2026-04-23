import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, setUser } from "../services/storage";
import type { NutritionDisability, UserProfile } from "../types";

export default function OnboardingPage() {
  const nav = useNavigate();
  const user = getUser();

  // Biometrics
  const [firstName, setFirstName] = useState(user?.profile?.firstName || "");
  const [lastName, setLastName] = useState(user?.profile?.lastName || "");
  const [age, setAge] = useState<number>(user?.profile?.age || 30);
  const [heightCm, setHeightCm] = useState<number>(user?.profile?.heightCm || 170);
  const [weightKg, setWeightKg] = useState<number>(user?.profile?.weightKg || 70);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">(user?.profile?.gender || "MALE");

  // Medical & Dietary
  const [nutritionDisability, setNutritionDisability] = useState<NutritionDisability>(user?.profile?.nutritionDisability || "NONE");
  const [allergies, setAllergies] = useState((user?.profile?.allergies || []).join(", "));
  const [disabilityNotes, setDisabilityNotes] = useState(user?.profile?.disabilityNotes || "");

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const profile: UserProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age, heightCm, weightKg, gender,
      activityLevel: user?.profile?.activityLevel || "MODERATE",
      goal: user?.profile?.goal || "MAINTAIN",
      dietaryPreference: user?.profile?.dietaryPreference || "NONE",
      nutritionDisability,
      allergies: allergies.split(",").map((s) => s.trim()).filter(Boolean),
      disabilityNotes: disabilityNotes.trim(),
    };

    setUser({ ...user, profile });
    localStorage.setItem("sm_patient_profile", JSON.stringify(profile));

    const accounts = JSON.parse(localStorage.getItem("sm_accounts") || "{}");
    if (accounts[user.email]) {
      accounts[user.email].profile = profile;
      localStorage.setItem("sm_accounts", JSON.stringify(accounts));
    }

    nav("/app/profile"); // Instantly routes them to their new Medical Profile
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: "20px auto" }}>
        <h2 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>Clinical Intake Form</h2>
        <p style={{ marginBottom: '24px' }}>Please provide accurate biometric and medical data to calibrate the AI nutritional engine.</p>

        <form onSubmit={save}>
          <h4 style={{ color: '#2563eb', marginBottom: '12px' }}>Step 1: Patient Biometrics</h4>
          <div className="grid-2">
            <div><label>First Name</label><input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" required /></div>
            <div><label>Last Name</label><input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" required /></div>
          </div>
          <div className="grid-3" style={{ marginTop: '12px' }}>
            <div><label>Age</label><input type="number" value={age} onChange={e => setAge(Number(e.target.value))} placeholder="Age" required /></div>
            <div><label>Height (cm)</label><input type="number" value={heightCm} onChange={e => setHeightCm(Number(e.target.value))} placeholder="Height in cm" required /></div>
            <div><label>Weight (kg)</label><input type="number" value={weightKg} onChange={e => setWeightKg(Number(e.target.value))} placeholder="Weight in kg" required /></div>
          </div>
          <div style={{ marginTop: '12px' }}>
             <label>Biological Sex (For Baseline Metabolic Rate)</label>
             <select value={gender} onChange={e => setGender(e.target.value as "MALE" | "FEMALE" | "OTHER")} aria-label="Biological sex">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
             </select>
          </div>

          <h4 style={{ color: '#2563eb', marginTop: '32px', marginBottom: '12px' }}>Step 2: Medical Profile</h4>
          <div>
            <label>Primary Nutritional Condition</label>
            <select value={nutritionDisability} onChange={e => setNutritionDisability(e.target.value as NutritionDisability)} aria-label="Primary nutritional condition" style={{ border: nutritionDisability !== 'NONE' ? '2px solid #2563eb' : '1px solid #cbd5e1' }}>
              <option value="NONE">None</option>
              <option value="DIABETES_T1">Type 1 Diabetes (T1D)</option>
              <option value="DIABETES_T2">Type 2 Diabetes (T2D)</option>
              <option value="COELIAC">Coeliac Disease</option>
              <option value="CVD">Cardiovascular Disease / Hypertension</option>
              <option value="IBS">Irritable Bowel Syndrome (IBS)</option>
            </select>
          </div>
          
          <div style={{ marginTop: '12px' }}>
            <label>Known Food Allergies (Comma separated)</label>
            <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g., Peanuts, Shellfish, Soy" />
          </div>

          {nutritionDisability !== "NONE" && (
            <div style={{ marginTop: '12px' }}>
              <label>Clinical Notes / Physician Advice</label>
              <textarea value={disabilityNotes} onChange={e => setDisabilityNotes(e.target.value)} placeholder="Specific trigger foods, current medications, etc." />
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: '24px', padding: '14px' }}>
            Initialize Engine & Generate Profile
          </button>
        </form>
      </div>
    </div>
  );
}