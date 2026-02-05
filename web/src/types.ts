export type NutritionDisability =
  | "NONE"
  | "DIABETES_T1"
  | "DIABETES_T2"
  | "COELIAC"
  | "IBS"
  | "CKD"
  | "HYPERTENSION"
  | "PCOS"
  | "EATING_DISORDER_SUPPORT"
  | "OTHER";

export type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "HIGH";
export type Goal = "CUT" | "MAINTAIN" | "BULK";

export type UserProfile = {
  firstName: string;
  lastName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietaryPreference: "NONE" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER";
  allergies: string[];
  nutritionDisability: NutritionDisability;
  disabilityNotes?: string;
};

export type AuthUser = {
  email: string;
  createdAt: string;
  profile?: UserProfile;
};

export type GroceryItem = {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category: "Protein" | "Carbs" | "Fats" | "Veg" | "Fruit" | "Dairy" | "Other";
};