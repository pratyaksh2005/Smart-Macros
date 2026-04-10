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
    <div className="card">
      <h3>Meal Plan</h3>
      <ol>
        {meals.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ol>
      <p style={{ marginTop: 12, color: "#444" }}>
        Template Plan.
      </p>
    </div>
  );
}