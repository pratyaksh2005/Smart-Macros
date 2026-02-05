import { getUser } from "../../services/storage";

export default function WorkoutTab() {
  const user = getUser();
  const goal = user?.profile?.goal ?? "MAINTAIN";

  const plan =
    goal === "CUT"
      ? ["Mon: Upper (light)", "Wed: Lower (light)", "Fri: Full body", "2x Zone 2 cardio"]
      : goal === "BULK"
      ? ["Mon: Push", "Tue: Pull", "Thu: Legs", "Sat: Upper", "Optional cardio 1x"]
      : ["Mon: Upper", "Wed: Lower", "Fri: Full body", "1–2x cardio"];

  return (
    <div style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #eee" }}>
      <h3 style={{ marginTop: 0 }}>Workout Plan</h3>
      <ul>
        {plan.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
