import { getUser } from "../../services/storage";

export default function MealsTab() {
  const user = getUser();
  const pref = user?.profile?.dietaryPreference ?? "NONE";

  const meals =
    pref === "VEGAN"
      ? ["Breakfast: Oats + berries", "Lunch: Lentil bowl", "Dinner: Tofu stir-fry"]
      : pref === "VEGETARIAN"
      ? ["Breakfast: Greek yogurt + fruit", "Lunch: Paneer wrap", "Dinner: Veg chilli"]
      : ["Breakfast: Eggs + toast", "Lunch: Chicken rice bowl", "Dinner: Salmon + veg"];

  return (
    <div style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #eee" }}>
      <h3 style={{ marginTop: 0 }}>Meal Plan</h3>
      <ol>
        {meals.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ol>
      <p style={{ marginTop: 12, color: "#444" }}>
        This is a template plan for IPD. Later it becomes AI-generated and clinician-aware.
      </p>
    </div>
  );
}
