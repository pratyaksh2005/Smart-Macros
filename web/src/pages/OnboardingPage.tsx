import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ActivityLevel, Goal, UserProfile } from "../types";
import { getUser, setUser } from "../services/storage";

export default function OnboardingPage() {
  const nav = useNavigate();
  const user = getUser();

  const [firstName, setFirstName] = useState(user?.profile?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.profile?.lastName ?? "");
  const [age, setAge] = useState<number>(user?.profile?.age ?? 20);
  const [heightCm, setHeightCm] = useState<number>(user?.profile?.heightCm ?? 170);
  const [weightKg, setWeightKg] = useState<number>(user?.profile?.weightKg ?? 70);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    user?.profile?.activityLevel ?? "MODERATE"
  );
  const [goal, setGoal] = useState<Goal>(user?.profile?.goal ?? "MAINTAIN");

  const [dietaryPreference, setDietaryPreference] = useState<UserProfile["dietaryPreference"]>(
    user?.profile?.dietaryPreference ?? "NONE"
  );

  const [allergies, setAllergies] = useState(
    (user?.profile?.allergies ?? []).join(", ")
  );

  if (!user) return null;

  function save(e: React.FormEvent) {
    e.preventDefault();

    const profile: UserProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age,
      heightCm,
      weightKg,
      activityLevel,
      goal,
      dietaryPreference,
      allergies: allergies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      nutritionDisability: user.profile?.nutritionDisability ?? "NONE",
      disabilityNotes: user.profile?.disabilityNotes ?? "",
    };

    setUser({ ...user, profile });
    nav("/medical");
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <h1>Onboarding</h1>
      <p>Tell us about you.</p>

      <form onSubmit={save}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </div>
          <div>
            <label>Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <label>Age</label>
            <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} style={{ width: "100%", padding: 10 }} />
          </div>
          <div>
            <label>Height (cm)</label>
            <input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} style={{ width: "100%", padding: 10 }} />
          </div>
          <div>
            <label>Weight (kg)</label>
            <input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} style={{ width: "100%", padding: 10 }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <label>Activity level</label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} style={{ width: "100%", padding: 10 }}>
              <option value="SEDENTARY">Sedentary</option>
              <option value="LIGHT">Light</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label>Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} style={{ width: "100%", padding: 10 }}>
              <option value="CUT">Cut</option>
              <option value="MAINTAIN">Maintain</option>
              <option value="BULK">Bulk</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Dietary preference</label>
          <select value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value as any)} style={{ width: "100%", padding: 10 }}>
            <option value="NONE">None</option>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="VEGAN">Vegan</option>
            <option value="HALAL">Halal</option>
            <option value="KOSHER">Kosher</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Allergies (comma separated)</label>
          <input value={allergies} onChange={(e) => setAllergies(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </div>

        <button style={{ marginTop: 16, padding: 10, width: "100%" }}>
          Save and continue
        </button>
      </form>
    </div>
  );
}
