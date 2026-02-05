import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { NutritionDisability } from "../types";
import { getUser, setUser } from "../services/storage";

export default function MedicalPage() {
  const nav = useNavigate();
  const user = getUser();
  if (!user) return null;

  const [nutritionDisability, setNutritionDisability] = useState<NutritionDisability>(
    user.profile?.nutritionDisability ?? "NONE"
  );
  const [disabilityNotes, setDisabilityNotes] = useState(
    user.profile?.disabilityNotes ?? ""
  );

  const needsNotes = nutritionDisability !== "NONE";

  function save(e: React.FormEvent) {
    e.preventDefault();

    if (!user.profile) return;

    if (needsNotes && disabilityNotes.trim().length < 5) {
      alert("Please add a short note so the system can adapt the plan.");
      return;
    }

    setUser({
      ...user,
      profile: {
        ...user.profile,
        nutritionDisability,
        disabilityNotes: disabilityNotes.trim(),
      },
    });

    nav("/app");
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <h1>Medical & Nutrition Needs</h1>
      <p>This helps us adapt meal planning and safety rules.</p>

      <form onSubmit={save}>
        <label>Nutritional disability or condition</label>
        <select
          value={nutritionDisability}
          onChange={(e) => setNutritionDisability(e.target.value as NutritionDisability)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        >
          <option value="NONE">None</option>
          <option value="DIABETES_T1">Diabetes (Type 1)</option>
          <option value="DIABETES_T2">Diabetes (Type 2)</option>
          <option value="COELIAC">Coeliac (gluten free)</option>
          <option value="IBS">IBS</option>
          <option value="CKD">Chronic Kidney Disease (CKD)</option>
          <option value="HYPERTENSION">Hypertension</option>
          <option value="PCOS">PCOS</option>
          <option value="EATING_DISORDER_SUPPORT">Eating disorder support</option>
          <option value="OTHER">Other</option>
        </select>

        <div style={{ marginTop: 12 }}>
          <label>Notes (required if not None)</label>
          <textarea
            value={disabilityNotes}
            onChange={(e) => setDisabilityNotes(e.target.value)}
            placeholder="Key considerations, restrictions, advice from clinician, etc."
            style={{ width: "100%", padding: 10, minHeight: 120, marginTop: 6 }}
          />
        </div>

        <button style={{ marginTop: 16, padding: 10, width: "100%" }}>
          Save and go to dashboard
        </button>
      </form>
    </div>
  );
}
