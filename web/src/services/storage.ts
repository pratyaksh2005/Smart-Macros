import type { AuthUser, GroceryItem } from "../types";

const KEYS = {
  USER: "sm_user",
  GROCERY: "sm_grocery",
};

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(KEYS.USER);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(KEYS.USER);
}

export function getGrocery(): GroceryItem[] {
  const raw = localStorage.getItem(KEYS.GROCERY);
  return raw ? (JSON.parse(raw) as GroceryItem[]) : [];
}

export function setGrocery(items: GroceryItem[]): void {
  localStorage.setItem(KEYS.GROCERY, JSON.stringify(items));
}
