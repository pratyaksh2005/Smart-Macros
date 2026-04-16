import { useEffect, useMemo, useState } from "react";
import type { GroceryItem, UserProfile } from "../../types";
import { getGrocery, getUser, setGrocery } from "../../services/storage";

type Category = GroceryItem["category"];
type ClinicalBasketResponse = {
  status: string;
  message: string;
  basket: Array<{
    name: string;
    category: Category;
    ai_flag?: string | null;
  }>;
};

type MedicalProfilePayload = {
  goal: UserProfile["goal"];
  dietary_preference: UserProfile["dietaryPreference"];
  nutrition_disability: UserProfile["nutritionDisability"];
  allergies: string[];
};

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

function buildMedicalProfile(profile?: UserProfile): MedicalProfilePayload {
  return {
    goal: profile?.goal ?? "MAINTAIN",
    dietary_preference: profile?.dietaryPreference ?? "NONE",
    nutrition_disability: profile?.nutritionDisability ?? "NONE",
    allergies: profile?.allergies ?? [],
  };
}

function basketToGroceryItems(response: ClinicalBasketResponse["basket"]): GroceryItem[] {
  return response.map((item) => ({
    id: uid(),
    name: item.name,
    quantity: "1",
    checked: false,
    category: item.category,
  }));
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);

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

  async function generate() {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationMessage("Analyzing medical profile & local grocery data...");

    const profilePayload = buildMedicalProfile(profile);
    const request = fetch("/api/generate-clinical-basket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profilePayload),
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await request;

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as ClinicalBasketResponse;
      setItems(basketToGroceryItems(data.basket));
      setGenerationMessage(data.message);
      return;
    } catch {
      setItems(starterList(profile));
      setGenerationMessage("Clinical rules engine fallback applied.");
    } finally {
      setIsGenerating(false);
      window.setTimeout(() => setGenerationMessage(null), 1800);
    }
  }

  return (
    <div className="grocery-tab">
      <div className="card">
        <div className="row grocery-header-row">
          <div>
            <h3>Grocery List</h3>
            <div className="badge">
              Total {counts.total} · Remaining {counts.remaining} · Done {counts.checked}
            </div>
          </div>

          <div className="row grocery-actions">
            <button className="btn-primary" onClick={generate}>
              {isGenerating ? "Generating..." : "Generate starter list"}
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

          <div className="grocery-filter-row">
            <label className="grocery-hide-checked">
              <input
                type="checkbox"
                checked={hideChecked}
                onChange={(e) => setHideChecked(e.target.checked)}
                className="grocery-item-checkbox"
              />
              Hide checked
            </label>
          </div>
        </div>

        <div className="grocery-status">
          {generationMessage ? (
            <div className="badge loading-badge">
              {isGenerating ? <span className="loading-spinner" aria-hidden="true" /> : null}
              <span>{generationMessage}</span>
            </div>
          ) : null}
        </div>

        <p className="grocery-description">
          Starter list adapts to your goal, diet preference, and nutrition disability selection.
        </p>
      </div>

      <div className="card">
        <h4>Add item</h4>

        <form onSubmit={addItem} className="grid-3 grocery-form">
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              aria-label="Category"
            >
              <option value="Protein">Protein</option>
              <option value="Carbs">Carbs</option>
              <option value="Fats">Fats</option>
              <option value="Veg">Veg</option>
              <option value="Fruit">Fruit</option>
              <option value="Dairy">Dairy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button className="btn-primary grocery-add-button">
            Add item
          </button>
        </form>
      </div>

      <div className="card">
        <div className="row grocery-items-header">
          <h4>Items</h4>
          <small>{filtered.length} shown</small>
        </div>

        <div className="hr" />

        {filtered.length === 0 ? (
          <p>No items match your filters. Add one or generate a starter list.</p>
        ) : (
          <div className="grocery-items-list">
            {filtered.map((i) => (
              <div
                key={i.id}
                className={i.checked ? "grocery-item-card grocery-item-card-checked" : "grocery-item-card"}
              >
                <input
                  type="checkbox"
                  checked={i.checked}
                  onChange={() => toggle(i.id)}
                  aria-label={`Toggle ${i.name}`}
                  className="grocery-item-checkbox"
                />

                <div>
                  <div className={i.checked ? "grocery-item-title grocery-item-title-checked" : "grocery-item-title"}>
                    {i.name}
                  </div>
                  <small className="grocery-item-meta">
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