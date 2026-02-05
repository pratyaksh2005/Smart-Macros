import { useNavigate } from "react-router-dom";
import { getUser } from "../../services/storage";

export default function ProfileTab() {
  const nav = useNavigate();
  const user = getUser();

  if (!user?.profile) {
    return (
      <div style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #eee" }}>
        <h3 style={{ marginTop: 0 }}>Profile</h3>
        <p>No profile found.</p>
        <button onClick={() => nav("/onboarding")} style={{ padding: "10px 12px" }}>
          Go to onboarding
        </button>
      </div>
    );
  }

  const p = user.profile;

  return (
    <div style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #eee" }}>
      <h3 style={{ marginTop: 0 }}>Profile</h3>
      <p><b>Name:</b> {p.firstName} {p.lastName}</p>
      <p><b>Goal:</b> {p.goal}</p>
      <p><b>Activity:</b> {p.activityLevel}</p>
      <p><b>Diet:</b> {p.dietaryPreference}</p>
      <p><b>Allergies:</b> {p.allergies.length ? p.allergies.join(", ") : "None"}</p>
      <p><b>Nutrition disability:</b> {p.nutritionDisability}</p>
      {p.disabilityNotes ? <p><b>Notes:</b> {p.disabilityNotes}</p> : null}

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={() => nav("/onboarding")} style={{ padding: "10px 12px" }}>
          Edit onboarding
        </button>
        <button onClick={() => nav("/medical")} style={{ padding: "10px 12px" }}>
          Edit medical
        </button>
      </div>
    </div>
  );
}
