import { useEffect, useMemo, useState } from "react";
import type { GroceryItem, UserProfile } from "../../types";
import { getGrocery, getUser, setGrocery } from "../../services/storage";

type Category = GroceryItem["category"];

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function starterList(profile?: UserProfile): GroceryItem[] {
  const goal = profile?.goal ?? "MAINTAIN";
  const diet = profile?.dietaryPreference ?? "NONE";
  const disability = profile?.nutritionDisability ?? "NONE";

  const base: GroceryItem[] = [
    { id: uid(), name: "Chicken breast", quantity: "1 kg", checked: false, category: "Protein" },
    { id: uid(), name: "Eggs", quantity: "12", checked: false, category: "Protein" },
    { id: uid(), name: "Greek yogurt", quantity: "500 g", checked: false, category: "Dairy" },
    { id: uid(), name: "Rice", quantity: "1 kg", checked: false, category: "Carbs" },
    { id: uid(), name: "Oats", quantity: "1 pack", checked: false, category: "Carbs" },
    { id: uid(), name: "Olive oil", quantity: "1 bottle", checked: false, category: "Fats" },
    { id: uid(), name: "Broccoli", quantity: "2 heads", checked: false, category: "Veg" },
    { id: uid(), name: "Mixed salad", quantity: "1 bag", checked: false, category: "Veg" },
    { id: uid(), name: "Bananas", quantity: "6", checked: false, category: "Fruit" },
    { id: uid(), name: "Berries", quantity: "1 pack", checked: false, category: "Fruit" },
  ];

  const veganSwap: GroceryItem[] = [
    { id: uid(), name: "Tofu", quantity: "2 blocks", checked: false, category: "Protein" },
    { id: uid(), name: "Lentils", quantity: "500 g", checked: false, category: "Protein" },
    { id: uid(), name: "Chickpeas", quantity: "2 cans", checked: false, category: "Protein" },
    { id: uid(), name: "Plant yogurt", quantity: "500 g", checked: false, category: "Dairy" },
  ];

  const vegetarianSwap: GroceryItem[] = [
    { id: uid(), name: "Paneer", quantity: "400 g", checked: false, category: "Protein" },
    { id: uid(), name: "Cottage cheese", quantity: "500 g", checked: false, category: "Dairy" },
    { id: uid(), name: "Beans", quantity: "2 cans", checked: false, category: "Protein" },
  ];

  let list = base;

  if (diet === "VEGAN") {
    list = list
      .filter((i) => !["Chicken breast", "Eggs", "Greek yogurt"].includes(i.name))
      .concat(veganSwap);
  } else if (diet === "VEGETARIAN") {
    list = list
      .filter((i) => i.name !== "Chicken breast")
      .concat(vegetarianSwap);
  }

  if (goal === "BULK") {
    list = list.concat([
      { id: uid(), name: "Peanut butter", quantity: "1 jar", checked: false, category: "Fats" },
      { id: uid(), name: "Pasta", quantity: "1 pack", checked: false, category: "Carbs" },
    ]);
  } else if (goal === "CUT") {
    list = list.concat([
      { id: uid(), name: "Frozen veg", quantity: "1 bag", checked: false, category: "Veg" },
      { id: uid(), name: "Low-cal sauce", quantity: "1 bottle", checked: false, category: "Other" },
    ]);
  }

  // Simple demo-safe “medical-aware” tweak examples
  if (disability === "COELIAC") {
    list = list.map((i) =>
      i.name === "Pasta" ? { ...i, name: "Gluten-free pasta" } : i
    );
  }
  if (disability === "DIABETES_T1" || disability === "DIABETES_T2") {
    list = list.concat([
      { id: uid(), name: "High-fibre wraps", quantity: "1 pack", checked: false, category: "Carbs" },
    ]);
  }

  return list;
}

export default function GroceryTab() {
  const user = getUser();
  const profile = user?.profile;

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<Category>("Other");

  const [query, setQuery] = useState("");
  const [hideChecked, setHideChecked] = useState(false);

  useEffect(() => {
    setItems(getGrocery());
  }, []);

  useEffect(() => {
    setGrocery(items);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (hideChecked && i.checked) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.quantity.toLowerCase().includes(q)
      );
    });
  }, [items, query, hideChecked]);

  const counts = useMemo(() => {
    const total = items.length;
    const checked = items.filter((i) => i.checked).length;
    return { total, checked, remaining: total - checked };
  }, [items]);

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const q = quantity.trim();

    if (!n) return;

    const newItem: GroceryItem = {
      id: uid(),
      name: n,
      quantity: q || "1",
      category,
      checked: false,
    };

    setItems((prev) => [newItem, ...prev]);
    setName("");
    setQuantity("");
    setCategory("Other");
  }

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearChecked() {
    setItems((prev) => prev.filter((i) => !i.checked));
  }

  function clearAll() {
    if (!confirm("Clear the entire list?")) return;
    setItems([]);
  }

  function generate() {
    const list = starterList(profile);
    setItems(list);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3>Grocery List</h3>
            <div className="badge">
              Total {counts.total} · Remaining {counts.remaining} · Done {counts.checked}
            </div>
          </div>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn-primary" onClick={generate}>
              Generate starter list
            </button>
            <button onClick={clearChecked} disabled={!counts.checked}>
              Clear checked
            </button>
            <button className="btn-danger" onClick={clearAll} disabled={!counts.total}>
              Clear all
            </button>
          </div>
        </div>

        <div className="hr" />

        <div className="grid-2">
          <div>
            <label>Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items, category, quantity..."
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center", margin: 0 }}>
              <input
                type="checkbox"
                checked={hideChecked}
                onChange={(e) => setHideChecked(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              Hide checked
            </label>
          </div>
        </div>

        <p style={{ marginTop: 12 }}>
          Starter list adapts to your goal, diet preference, and nutrition disability selection.
        </p>
      </div>

      <div className="card">
        <h4>Add item</h4>

        <form onSubmit={addItem} className="grid-3" style={{ alignItems: "end" }}>
          <div>
            <label>Item</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken breast"
            />
          </div>

          <div>
            <label>Quantity</label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 1 kg"
            />
          </div>

          <div>
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option value="Protein">Protein</option>
              <option value="Carbs">Carbs</option>
              <option value="Fats">Fats</option>
              <option value="Veg">Veg</option>
              <option value="Fruit">Fruit</option>
              <option value="Dairy">Dairy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button className="btn-primary" style={{ gridColumn: "1 / -1" }}>
            Add item
          </button>
        </form>
      </div>

      <div className="card">
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <h4>Items</h4>
          <small>{filtered.length} shown</small>
        </div>

        <div className="hr" />

        {filtered.length === 0 ? (
          <p>No items match your filters. Add one or generate a starter list.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((i) => (
              <div
                key={i.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: i.checked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                }}
              >
                <input
                  type="checkbox"
                  checked={i.checked}
                  onChange={() => toggle(i.id)}
                  style={{ width: 18, height: 18 }}
                />

                <div>
                  <div
                    style={{
                      fontWeight: 650,
                      textDecoration: i.checked ? "line-through" : "none",
                      color: i.checked ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.92)",
                    }}
                  >
                    {i.name}
                  </div>
                  <small>
                    {i.quantity} · {i.category}
                  </small>
                </div>

                <button onClick={() => toggle(i.id)}>
                  {i.checked ? "Undo" : "Done"}
                </button>

                <button className="btn-danger" onClick={() => remove(i.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}